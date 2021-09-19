import React, { useState } from 'react'

import HarmonicContext, { defaultHarmonicParams } from './context/harmonic'
import ColorWheel from './components/ColorWheel'
import ParamsPanel from './components/ParamsPanel'
import Palette from './lib/Palette'
import TerpstraBoard from './components/TerpstraBoard'
import './App.css'

function App() {
  const [harmonicParams, setHarmonicParams] = useState(defaultHarmonicParams)

  const palette = new Palette()
  return (
    <HarmonicContext.Provider value={harmonicParams} >
      <div className="App">
        <div className="HarmonyControls">
          <ColorWheel radius={300} palette={palette} />
          <ParamsPanel onChange={setHarmonicParams} />
        </div>
        <TerpstraBoard />
        <TerpstraBoard boardIndex={1} />
      </div>
    </HarmonicContext.Provider>
  )
}

export default App
