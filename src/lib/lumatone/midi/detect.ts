import { InputEventSysex } from 'webmidi'
import Debug from 'debug'
import { getInputs, getOutputs, MidiDevice } from './device'

import { isLumatoneMessage } from './sysex'
import { ping } from './commands'
import { decodePing } from './responses'
import { MANUFACTURER_ID } from './constants'

const debug = Debug('detect-device')

export async function detectDevice(): Promise<MidiDevice> {
  const inputs = await getInputs()
  const outputs = await getOutputs()

  if (inputs.length === 0 || outputs.length === 0) {
    throw new Error(`no midi i/o devices found`)
  }

  const pingTimeoutMs = 5000

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => 
      reject(new Error(`timed out after ${pingTimeoutMs}ms waiting for ping response`)), pingTimeoutMs)

    // register sysex listeners on all inputs
    for (const input of inputs) {
      let found = false
      const listener = (e: InputEventSysex) => {
        if (found) {
          input.removeListener('sysex', undefined, listener)
          return
        }
        if (!isLumatoneMessage(e.data)) {
          debug('recieved non-lumatone response', e.data)
          input.removeListener('sysex', undefined, listener)
          return
        }
        let response
        try {
          response = decodePing([...e.data])          
        } catch (e) {
          debug('invalid ping response: ', e)
          return
        }
       
        const outputId = response.value
        if (outputId >= outputs.length) {
          debug('ping response contained invalid output index ' + outputId)
          return
        }
        found = true
        input.removeListener('sysex', undefined, listener)
        clearTimeout(timeout)
        const output = outputs[outputId]
        debug(`found midi device:
          - input:  ${input.name} / ${input.id}
          - output: ${output.name} / ${output.id}
        `)
        resolve({ input, output })
      }

      input.addListener('sysex', undefined, listener)
    }

    // send a ping command on each output, passing in the
    // index of the output. this will be echoed back by
    // the device
    for (let i = 0; i < outputs.length; i++) {
      debug(`pinging output device ${outputs[i].name} / ${outputs[i].id}`)
      outputs[i].sendSysex(MANUFACTURER_ID, ping(i))
    }
  })
}