import React from 'react'
import { RecoilRoot } from 'recoil'

import './App.css'

import { MainLayout } from './components/MainLayout'

function App() {
  return (
    <RecoilRoot>
      <div className="App">
        <MainLayout />
      </div>
    </RecoilRoot>
  )
}

export default App
