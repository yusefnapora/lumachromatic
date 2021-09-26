import WebMidi from 'webmidi'
import { stateMachine, State } from 'ts-checked-fsm'
import Debug from 'debug'

import { MANUFACTURER_ID, FirmwareAnswer } from './constants'
import { messageIsResponseToMessage } from './sysex'

import type { MidiDevice  } from './device'
import type { InputEventSysex, Output } from 'webmidi'
import type { EncodedSysex } from './sysex'

const debug = Debug('midi-driver')
type Timeout = ReturnType<typeof setTimeout>

const RECIEVE_TIMEOUT_MS = 2000
const BUSY_RETRY_TIMEOUT_MS = 500

type InternalState = {
  /**  messages waiting to be sent, ordered from oldest to newest submitted */
  sendQueue: readonly EncodedSysex[],

  /** lumatone midi i/o */
  device: MidiDevice,

  commandAwaitingResponse?: EncodedSysex,
  timeouts?: {
    receive?: Timeout,
    retry?: Timeout,
  }
}

type SubmitCommandPayload = {
  command: EncodedSysex,
}

type ResponseRecievedPayload = {
  response: EncodedSysex,
}

type InitializedPayload = {
  device: MidiDevice,
}

type FSMState = State<"uninitialized">
  | State<"idle", InternalState> 
  | State<"response-pending", InternalState> 
  | State<"device-busy", InternalState>

export interface MidiListener {
  midiCommandSent?: (command: EncodedSysex) => void,
  midiResponseRecieved?: (response: EncodedSysex, initiatingCommand: EncodedSysex) => void
  midiCommandTimedOut?: (command: EncodedSysex) => void,
  midiUnknownMessageRecieved?: (msg: EncodedSysex) => void,
}

export class MidiDriver {
  #state: FSMState = { stateName: 'uninitialized' }
  #nextState
  #listeners: MidiListener[] = []

  public addListener(l: MidiListener) {
    this.#listeners.push(l)
  }

  constructor() {
    const { nextState } = stateMachine()
      .state('uninitialized')
      .state<'idle', InternalState>('idle')
      .state<'response-pending', InternalState>('response-pending')
      .state<'device-busy', InternalState>('device-busy')
      .transition('uninitialized', 'idle')
      .transition('idle', 'idle')
      .transition('idle', 'response-pending')
      .transition('response-pending', 'idle')
      .transition('response-pending', 'response-pending')
      .transition('response-pending', 'device-busy')
      .transition('device-busy', 'response-pending')
      .transition('device-busy', 'device-busy')
      .transition('device-busy', 'idle')
      .action<'init', InitializedPayload>('init')
      .action<'submit-command', SubmitCommandPayload>('submit-command')
      .action<'response-recieved', ResponseRecievedPayload>('response-recieved')
      .action('response-timed-out')
      .action('ready-to-retry')
      .actionHandler('uninitialized', 'init', (_s, a) => {
        const { device } = a
        device.input.addListener('sysex', undefined, this.#onSysexRecieved)

        return {
          stateName: 'idle',
          sendQueue: [],
          device,
        } as const
      })
      .actionHandler('idle', 'submit-command', (s, a) => {
        const { command } = a
        const { stateName: _, sendQueue: q, ...internalState } = s
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
        const { stateName, commandAwaitingResponse, timeouts: t, ...internalState } = s
        const timeouts = t ?? {}
        if (timeouts.receive) {
          clearTimeout(timeouts.receive)
          timeouts.receive = undefined
        }
        const currentState = {...s, timeouts }
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
          timeouts.retry = setTimeout(this.#triggerRetry, BUSY_RETRY_TIMEOUT_MS)
          return {
            stateName: 'device-busy',
            sendQueue: sendQueue,
            timeouts,
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
        if (s.timeouts?.receive) {
          clearTimeout(s.timeouts?.receive)
          s.timeouts!.receive = undefined
        }
        if (s.commandAwaitingResponse) {
          this.#notifyResponseTimedOut(s.commandAwaitingResponse)
        }
        return this.#processQueue(s)
      })
      .actionHandler('device-busy', 'ready-to-retry', (s) => {
        if (s.timeouts?.retry) {
          clearTimeout(s.timeouts?.retry)
          s.timeouts!.retry = undefined
        }
        return this.#processQueue(s)
      })
      .done()
      this.#nextState = nextState
  }

  // midi interactions

  #sendToDevice(output: Output, cmd: EncodedSysex): Timeout {
      output.sendSysex(MANUFACTURER_ID, cmd)
      return setTimeout(this.#triggerRecieveTimeout, RECIEVE_TIMEOUT_MS)
  }

  #onSysexRecieved(e: InputEventSysex) {
    this.#state = this.#nextState(this.#state, {
      actionName: 'response-recieved',
      response: [...e.data]
    })
  }

  // listener notifications
  #notifyCommandSent(command: EncodedSysex) {
    this.#listeners.forEach(l => l.midiCommandSent && 
      l.midiCommandSent(command))
  }

  #notifyResponseRecieved(response: EncodedSysex, initiatingCommand: EncodedSysex) {
    this.#listeners.forEach(l => l.midiResponseRecieved && 
      l.midiResponseRecieved(response, initiatingCommand))
  }

  #notifyResponseTimedOut(initiatingCommand: EncodedSysex) {
    this.#listeners.forEach(l => l.midiCommandTimedOut &&
      l.midiCommandTimedOut(initiatingCommand))
  }

  #notifyUnexpectedMessage(msg: EncodedSysex) {
    this.#listeners.forEach(l => l.midiUnknownMessageRecieved &&
      l.midiUnknownMessageRecieved(msg))
  }

  // state triggers
  #triggerRetry() {
    this.#state = this.#nextState(this.#state, { actionName: 'ready-to-retry' })
  }

  #triggerRecieveTimeout() {
    this.#state = this.#nextState(this.#state, { actionName: 'response-timed-out' })
  }

  // message queue processor
  // returns 'idle' state if no commands are queued to send
  // If commands are pending, sends to midi device and sets response timeout,
  // then returns 'response-pending' state
  #processQueue(s: InternalState): State<'idle', InternalState> | State<'response-pending', InternalState> {
    const { sendQueue: q, timeouts: t, ...internalState } = s 
    const [cmd, ...sendQueue] = q
    if (!cmd) {
      return { stateName: 'idle', ...s } as const
    }
    const timeouts = t ?? {}
    timeouts.receive = this.#sendToDevice(s.device.output, cmd)
    this.#notifyCommandSent(cmd)
    return {
      stateName: 'response-pending',
      ...internalState,
      sendQueue,
      timeouts,
      commandAwaitingResponse: cmd,
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
