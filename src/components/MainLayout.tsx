import React, { useState, useRef } from 'react'
import DockLayout from 'rc-dock'
import 'rc-dock/dist/rc-dock-dark.css'
import type { LayoutBase } from 'rc-dock'

import DevicePanel from './DevicePanel'
import MultiBoard from '../components/MultiBoard'
import { BoardGeometry } from '../lib/lumatone/BoardGeometry'
import { LayoutContext } from '../context/layout'
import HarmonyPanel from './HarmonyPanel'

export const MainLayout = () => {
  const [layout, setLayout] = useState<LayoutBase | null>(null)
  const layoutRef = useRef<DockLayout>(null)

  const harmonyPanel = <HarmonyPanel />
  const devicePanel = <DevicePanel />

  const keyDiameter = 28
  const keyMargin = 2
  const geometry = new BoardGeometry({ keyDiameter, keyMargin })

  const board = (
    <div className="BoardContainer">
      <MultiBoard {...{ geometry, numBoards: 5 }} />
    </div>
  )

  const paramsLayout = {
    mode: 'horizontal' as const,
    size: 600,

    children: [
      {
        tabs: [{ id: 'harmony', title: 'Harmony', content: harmonyPanel }],
        size: 800,
      },
      {
        tabs: [{ id: 'device', title: 'Device', content: devicePanel }],
      },
    ],
  }

  const defaultLayout = {
    dockbox: {
      mode: 'vertical' as const,
      children: [
        {
          size: 800,
          tabs: [{ id: 'board', title: 'Board', content: board }],
          panelLock: { panelStyle: 'main' },
        },
        paramsLayout,
      ],
    },
  }

  const layoutChanged = (newLayout: LayoutBase) => {
    setLayout(newLayout)
  }

  return (
    <LayoutContext.Provider value={layout}>
      <DockLayout
        ref={layoutRef}
        defaultLayout={defaultLayout}
        onLayoutChange={layoutChanged}
        style={{
          position: 'absolute',
          left: 10,
          top: 10,
          right: 10,
          bottom: 10,
        }}
      />
    </LayoutContext.Provider>
  )
}
