import { stateMachine, State, Action } from 'ts-checked-fsm'
import Debug from 'debug'

import { MANUFACTURER_ID, FirmwareAnswer } from './constants'
import { getCommandId, isLumatoneMessage, messageIsResponseToMessage } from './sysex'

import type { MidiDevice  } from './device'
import type { InputEventSysex, Output } from 'webmidi'
import type { EncodedSysex } from './sysex'

const debug = Debug('midi-driver')
type Timeout = ReturnType<typeof setTimeout>

const RECIEVE_TIMEOUT_MS = 2000
const BUSY_RETRY_TIMEOUT_MS = 500


/**
 * The Midi driver is a state machine with the following states:
 * 
 * - idle: we have nothing to send, and we're not awaiting anything from the device
 * - response-pending: we've sent a command to the device and we're waiting for a response
 * - device-busy: we've sent a command to the device and they told us to back off, so we're waiting for a retry timer to expire
 * 
 */
type FSMState = State<"idle", IdleStateData> 
  | State<"response-pending", ResponsePendingStateData> 
  | State<"device-busy", DeviceBusyStateData>

type FSMAction = Action<'submit-command', SubmitCommandPayload>
  | Action<'response-recieved', ResponseRecievedPayload>
  | Action<'response-timed-out', {}>
  | Action<'ready-to-retry', {}>

/**
 * Internal state data for the idle state.
 */
type IdleStateData = {
  device: MidiDevice,
  sendQueue: readonly EncodedSysex[],
}

/**
 * Internal state data for response-pending state.
 */
type ResponsePendingStateData = {
  device: MidiDevice,
  sendQueue: readonly EncodedSysex[],
  commandAwaitingResponse: EncodedSysex,
  receiveTimeout: Timeout,
}

/**
 * Internal state data for device-busy state
 */
type DeviceBusyStateData = {
  device: MidiDevice,
  sendQueue: readonly EncodedSysex[],
  retryTimeout: Timeout,
}

/**
 * Payload for submit-command action
 */
type SubmitCommandPayload = {
  command: EncodedSysex,
}

/**
 * Payload for response-recieved action
 */
type ResponseRecievedPayload = {
  response: EncodedSysex,
}


/**
 * Listeners are informed of interesting events by having various callbacks invoked.
 * All callbacks are optional and will be invoked only if they exist.
 */
export interface MidiListener {
  midiCommandSent?: (command: EncodedSysex) => void,
  midiResponseRecieved?: (response: EncodedSysex, initiatingCommand: EncodedSysex) => void
  midiCommandTimedOut?: (command: EncodedSysex) => void,
  midiUnknownMessageRecieved?: (msg: EncodedSysex) => void,
}

export class MidiDriver {
  #state: FSMState
  #nextState // thank god for type inference...
  #listeners: MidiListener[] = []

  /**
   * Add an event listener.
   * @param l a MidiListenr
   */
  public addListener(l: MidiListener) {
    this.#listeners.push(l)
  }

  /**
   * Create a new MidiDriver using the target Midi device I/O.
   * 
   * Note that this driver assumes that the given device is a Lumatone
   * and doesn't try to detect the manufacturer - things will probably
   * just break silently if you give it the wrong device.
   * 
   * @param device Lumatone midi input and output devices.
   */
  constructor(device: MidiDevice) {
    this.#state = { stateName: 'idle', sendQueue: [], device }
    device.input.addListener('sysex', undefined, this.#onSysexRecieved)

    // Define the state machine.

    const { nextState } = stateMachine()
      .state<'idle', IdleStateData>('idle')
      .state<'response-pending', ResponsePendingStateData>('response-pending')
      .state<'device-busy', DeviceBusyStateData>('device-busy')
      .transition('idle', 'idle')
      .transition('idle', 'response-pending')
      .transition('response-pending', 'idle')
      .transition('response-pending', 'response-pending')
      .transition('response-pending', 'device-busy')
      .transition('device-busy', 'response-pending')
      .transition('device-busy', 'device-busy')
      .transition('device-busy', 'idle')
      .action<'submit-command', SubmitCommandPayload>('submit-command')
      .action<'response-recieved', ResponseRecievedPayload>('response-recieved')
      .action('response-timed-out')
      .action('ready-to-retry')
      .actionHandler('idle', 'submit-command', (s, a) => {
        const { command } = a
        const { sendQueue: q, ...internalState } = s
        return this.#processQueue({ ...internalState, sendQueue: [...q, command] })
      })
      .actionHandler('response-pending', 'submit-command', (s, a) => {
        const { command } = a
        const { sendQueue, ...state } = s
        return {
          sendQueue: [...sendQueue, command],
          ...state,
        } as const
      })
      .actionHandler('device-busy', 'submit-command', (s, a) => {
        const { command } = a
        const { sendQueue, ...state } = s
        return {
          sendQueue: [...sendQueue, command],
          ...state,
        } as const
      })
      .actionHandler('response-pending', 'response-recieved', (s, a) => {
        const { response } = a
        const { stateName, commandAwaitingResponse, receiveTimeout, ...internalState } = s
        clearTimeout(receiveTimeout)

        const currentState = s
        if (!commandAwaitingResponse) {
          debug('recieved unexpected response', response)
          // send next message or switch to idle state
          this.#notifyUnexpectedMessage(response)
          return this.#processQueue(currentState)
        }
        if (!messageIsResponseToMessage(commandAwaitingResponse, response)) {
          debug('recieved response that does not match expected response', response)
          // send next message or switch to idle state
          this.#notifyUnexpectedMessage(response)
          return this.#processQueue(currentState)
        }
        const answer = answerState(response)
        if (answer === FirmwareAnswer.BUSY) {
          // device is busy
          // re-enqueue command and set retry timeout
          const { sendQueue: q, ...s } = internalState
          const sendQueue = [commandAwaitingResponse, ...q]
          const retryTimeout = setTimeout(this.#triggerRetry, BUSY_RETRY_TIMEOUT_MS)
          return {
            stateName: 'device-busy',
            sendQueue: sendQueue,
            retryTimeout,
            ...s,
          } as const
        }
        if (answer === FirmwareAnswer.STATE) {
          debug('Device is in demo mode! All commands will be ignored until demo mode ends.')
          // send next message or switch to idle state
          return this.#processQueue(currentState)
        }
        // notify listeners
        this.#notifyResponseRecieved(response, commandAwaitingResponse)

        // send next message or switch to idle state
        return this.#processQueue(currentState)
      })
      .actionHandler('response-pending', 'response-timed-out', (s) => {
        debug('timed out waiting for response')
        if (s.commandAwaitingResponse) {
          this.#notifyResponseTimedOut(s.commandAwaitingResponse)
        }
        return this.#processQueue(s)
      })
      .actionHandler('device-busy', 'ready-to-retry', (s) => {
        return this.#processQueue(s)
      })
      .done()
      this.#nextState = nextState
  }

  // --- midi interactions ---

  /**
   * Sends a sysex message to the midi output device and starts a recieve timeout.
   * @param output the midi output device
   * @param cmd an encoded sysex command (without manufacturer id prefix)
   * @returns handle to a timeout that will fire after RECIEVE_TIMEOUT_MS have elapsed
   */
  #sendToDevice(output: Output, cmd: EncodedSysex): Timeout {
      output.sendSysex(MANUFACTURER_ID, [...cmd])
      return setTimeout(this.#triggerRecieveTimeout, RECIEVE_TIMEOUT_MS)
  }

  /**
   * Midi input callback. Invoked when a sysex message is recieved from input device.
   * @param e midi input event
   */
  #onSysexRecieved(e: InputEventSysex) {
    debug('sysex recieved', getCommandId(e.data))
    let msg = [...e.data]

    // trim the "sysex start" and "sysex end" marker bytes
    if (msg[0] === 0xF0) {
      msg = msg.slice(1)
    }
    if (msg[msg.length-1] === 0x7F) {
      msg = msg.slice(0, -1)
    }
    if (!isLumatoneMessage(msg)) {
      debug('recieved non-lumatone message')
    }

    this.#state = this.#nextState(this.#state, {
      actionName: 'response-recieved',
      response: [...e.data]
    })
  }

  // --- listener notifications ---

  /**
   * Notify listeners that we've sent a command to the device
   * @param command the command sent
   */
  #notifyCommandSent(command: EncodedSysex) {
    this.#listeners.forEach(l => l.midiCommandSent && 
      l.midiCommandSent(command))
  }

  /**
   * Notify listeners that we've recieved a response to a command
   * @param response the reponse recieved
   * @param initiatingCommand the command that triggered the response
   */
  #notifyResponseRecieved(response: EncodedSysex, initiatingCommand: EncodedSysex) {
    this.#listeners.forEach(l => l.midiResponseRecieved && 
      l.midiResponseRecieved(response, initiatingCommand))
  }

  /**
   * Notify listeners that we timed out waiting for a response to a command
   * @private
   * @param initiatingCommand the command that timed out
   */
  #notifyResponseTimedOut(initiatingCommand: EncodedSysex) {
    this.#listeners.forEach(l => l.midiCommandTimedOut &&
      l.midiCommandTimedOut(initiatingCommand))
  }

  /**
   * Notify listeners that we recieved an unexpected message (not sent in response to a command, or
   * with an unexpected type)
   * 
   * @param msg the unexpected message
   */
  #notifyUnexpectedMessage(msg: EncodedSysex) {
    this.#listeners.forEach(l => l.midiUnknownMessageRecieved &&
      l.midiUnknownMessageRecieved(msg))
  }

  // --- state triggers ---

  /**
   * Submits a command to the device. If there's already an operation in progress,
   * the command will be added to a queue to be sent when outstanding operations are complete.
   * @param command a sysex command message to send
   */
  submitCommand(command: EncodedSysex) {
    this.#dispatch({ actionName: 'submit-command', command })
  }

  /**
   * Dispatch an action to the state machine, potentially advancing to a new state.
   * @param action 
   */
  #dispatch(action: FSMAction) {
    debug('fsm action: ', action.actionName)
    const { stateName: oldState } = this.#state
    this.#state = this.#nextState(this.#state, action)
    if (this.#state.stateName !== oldState) {
      debug(`transitioned from ${oldState} to ${this.#state.stateName} due to ${action.actionName} action`)
    } else {
      debug(`action ${action.actionName} resulted in no state transition`)
    }
  }

  /**
   * Signal to the state machine that the retry timer has fired, and we can re-send the last message.
   */
  #triggerRetry() {
    this.#dispatch({ actionName: 'ready-to-retry' })
  }

  /**
   * Signal to the state machine that we timed out waiting to recieve a reponse.
   */
  #triggerRecieveTimeout() {
    this.#dispatch({ actionName: 'response-timed-out' })
  }

  /** 
    * Process the outgoing message queue. 
    * Helper function used by state machine action handlers when transitioning to next state.
    * Has side effects (sending midi to device, setting timeout).
    * 
    * If the queue has commands to send, sends the command to the midi device and start the recieve timeout, then
    * returns the 'response-pending' state.
    * 
    * If no commands are waiting in the queue, returns the 'idle' state.
    */
  #processQueue(s: State<'idle', IdleStateData> | State<'response-pending', ResponsePendingStateData> | State<'device-busy', DeviceBusyStateData>): State<'idle', IdleStateData> | State<'response-pending', ResponsePendingStateData> {
    const { sendQueue: q, device } = s 
    const [cmd, ...sendQueue] = q
    if (!cmd) {
      return { stateName: 'idle', sendQueue: [], device } as const
    }
    
    const receiveTimeout = this.#sendToDevice(s.device.output, cmd)
    this.#notifyCommandSent(cmd)
    return {
      stateName: 'response-pending',
      sendQueue,
      receiveTimeout,
      commandAwaitingResponse: cmd,
      device,
    } as const
  }
}

function answerState(incoming: EncodedSysex): FirmwareAnswer | undefined {
  if (incoming.length < 6) {
    debug('recieved msg with invalid length', incoming.length)
    return
  }
  const answerState = incoming[5]
  return answerState as FirmwareAnswer
}
