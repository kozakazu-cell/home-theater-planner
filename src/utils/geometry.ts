import { Vector3, Room, Size3 } from '../types/theater';

// Simplistic orthogonal routing favoring wall-hugging for cables (construction-aware)
export function calculateOrthogonalPath(
  start: Vector3,
  end: Vector3,
  room: Room,
  view: 'top' | 'side' | 'front'
): { x: number; y: number }[] {
  // We project the 3D points onto the 2D plane requested
  let pt1 = { x: 0, y: 0 };
  let pt2 = { x: 0, y: 0 };
  let rMax1 = 0; let rMax2 = 0;

  if (view === 'top') {
    pt1 = { x: start.x, y: start.z };
    pt2 = { x: end.x, y: end.z };
    rMax1 = room.width; rMax2 = room.depth;
  } else if (view === 'front') {
    pt1 = { x: start.x, y: room.height - start.y };
    pt2 = { x: end.x, y: room.height - end.y };
    rMax1 = room.width; rMax2 = room.height;
  } else {
    pt1 = { x: start.z, y: room.height - start.y };
    pt2 = { x: end.z, y: room.height - end.y };
    rMax1 = room.depth; rMax2 = room.height;
  }

  // To simulate "crawling the wall", we route to the nearest outer edge first,
  // follow the perimeter, and then route into the end point.
  // For visual simplicity in this demo, an L-shape path with an intermediate point at a bounding wall.
  
  // Decide which wall is closest to pt1
  const distToLeft = pt1.x;
  const distToRight = rMax1 - pt1.x;
  const distToTop = pt1.y;
  const distToBottom = rMax2 - pt1.y;

  const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

  let path: { x: number; y: number }[] = [pt1];

  if (minDist === distToLeft || minDist === distToRight) {
    const wallX = minDist === distToLeft ? 0 : rMax1;
    path.push({ x: wallX, y: pt1.y });
    path.push({ x: wallX, y: pt2.y });
  } else {
    const wallY = minDist === distToTop ? 0 : rMax2;
    path.push({ x: pt1.x, y: wallY });
    path.push({ x: pt2.x, y: wallY });
  }

  path.push(pt2);
  return path;
}

// Generate the SVG d-attribute for the path
export function generateSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`);
  return d.join(' ');
}

// Ensure the item stays within the room and bounded by the floor ceiling logic
export function constrainToRoom(
  pos: Vector3,
  size: Size3,
  room: Room,
  isFloorMounted: boolean = false
): Vector3 {
  let { x, y, z } = pos;

  // X constraints (width)
  const halfW = size.w / 2;
  x = Math.max(halfW, Math.min(room.width - halfW, x));

  // Z constraints (depth)
  const halfD = size.d / 2;
  z = Math.max(halfD, Math.min(room.depth - halfD, z));

  // Y constraints (height)
  // note: y=0 is floor, y=room.height is ceiling
  if (isFloorMounted) {
    y = size.h / 2;
  } else {
    const halfH = size.h / 2;
    y = Math.max(halfH, Math.min(room.height - halfH, y));
  }

  return { x, y, z };
}

// Calculation for projector beam cone
export function getProjectionCone2D(
  projSource: { x: number; y: number },
  screenTopLeft: { x: number; y: number },
  screenBottomRight: { x: number; y: number },
  view: 'top' | 'side' | 'front'
): { x: number; y: number }[] {
  // The cone extends from the projector lens to the four corners of the screen.
  // In 2D, we just project to the appropriate extents.
  return [
    projSource,
    screenTopLeft,
    screenBottomRight,
    {
      x: view === 'top' || view === 'front' ? screenTopLeft.x : screenTopLeft.x,
      y: view === 'top' || view === 'front' ? screenBottomRight.y : screenBottomRight.y
    }
  ]; // This is simplified. 
}
