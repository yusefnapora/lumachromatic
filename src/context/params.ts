import React from 'react'
import type { AllParams, BoardParams } from '../types'
import { Scale } from '@tonaljs/tonal'
import Palette from '../lib/Palette'
import { TwelveToneMap } from '../lib/lumatone/ToneMap'
import { BoardGeometry } from '../lib/lumatone/BoardGeometry'

const defaultHarmonicParams = {
  scale: Scale.get('C major'),
}

const defaultColorParams = {
  palette: new Palette(12),
}

const defaultMappingParams = {
  toneMap: TwelveToneMap(),
}

const defaultBoardParams: BoardParams = {
  keyDiameter: 28,
  keyMargin: 2,
  numBoards: 5,

  get geometry(): BoardGeometry {
    const { keyDiameter, keyMargin } = this
    return new BoardGeometry({ keyDiameter, keyMargin })
  },
}

export const defaultParams = {
  harmonic: defaultHarmonicParams,
  color: defaultColorParams,
  mapping: defaultMappingParams,
  board: defaultBoardParams,
}

type ParamUpdateFn = (p: Partial<AllParams>) => any

const ParamsContext = React.createContext<[AllParams, ParamUpdateFn]>([
  defaultParams,
  () => {},
])

export const useParamsContext = () => React.useContext(ParamsContext)

export default ParamsContext
