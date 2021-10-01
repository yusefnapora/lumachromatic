import React, { useState } from 'react'
import './styles.css'
import type { MidiDevice } from '../../lib/lumatone/midi/device'
import { detectDevice } from '../../lib/lumatone/midi/detect'

type DeviceState = { device?: MidiDevice, searching: boolean }

export default function MidiPanel(): React.ReactElement {
  const [deviceState, setDeviceState] = useState<DeviceState>({ searching: false })

  const { device, searching } = deviceState
  const showDetectDeviceButton = !device && !searching
  const connectedMessage = device ? `Connected to ${device.input.name}` : 'Not connected to device'

  const detectClicked = () => {
    detectDevice().then(device => {
      setDeviceState({ device, searching: false })
    }).catch(err => {
      console.error('error detecting device:', err)
    })
  }
  const sendToDeviceClicked = () => console.log('TODO: send to device')

  const detectButton = showDetectDeviceButton 
    ? <button type='button' onClick={detectClicked}>Detect Lumatone device</button> 
    : undefined

  const searchingMessage = searching
    ? <span>Searching...</span> // todo: spinner thing
    : undefined

  const sendToDeviceButton = !!device
    ? <button type='button' onClick={sendToDeviceClicked}>Send to Lumatone</button>
    : undefined

  return <div className='MidiPanel'>
    <div className="MidiStatus">
      {connectedMessage}
      {searchingMessage}
    </div>
    <div className="MidiActions">
      {detectButton}
      {sendToDeviceButton}
    </div>
  </div>
}