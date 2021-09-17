import type { Point } from '../types'

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

export function hexagonPoints(center: Point, size: number): string {
  const corners = [0,1,2,3,4,5].map(i => hexCorner(center, size, i))
  return corners.map(pt => `${pt.x},${pt.y}`).join(" ")
}

function hexCorner(center: Point, size: number, i: number): Point {
  const angleDeg = 60 * i
  const angleRad = Math.PI / 180 * angleDeg
  return { 
    x: center.x + size * Math.cos(angleRad), 
    y: center.y + size * Math.sin(angleRad),
  }
}