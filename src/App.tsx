import React, { useState } from 'react'
import ColorWheel from './components/ColorWheel'
import './lib/RXB'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  // @ts-ignore
  const colors = RXB.rainbow(12).map(c => RXB.ryb2rgb(c)).map(c => '#' + RXB.rxb2hex(c))

  return (
    <div className="App">
      <ColorWheel radius={300} colors={colors} />
    </div>
  )
}

export default App
