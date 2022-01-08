import React, { useState } from 'react'
import './styles.css'
import type { MidiDevice } from '../../lib/lumatone/midi/device'
import { detectDevice, toHex } from '../../lib/lumatone/midi/detect'
import { useRecoilState, useRecoilValue } from 'recoil'
import { midiDeviceState } from '../../state/device'
import { MidiDriver } from '../../lib/lumatone/midi/driver'
import { LumatoneController } from '../../lib/lumatone/midi/controller'
import {
  colorParamState,
  harmonicParamState,
  toneMappingParamState,
} from '../../state/userParams'
import { lumatoneDeviceConfig } from '../../lib/lumatone/export'
import { ping } from '../../lib/lumatone/midi/commands'
import { EncodedSysex } from '../../lib/lumatone/midi/sysex'

export default function MidiPanel(): React.ReactElement {
  const [searching, setSearching] = useState(false)
  const [deviceState, setDeviceState] = useRecoilState(midiDeviceState)

  const { toneMap } = useRecoilValue(toneMappingParamState)
  const { palette } = useRecoilValue(colorParamState)
  const { scale } = useRecoilValue(harmonicParamState)

  const { status } = deviceState
  const connected = status === 'connected'
  const showDetectDeviceButton = !connected && !searching
  const connectedMessage = connected
    ? `Connected to ${deviceState.device.input.name}`
    : 'Not connected to device'

  const detectClicked = () => {
    setSearching(true)
    detectDevice()
      .then((device) => {
        setSearching(false)
        const controller = new LumatoneController(device)
        setDeviceState({ status: 'connected', device, controller })
      })
      .catch((err) => {
        console.error('error detecting device:', err)
      })
  }
  const sendToDeviceClicked = () => {
    if (!connected) {
      console.warn('no device connected, cannot send key map')
      return
    }
    const { controller } = deviceState
    const config = lumatoneDeviceConfig(toneMap, palette, scale)
    console.log('sending config to device')
    controller
      .sendDeviceConfig(config)
      .then(() => console.log('config sent successfully'))
      .catch((err) => console.error('error sending to device', err))
  }

  const detectButton = showDetectDeviceButton ? (
    <button type="button" onClick={detectClicked}>
      Detect Lumatone device
    </button>
  ) : undefined

  const searchingMessage = searching ? (
    <span>Searching...</span> // todo: spinner thing
  ) : undefined

  const sendToDeviceButton = connected ? (
    <button type="button" onClick={sendToDeviceClicked}>
      Send to Lumatone
    </button>
  ) : undefined

  return (
    <div className="MidiPanel">
      <div className="MidiStatus">
        {connectedMessage}
        {searchingMessage}
      </div>
      <div className="MidiActions">
        {detectButton}
        {sendToDeviceButton}
      </div>
    </div>
  )
}
