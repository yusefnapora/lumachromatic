import React from 'react'
import type { LayoutBase } from 'rc-dock'

export const LayoutContext = React.createContext<LayoutBase | null>(null)
export const useLayoutContext = () => React.useContext(LayoutContext)
