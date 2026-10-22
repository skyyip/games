// Small, deterministic motion primitives. Gameplay clocks and rules do not use these.
export function springStep(position, velocity, target, seconds, { stiffness = 260, damping = 24, mass = 1 } = {}) {
  const elapsed = Math.min(0.05, Math.max(0, seconds));
  const steps = Math.max(1, Math.ceil(elapsed * 120));
  const dt = elapsed / steps;
  for (let step = 0; step < steps; step++) {
    velocity += ((target - position) * stiffness - velocity * damping) / mass * dt;
    position += velocity * dt;
  }
  return { position, velocity };
}

export function magneticOffset(x, y, reach = 5) {
  const pull = Math.max(0, 1 - Math.hypot(x, y) / 1.4) ** 2;
  return { x: x * reach * pull, y: y * reach * pull };
}

export const resistedDrag = (distance, limit) => limit * Math.tanh(distance / limit);

export const shouldDismiss = (distance, height, velocity) =>
  distance >= Math.min(140, height * 0.25) || (distance > 40 && velocity > 0.55);
