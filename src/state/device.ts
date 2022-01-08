import { atom } from 'recoil'
import { LumatoneController } from '../lib/lumatone/midi/controller'
import { MidiDevice } from '../lib/lumatone/midi/device'

type MidiDeviceState =
  | {
      status: 'connected'
      device: MidiDevice
      controller: LumatoneController
    }
  | {
      status: 'disconnected'
    }

export const midiDeviceState = atom<MidiDeviceState>({
  key: 'midiDeviceState',
  default: {
    status: 'disconnected',
  },
})
