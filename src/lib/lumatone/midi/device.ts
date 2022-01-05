import WebMidi from 'webmidi'
import type { Input, Output } from 'webmidi'

export type MidiDevice = {
  input: Input
  output: Output
}

let _webMidiEnabled = false
function enableWebMidi(): Promise<void> {
  if (_webMidiEnabled) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const useSysex = true
    WebMidi.enable((err) => {
      if (err) {
        return reject(err)
      }
      _webMidiEnabled = true
      resolve()
    }, useSysex)
  })
}

export async function getInputs(): Promise<Input[]> {
  await enableWebMidi()
  return WebMidi.inputs
}

export async function getOutputs(): Promise<Output[]> {
  await enableWebMidi()
  return WebMidi.outputs
}
