import React from 'react'
import type { HarmonicParams } from '../types'

export const defaultHarmonicParams = { 
  tonicNote: "C", 
  scaleName: "major"
}

const HarmonicContext = React.createContext<HarmonicParams>(defaultHarmonicParams) 

export default HarmonicContext