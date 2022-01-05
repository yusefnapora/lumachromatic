import React, { useState } from 'react'

import './App.css'

import { MainLayout } from './components/MainLayout'
import ParamsContext, { defaultParams } from './context/params'
import { AllParams } from './types'

function App() {
  const [params, setParams] = useState(defaultParams)
  const onChange = (partialParams: Partial<AllParams>) => {
    const p = { ...params, ...partialParams }
    // @ts-ignore
    setParams(p)
  }

  return (
    <ParamsContext.Provider value={[params, onChange]}>
      <div className="App">
        <MainLayout />
      </div>
    </ParamsContext.Provider>
  )
}

export default App
