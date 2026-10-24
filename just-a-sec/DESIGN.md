# Interaction design

The game uses the Playground’s local DM Sans and Space Grotesk fonts, a warm paper background, sage panels, peach press surfaces and dark green actions. It keeps one clear primary action per scene, named native buttons, visible focus and a large 220–242px timing target. Player-name input is 16px on phones to avoid input zoom.

The supplied [UI UX Pro Max skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) informed the active-state, accessible-input, contrast, reduced-motion and touch guidance. Its design-system search suggested soft tactile forms; colours and typography were adapted to the existing Playground. [Motion Sites](https://motionsites.org/) was supplied as inspiration but returned HTTP 403 during this task; no claim is made to have inspected its examples.

## Motion with a purpose

- **Magnetic controls:** existing shared springs give primary buttons a small, resistant pull. The timing pad uses proximity-weighted attraction and damped spring settling.
- **Liquid deformation:** moving a held pad adds bounded resistance and velocity-based stretch. Release or cancellation returns the surface to its original shape.
- **Depth:** welcome artwork separates foreground notes, the clock surface and background orbits at different parallax speeds.
- **Stacked handoff:** the numbered player card sits over two offset cards, linking the handoff to a pass-and-play group.
- **Liquid progress:** the active-player background stretches across the turn tracker and settles with a small rebound. The tracker represents players, not elapsed time.
- **Circular reveals and completion:** scenes reveal from a circle; a drawn check confirms a locked guess, and ranked rows arrive in a short stagger.
- **Reduced motion:** optional animation and parallax stop when the browser preference is enabled. Timing, input feedback text and completion remain usable.

During a hold there is no countdown, elapsed number, filling ring, repeated pulse, audio beat or progress animation. Only direct input feedback and its finite spring settling occur. The same target stays fixed for every player, and times remain hidden until the final reveal. Timing reads the monotonic clock before rendering; motion is never the source of elapsed time.

The layout scrolls natively. It does not add decorative inertia controls, image expansion or invented navigation solely to demonstrate an effect. The existing landing cards already provide layered dragging and centre-focus effects.
