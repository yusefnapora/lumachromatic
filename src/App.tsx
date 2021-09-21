import React, { useState } from 'react'
import { Note, Interval } from '@tonaljs/tonal'

import HarmonicContext, { defaultHarmonicParams } from './context/harmonic'
import ColorWheel from './components/ColorWheel'
import ParamsPanel from './components/ParamsPanel'
import Palette from './lib/Palette'
import { twelveToneGenerator, RectangularToneMap } from './lib/lumatone/ToneMap'
import MultiBoard from './components/MultiBoard'

import './App.css'
import { BoardGeometry } from './lib/lumatone/BoardGeometry'

function App() {
  const [harmonicParams, setHarmonicParams] = useState(defaultHarmonicParams)

  const palette = new Palette()
  const keyDiameter = 30
  const keyMargin = 2
  const geometry = new BoardGeometry({ keyDiameter, keyMargin })

  const intervalRight = '2M'
  const intervalUpRight = '2m'

  const startNote = 'C0'
  const genTonic = twelveToneGenerator(intervalRight, startNote)
  const genOffset = twelveToneGenerator(intervalRight, Note.transpose(startNote, intervalUpRight))
  const toneMap = new RectangularToneMap({
    gen: genTonic,
    oddGen: genOffset,
  })

  return (
    <HarmonicContext.Provider value={harmonicParams} >
      <div className="App">
        <div className="HarmonyControls">
          <ColorWheel radius={300} palette={palette} />
          <ParamsPanel onChange={setHarmonicParams} />
        </div>
        <div className="BoardContainer">
          <MultiBoard {...{palette, geometry, toneMap: toneMap, numBoards: 5}} />
        </div>
      </div>
    </HarmonicContext.Provider>
  )
}


export default App
