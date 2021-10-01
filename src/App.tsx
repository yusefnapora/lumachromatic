import React, { useState } from 'react'
import { saveAs } from 'file-saver'

import ParamsContext, { defaultParams } from './context/params'
import ColorWheel from './components/ColorWheel'
import ParamsPanel from './components/ParamsPanel'
import MidiPanel from './components/MidiPanel'
import MultiBoard from './components/MultiBoard'

import { exportLumatoneIni } from './lib/lumatone/export'

import './App.css'
import { BoardGeometry } from './lib/lumatone/BoardGeometry'
import { AllParams } from './types'

function App() {
  const [params, setParams] = useState(defaultParams)

  const keyDiameter = 28
  const keyMargin = 2
  const geometry = new BoardGeometry({ keyDiameter, keyMargin })

  const onChange = (partialParams: Partial<AllParams>) => {
    const p = {...params, ...partialParams}
    // @ts-ignore
    setParams(p)
  } 

  const onExport = () => {
    console.log('exporting lumatone config')
    const { harmonic: { scale }, color: { palette }, mapping: { toneMap } } = params
    const ini = exportLumatoneIni(toneMap, palette, scale)
    const blob = new Blob([ini], {type: "text/plain;charset=utf-8"})
    const filename = scale.name + '.ltn'
    saveAs(blob, filename)
  }

  return (
    <ParamsContext.Provider value={params} >
      <div className="App">
        <div className="HarmonyControls">
          <ColorWheel radius={300} />
          <ParamsPanel onChange={onChange} exportReqested={onExport} />
          <MidiPanel/>
        </div>
        <div className="BoardContainer">
          <MultiBoard {...{ geometry, numBoards: 3}} />
        </div>
      </div>
    </ParamsContext.Provider>
  )
}


export default App
