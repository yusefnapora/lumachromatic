import React, { useState } from 'react'

import HarmonicContext, { defaultHarmonicParams } from './context/harmonic'
import ColorWheel from './components/ColorWheel'
import ParamsPanel from './components/ParamsPanel'
import Palette from './lib/Palette'
import './App.css'

function App() {
  const [harmonicParams, setHarmonicParams] = useState(defaultHarmonicParams)

  const palette = new Palette()
  return (
    <HarmonicContext.Provider value={harmonicParams} >
      <div className="App">
        <ColorWheel radius={300} palette={palette} />
        <ParamsPanel onChange={setHarmonicParams} />
      </div>
    </HarmonicContext.Provider>
  )
}

export default App