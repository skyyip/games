const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function wrongFeedback(target) {
  try { navigator.vibrate?.([35, 25, 35]); } catch { /* Haptics are optional. */ }
  if (!target) return;
  target.classList.add('feedback-wrong');
  setTimeout(() => target.classList.remove('feedback-wrong'), 260);
}

export function animateChange(target) {
  if (!target || reducedMotion.matches || !target.animate) return;
  target.animate([
    { opacity: 0.45, transform: 'translateY(4px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ], { duration: 160, easing: 'ease-out' });
}

// Feedback decorates controls without delaying their native click or navigation.
document.addEventListener('pointerdown', event => {
  if (event.button !== 0 || reducedMotion.matches) return;
  const control = event.target.closest('.primary-button, .btn, .card, .playground-home');
  if (!control || control.disabled) return;
  const bounds = control.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'interaction-ripple';
  ripple.setAttribute('aria-hidden', 'true');
  const diameter = Math.hypot(bounds.width, bounds.height) * 2;
  Object.assign(ripple.style, {
    width: `${diameter}px`, height: `${diameter}px`,
    left: `${event.clientX - bounds.left}px`, top: `${event.clientY - bounds.top}px`,
  });
  control.append(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  setTimeout(() => ripple.remove(), 650);
});
