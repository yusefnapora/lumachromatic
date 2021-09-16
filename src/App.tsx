import React, { useState } from 'react'
import ColorWheel from './components/ColorWheel'
import ParamsPanel from './components/ParamsPanel'
import Palette from './lib/Palette'
import './App.css'

function App() {
  const palette = new Palette()

  return (
    <div className="App">
      <ColorWheel radius={300} palette={palette} />
      <ParamsPanel />
    </div>
  )
}

export default App
