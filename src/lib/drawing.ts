import type { Point, Rect } from '../types'

export function polarToCartesian(center: Point, radius: number, angleInDegrees: number): { x: number, y: number } {
  let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: center.x + (radius * Math.cos(angleInRadians)),
    y: center.y + (radius * Math.sin(angleInRadians))
  };
}

export function describeArc(center: Point, radius: number, startAngle: number, endAngle: number): string {
  let start = polarToCartesian(center, radius, endAngle);
  let end = polarToCartesian(center, radius, startAngle);

  let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  let d = [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");

  return d;       
}

export function lineTo(pt: Point): string {
  return `L ${pt.x}, ${pt.y}`
}

export function hexagonPoints(center: Point, size: number, rotation: number = 0): string {
  const corners = [0,1,2,3,4,5].map(i => hexCorner(center, size, i))
  return corners.map(pt => `${pt.x},${pt.y}`).join(" ")
}

function hexCorner(center: Point, size: number, i: number, rotation: number = 0): Point {
  const angleDeg = ((60 * i) - 30) + rotation
  const angleRad = Math.PI / 180 * angleDeg
  return { 
    x: center.x + size * Math.cos(angleRad), 
    y: center.y + size * Math.sin(angleRad),
  }
}


function rotatePoint(pt: Point, angleDeg: number, center: Point = { x: 0, y: 0}): Point {
  const theta = Math.PI / 180 * angleDeg
  const x = center.x+(pt.x-center.x)*Math.cos(theta)+(pt.y-center.y)*Math.sin(theta)
  const y = center.y-(pt.x-center.x)*Math.sin(theta)+(pt.y-center.y)*Math.cos(theta)
  return { x, y }
}

function addPoints(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function rotatedRectBounds(rect: Rect, rotationDegrees: number): Rect {
  const center = { 
    x: rect.origin.x + (rect.size.w / 2), 
    y: rect.origin.y + (rect.size.h / 2)
  }

  const topLeft = rect.origin
  const topRight = addPoints(rect.origin, { x: 0, y: rect.size.w })
  const bottomLeft = addPoints(rect.origin, { x: rect.size.h, y: 0 })
  const bottomRight = addPoints(rect.origin, { x: rect.size.w, y: rect.size.h })

  const points = [
    rotatePoint(topLeft, rotationDegrees, center),
    rotatePoint(topRight, rotationDegrees, center),
    rotatePoint(bottomRight, rotationDegrees, center),
    rotatePoint(bottomLeft, rotationDegrees, center)
  ]
  let minx = Number.MAX_SAFE_INTEGER
  let miny = Number.MAX_SAFE_INTEGER
  let maxx = Number.MIN_SAFE_INTEGER
  let maxy = Number.MIN_SAFE_INTEGER
  for (const p of points) {
    if (p.x < minx) {
      minx = p.x
    }
    if (p.x > maxx) {
      maxx = p.x
    }
    if (p.y < miny) {
      miny = p.y
    }
    if (p.y > maxy) {
      maxy = p.y
    }
  }

  return {
    origin: { x: minx, y: miny },
    size: { w: maxx - minx, h: maxy - miny }
  }
}