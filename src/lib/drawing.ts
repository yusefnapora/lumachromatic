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