import React, { useEffect, useState } from 'react'
import './styles.css'
import { detectDeviceByName } from '../../lib/lumatone/midi/detect'
import { useRecoilState, useRecoilValue } from 'recoil'
import { midiDeviceState } from '../../state/device'
import { LumatoneController } from '../../lib/lumatone/midi/controller'
import {
  colorParamState,
  harmonicParamState,
  toneMappingParamState,
} from '../../state/userParams'
import { lumatoneDeviceConfig } from '../../lib/lumatone/export'

export default function MidiPanel(): React.ReactElement {
  const [searching, setSearching] = useState(false)
  const [deviceState, setDeviceState] = useRecoilState(midiDeviceState)

  const { toneMap } = useRecoilValue(toneMappingParamState)
  const { palette } = useRecoilValue(colorParamState)
  const { scale } = useRecoilValue(harmonicParamState)

  const { status } = deviceState
  const connected = status === 'connected'
  const showDetectDeviceButton = !connected && !searching
  const connectedMessage = connected ? (
    <span className="status-connected">
      Connected to {deviceState.device.input.name}
    </span>
  ) : (
    <span className="status-disconnected">Not connected to device</span>
  )

  const doDeviceDetect = () => {
    setSearching(true)
    detectDeviceByName()
      .then((device) => {
        setSearching(false)
        const controller = new LumatoneController(device)
        setDeviceState({ status: 'connected', device, controller })
      })
      .catch((err) => {
        console.error('error detecting device:', err)
        setSearching(false)
      })
  }

  useEffect(doDeviceDetect, [])

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
    <button type="button" onClick={doDeviceDetect}>
      Detect Lumatone device
    </button>
  ) : undefined

  const searchingMessage = searching ? (
    <span className="status-searching">Searching...</span> // todo: spinner thing
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
