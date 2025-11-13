# Element System Refactor: Overview

This guide outlines the step-by-step process for a major refactor of the element, property, and visual systems in the game. The goal is to create a more scalable, performant, and visually diverse foundation for future content.

The process is broken down into discrete, incremental steps to minimize errors and ensure each stage can be completed and verified independently. We will be intentionally breaking functionality during this process, with the expectation that it will be restored and improved by the final step. No legacy code or functionality will be maintained.

## The Plan

Follow these guides in numerical order:

1. **Remove Vortex and Repulsion**: Remove ineffective and performance-draining projectile properties from the codebase.
2. **Rework Element Structure**: Reorganize the element definition files to support the new, expanded rarity system.
3. **Refactor Property Fuser**: Implement the new 'focused contribution' logic for spell fusion, where elements with fewer properties have a greater impact.
4. **Integrate Image Particles**: Enhance the rendering engine to support sprite-based particles, allowing for much greater visual variety.
5. **Visual System Enhancements**: Refine the visual fusion and preview systems to better reflect the thematic and vibrational differences between rarities.
6. **Performance Optimizations**: Introduce a grid-based spatial hashing system for collision detection to improve late-game performance.
7. **Populate New Elements**: Populate the new elements under the refactored system, starting with the 'Mundane' rarity.
