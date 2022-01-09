import { getInputs, getOutputs, MidiDevice } from './device'

export async function detectDeviceByName(): Promise<MidiDevice> {
  const inputs = await getInputs()
  const outputs = await getOutputs()

  console.log('detect device. inputs: ', inputs)

  if (inputs.length === 0 || outputs.length === 0) {
    throw new Error(`no midi i/o devices found`)
  }

  const input = inputs.find((i) => i.name === 'Lumatone')
  const output = outputs.find((o) => o.name === 'Lumatone')
  if (!input) {
    throw new Error('no input found')
  }
  if (!output) {
    throw new Error('no output found')
  }
  return { input, output }
}

/*
// FIXME: this method seems to work, but it leaves the WebMidi input / output devices in an unusable state, and they won't work with the MidiDriver after the detection completes.
// my guess is that we're leaving a sysex listener registered, which is causing problems with WebMidi somewhere...

import { InputEventSysex } from 'webmidi'
import { isLumatoneMessage } from './sysex'
import { ping } from './commands'
import { decodePing, isOk } from './responses'
import { MANUFACTURER_ID } from './constants'
import { errorMessage } from './errors'

import Debug from 'debug'
const debug = Debug('detect-device')


export async function detectDeviceWithPingMessage(): Promise<MidiDevice> {
  const inputs = await getInputs()
  const outputs = await getOutputs()

  console.log('detect device. inputs: ', inputs)

  if (inputs.length === 0 || outputs.length === 0) {
    throw new Error(`no midi i/o devices found`)
  }

  const pingTimeoutMs = 5000
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () =>
        reject(
          new Error(
            `timed out after ${pingTimeoutMs}ms waiting for ping response`
          )
        ),
      pingTimeoutMs
    )

    // register sysex listeners on all inputs
    for (const input of inputs) {
      let found = false
      const listener = (e: InputEventSysex) => {
        const cleanup = () => { 
          input.removeListener('sysex', undefined, listener)
          clearTimeout(timeout)
        }

        if (found) {
          cleanup()
          return
        }
        const msg = e.data.slice(1, e.data.length-1)
        debug('received sysex message on input ', e.target.name + ' / ' + e.target.id + ': ', toHex(msg))
        if (!isLumatoneMessage(msg)) {
          debug('recieved non-lumatone response on input', e.target.name + ' / ' + e.target.id)
          debug(msg)
          cleanup()
          return
        }
        const pingResult = decodePing([...msg])
        if (!isOk(pingResult)) {
          debug('invalid ping response: ', errorMessage(pingResult.error))
          cleanup()
          return
        }

        const outputId = pingResult.value.pingId
        if (outputId >= outputs.length) {
          debug('ping response contained invalid output index ' + outputId)
          cleanup()
          return
        }
        
        found = true
        const output = outputs[outputId]
        debug(`found midi device:
          - input:  ${input.name} / ${input.id}
          - output: ${output.name} / ${output.id}
        `)
        cleanup()
        resolve({ input, output })
      }

      input.addListener('sysex', undefined, listener)
    }

    // send a ping command on each output, passing in the
    // index of the output. this will be echoed back by
    // the device
    for (let i = 0; i < outputs.length; i++) {
      debug(`pinging output device ${outputs[i].name} / ${outputs[i].id}`)
      const msg = ping(i)
      outputs[i].sendSysex(MANUFACTURER_ID, [...msg])
    }
  })


}

*/

// TODO: move to utils file somewhere?
export function toHex(buffer: Uint8Array) {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2))
    .join(' ')
}
