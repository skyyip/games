// All shapes share a square coordinate system, so their proportions remain
// consistent in the key, next-shape cue and every grid size.
const polygon = (sides, innerRadius = 38) => Array.from({ length: sides }, (_, index) => {
  const angle = index * Math.PI * 2 / sides - Math.PI / 2;
  const radius = Array.isArray(innerRadius) ? innerRadius[index % innerRadius.length] : innerRadius;
  return `${index ? 'L' : 'M'}${(50 + Math.cos(angle) * radius).toFixed(2)} ${(50 + Math.sin(angle) * radius).toFixed(2)}`;
}).join('') + 'Z';

export const SHAPE_PALETTE = Object.freeze([
  { id: 'circle', name: 'Circle', path: 'M50 14a36 36 0 1 0 0 72a36 36 0 1 0 0-72Z' },
  { id: 'ellipse', name: 'Ellipse', path: 'M12 50a38 24 0 1 0 76 0a38 24 0 1 0-76 0Z' },
  { id: 'equilateral-triangle', name: 'Equilateral triangle', path: 'M50 13L93 87H7Z' },
  { id: 'right-triangle', name: 'Right triangle', path: 'M14 14V86H86Z' },
  { id: 'isosceles-triangle', name: 'Isosceles triangle', path: 'M50 10L76 90H24Z' },
  { id: 'square', name: 'Square', path: 'M18 18H82V82H18Z' },
  { id: 'rectangle', name: 'Rectangle', path: 'M8 24H92V76H8Z' },
  { id: 'rhombus', name: 'Rhombus', path: 'M50 8L80 50L50 92L20 50Z' },
  { id: 'trapezoid', name: 'Trapezoid', path: 'M28 20H72L94 80H6Z' },
  { id: 'parallelogram', name: 'Parallelogram', path: 'M32 20H92L68 80H8Z' },
  { id: 'pentagon', name: 'Pentagon', path: polygon(5) },
  { id: 'hexagon', name: 'Hexagon', path: polygon(6) },
  { id: 'octagon', name: 'Octagon', path: polygon(8) },
  { id: 'heart', name: 'Heart', path: 'M50 88C42 78 8 58 8 32C8 9 37 4 50 24C63 4 92 9 92 32C92 58 58 80 50 88Z' },
  { id: 'star', name: 'Star', path: polygon(10, [40, 17]) },
  { id: 'crescent', name: 'Crescent', path: 'M68 10C12 10 4 82 60 90C32 68 34 32 68 10Z' },
  { id: 'arrow', name: 'Arrow', path: 'M8 34H54V12L94 50L54 88V66H8Z' },
  { id: 'cross', name: 'Cross', path: 'M36 10H64V36H90V64H64V90H36V64H10V36H36Z' },
].map(shape => Object.freeze(shape)));

export function tileShape(value) {
  if (typeof value !== 'string' || !value.startsWith('shape:')) return null;
  return SHAPE_PALETTE.find(shape => shape.id === value.split(':')[1]) ?? null;
}

export function shapeIcon(id) {
  const shape = SHAPE_PALETTE.find(entry => entry.id === id);
  // Only trusted catalog paths are rendered; no player-entered content is HTML.
  return shape ? `<svg class="shape-icon" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="${shape.path}"/></svg>` : '';
}
