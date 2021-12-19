import React from 'react'
import HexKey from '../components/HexKey'
import type { Props as HexKeyProps } from '../components/HexKey'

export default {
  title: 'Components/HexKey',
  component: HexKey,
}

const Template = (args: HexKeyProps) => <HexKey {...args} />

export const Default = Template.bind({})

// @ts-ignore
Default.args = {
  color: 'red',
  size: 30,
}
