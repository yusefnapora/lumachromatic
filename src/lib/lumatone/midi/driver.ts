import WebMidi from 'webmidi'
import { MANUFACTURER_ID, FirmwareAnswer } from './constants'
import { messageIsResponseToMessage } from './sysex'
import Debug from 'debug'

import type { InputEventSysex, Input, Output } from 'webmidi'
import type { EncodedSysex } from './sysex'

const debug = Debug('midi-driver')

const RECIEVE_TIMEOUT_MS = 2000
const BUSY_RETRY_TIMEOUT_MS = 500

type MessageSent = {
  type: 'MessageSent',
  msg: EncodedSysex,
}

type MessageRecieved = {
  type: 'MessageRecieved',
  msg: EncodedSysex,
  inResponseTo?: EncodedSysex,
}

type NoAnswerToMessage = {
  type: 'NoAnswer',
  msg: EncodedSysex,
}

type MidiEvent = MessageSent | MessageRecieved | NoAnswerToMessage

export type MidiEventListener = (event: MidiEvent) => void

export class MidiDriver {
  #enabled: boolean = false
  #device?: {
    input: Input,
    output: Output,
  }
  
  #listeners: MidiEventListener[] = []
  #sendQueue: EncodedSysex[] = []
  #msgAwaitingAck?: EncodedSysex
  #recieveTimeout?: ReturnType<typeof setTimeout>
  #retryTimeout?: ReturnType<typeof setTimeout>

  async enable(): Promise<void> {
    return new Promise((resolve, reject) => {
      const callback = (err?: Error) => {
        if (err) {
          return reject(err)
        }
        this.#enabled = true
        resolve()
      }
      const useSysex = true
      WebMidi.enable(callback, useSysex)
    })
  }

  #addListener(l: MidiEventListener) {
    this.#listeners.push(l)
  }

  #ensureEnabled(): void {
    if (!this.#enabled) {
      throw new Error(`WebMidi has not been enabled. Please call enable() before using midi operations.`)
    }
  }

  #ensureDevice(): void {
    if (!this.#device) {
      throw new Error(`No device configured`)
    }
  }

  getInputs(): Input[] {
    this.#ensureEnabled()
    return WebMidi.inputs
  }

  getOutputs(): Output[] {
    this.#ensureEnabled()
    return WebMidi.outputs
  }

  async connectToLumatone(deviceId: string): Promise<void> {
    const input = WebMidi.getInputById(deviceId)
    const output = WebMidi.getOutputById(deviceId)
    if (!input || !output) {
      throw new Error('Unable to connect to device ' + deviceId)
    }
    this.#device = { input, output }
    debug('connecting to device', this.#device)
    input.addListener('sysex', undefined, this.#sysexRecieved)

    this.#initConnection()
  }


  #initConnection() {
    // TODO: ping lumatone, get firmware version, etc
  }

  sendSysex(msg: EncodedSysex){
    this.#ensureDevice()
    this.#sendQueue.push(msg)
    this.#sendNextMessage()
  }

  #sendNextMessage() {
    this.#ensureDevice()
    if (this.#msgAwaitingAck) {
      // don't send if we're awaiting a response. sendNextMessage will be triggered again
      // in the response handler after clearing #msgAwaitingAck
      debug('sendNextMessage', 'not sending message - awaiting response to previous message')
      return
    }

    if (this.#retryTimeout) {
      // don't send if we're waiting to retry because the device sent us a BUSY signal
      debug('sendNextMessage', 'not sending, awaiting retry timeout')
      return
    }

    const msg = this.#sendQueue.shift()
    if (!msg) {
      return
    }

    if (this.#recieveTimeout) {
      clearTimeout(this.#recieveTimeout)
    }

    this.#recieveTimeout = setTimeout(this.#recieveTimeoutHandler, RECIEVE_TIMEOUT_MS)
    this.#msgAwaitingAck = msg
    this.#device?.output.sendSysex(MANUFACTURER_ID, msg)
    this.#notifyListners({ type: 'MessageSent', msg })
  }


  #sysexRecieved(e: InputEventSysex) {
    const incoming = [...e.data]
    this.#notifyListners({ type: 'MessageRecieved', msg: incoming, inResponseTo: this.#msgAwaitingAck })
    
    if (!this.#msgAwaitingAck) {
      debug('unexpected sysex message received, ignoring:', e)
      return
    }

    if (!messageIsResponseToMessage(this.#msgAwaitingAck, incoming)) {
      debug('received message that does not match pending command. ignoring:', e)
      return
    }

    if (this.#recieveTimeout) {
      clearTimeout(this.#recieveTimeout)
    }

    if (incoming.length < 6) {
      debug('recieved msg with invalid length', incoming.length)
      return
    }
    const answerState = incoming[5]
    if (answerState === FirmwareAnswer.STATE) {
      debug('device is in demo mode')
      return
    }
    if (answerState === FirmwareAnswer.BUSY) {
      this.#sendQueue.unshift(this.#msgAwaitingAck)
      this.#msgAwaitingAck = undefined
      this.#retryTimeout = setTimeout(this.#busyTimeoutHandler, BUSY_RETRY_TIMEOUT_MS)
      return
    }

    this.#msgAwaitingAck = undefined
    this.#sendNextMessage()
  }

  #recieveTimeoutHandler() {
    this.#recieveTimeout = undefined
    if (!this.#msgAwaitingAck) {
      debug('recieve timeout fired, but no message awaiting ack. this is probably a bug... did you forget to cancel a timeout?')
      return
    }
    this.#notifyListners({ type: 'NoAnswer', msg: this.#msgAwaitingAck })
    this.#msgAwaitingAck = undefined
  }

  #busyTimeoutHandler() {
    this.#retryTimeout = undefined
    this.#sendNextMessage()
  }

  #notifyListners(e: MidiEvent) {
    this.#listeners.forEach(handle => handle(e))
  }
}