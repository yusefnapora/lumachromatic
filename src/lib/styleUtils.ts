export function outlineTextShadow(color: string, thickness: string = '1px') {
  const p = thickness
  const n = '-' + thickness
  const z = '0px'
  const coords = [
    [p, p],
    [p, n],
    [n, p],
    [n, n],
    [p, z],
    [z, p],
    [n, z],
    [z, n],
  ]
  const shadows = coords.map(([x, y]) => `${x} ${y} 0 ${color}`)
  return shadows.join(', ')
}
