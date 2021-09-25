import WebMidi from 'webmidi'
import { stateMachine, State } from 'ts-checked-fsm'
import { MANUFACTURER_ID, FirmwareAnswer } from './constants'
import { messageIsResponseToMessage } from './sysex'
import Debug from 'debug'

import type { InputEventSysex, Input, Output } from 'webmidi'
import type { EncodedSysex } from './sysex'

const debug = Debug('midi-driver')

const RECIEVE_TIMEOUT_MS = 2000
const BUSY_RETRY_TIMEOUT_MS = 500

type InternalState = {
  sendQueue: readonly EncodedSysex[],
  commandAwaitingResponse?: EncodedSysex,
  timeouts?: {
    receive?: ReturnType<typeof setTimeout>,
    retry?: ReturnType<typeof setTimeout>,
  }
}

type SubmitCommandPayload = {
  command: EncodedSysex,
}

type ResponseRecievedPayload = {
  response: EncodedSysex,
  command: EncodedSysex,
}

type FSMState = State<"idle", {}> 
  | State<"processing", InternalState> 
  | State<"response-pending", InternalState> 
  | State<"device-busy", InternalState>

class MidiDriver {
  #state: FSMState = { stateName: 'idle' }
  #nextState

  constructor() {

    const { nextState } = stateMachine()
      .state('idle')
      .state<'processing', InternalState>('processing')
      .state<'response-pending', InternalState>('response-pending')
      .state<'device-busy', InternalState>('device-busy')
      .transition('idle', 'processing')
      .transition('processing', 'idle')
      .transition('processing', 'response-pending')
      .transition('response-pending', 'processing')
      .transition('response-pending', 'device-busy')
      .transition('device-busy', 'processing')
      .action<'submit-command', SubmitCommandPayload>('submit-command')
      .action('send-next-command')
      .action<'response-recieved', ResponseRecievedPayload>('response-recieved')
      .action('response-timed-out')
      .action('ready-to-retry')
      .actionHandler('idle', 'submit-command', (_s, a) => {
        const { command } = a
        return {
          stateName: 'processing',
          sendQueue: [command]
        } as const
      })
      .actionHandler('processing', 'send-next-command', (s, a) => {
        const { sendQueue: q, timeouts: t, stateName: _, ...internalState } = s
        const [cmd, ...sendQueue] = q
        if (!cmd) {
          return {
            stateName: 'idle'
          } as const
        }
        this.#sendToDevice(cmd)
        const timeouts = t ?? {}
        timeouts.receive = setTimeout(this.#triggerRecieveTimeout, RECIEVE_TIMEOUT_MS)
        return {
          stateName: 'response-pending',
          sendQueue,
          commandAwaitingResponse: cmd,
          timeouts,
          ...internalState,
        } as const
      })
      .actionHandler('response-pending', 'response-recieved', (s, a) => {
        const { response } = a
        const { stateName, commandAwaitingResponse, timeouts: t, ...internalState } = s
        const timeouts = t ?? {}
        if (timeouts.receive) {
          clearTimeout(timeouts?.receive)
          timeouts.receive = undefined
        }
        if (!commandAwaitingResponse) {
          debug('recieved unexpected response', response)
          return {
            stateName: 'processing',
            commandAwaitingResponse,
            ...internalState
          } as const
        }
        if (!messageIsResponseToMessage(commandAwaitingResponse, response)) {
          debug('recieved response that does not match expected response', response)
          return {
            stateName: 'processing',
            commandAwaitingResponse,
            ...internalState,
          } as const
        }
        const answer = answerState(response)
        if (answer === FirmwareAnswer.BUSY) {
          // re-enqueue command
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
          debug('Device is in demo mode! Dropping outgoing command.')
          return {
            stateName: 'processing',
            ...internalState
          } as const
        }
        // notify listeners
        this.#notifyResponseRecieved(response, commandAwaitingResponse)

        return {
          stateName: 'processing',
          ...internalState,
        } as const
      })
      .actionHandler('response-pending', 'response-timed-out', (s) => {
        debug('timed out waiting for response')
        const { stateName: _, commandAwaitingResponse: _cmd, timeouts, ...internalState } = s
        if (timeouts?.receive) {
          clearTimeout(timeouts?.receive)
          timeouts!.receive = undefined
        }
        return { 
          stateName: 'processing',
          timeouts,
          ...internalState,
        } as const
      })
      .actionHandler('device-busy', 'ready-to-retry', (s) => {
        const { stateName, timeouts, ...internalState } = s
        if (timeouts?.retry) {
          clearTimeout(timeouts?.retry)
          timeouts!.retry = undefined
        }
        return {
          stateName: 'processing',
          timeouts,
          ...internalState,
        } as const
      })
      .done()
      this.#nextState = nextState
  }

  // midi interactions

  #sendToDevice(cmd: EncodedSysex) {
      debug('TODO: actually send command to midi device')
  }

  // listener notifications
  
  #notifyResponseRecieved(response: EncodedSysex, initiatingCommand: EncodedSysex) {
    debug('TODO: notify listeners about response')
  }

  #notifyResponseTimedOut(initiatingCommand: EncodedSysex) {
    debug('TODO: notify listeners about response timeout')
  }

  // state triggers
  #triggerRetry() {
    this.#state = this.#nextState(this.#state, { actionName: 'ready-to-retry' })
  }

  #triggerRecieveTimeout() {
    this.#state = this.#nextState(this.#state, { actionName: 'response-timed-out' })
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