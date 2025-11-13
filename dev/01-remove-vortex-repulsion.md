# Step 1: Remove Vortex and Repulsion Properties

## Goal

The first step is to simplify the physics and property systems by completely removing the 'vortex' (attraction) and 'repulsion' properties. These properties are currently ineffective, do not add compelling gameplay, and introduce unnecessary performance overhead.

## Files to Modify

The following files will be touched in this step:

-   `spells/elements/rare.js`
-   `spells/elements/uncommon.js`
-   `spells/elements/more_uncommon.js`
-   `spells/fusion/PropertyFuser.js`
-   `spells/projectile/MovementHandler.js`
-   `spells/fusion/VisualFuser.js`
-   `game/ParticleManager.js`
-   `rendering/particleRenderers/Swirl.js`
-   `ui/VisualPreview.js`
-   `styles/properties.css`
-   `styles/visual-preview.css`

## Implementation Steps

### 1. Remove Properties from Element Definitions

Go through all element definition files and remove any lines containing `vortex` or `repulsion`.

-   In `spells/elements/rare.js`, remove `vortex` from `void`, `repulsion` from `chaos`, `vortex` from `entropy`, and `vortex` from `singularity`.
-   In `spells/elements/more_uncommon.js`, remove `vortex` from `love` and `repulsion` from `hate`.

### 2. Remove Fusion Logic

Update `spells/fusion/PropertyFuser.js` to remove the special-case logic that handles the interaction between vortex and repulsion.

-   Delete the variable declarations for `totalVortex`, `totalRepulsion`, `vortexGeneticWeight`, and `repulsionGeneticWeight`.
-   Remove the blocks inside the main loop that check for and process `vortex` and `repulsion`.
-   Delete the entire block of code that calculates `vortexScore` and `repulsionScore` and adds the resulting property.

### 3. Remove Physics Logic

Update `spells/projectile/MovementHandler.js` to remove the physics calculations for these forces.

-   Delete the `applyAttractionRepulsion` function entirely.
-   Remove the call to `this.applyAttractionRepulsion(projectile, dt, enemies);` from the `updateMovement` function.

### 4. Clean Up Visual and Particle Systems

-   In `spells/fusion/VisualFuser.js`, remove the `vortex` and `pullParticles` properties from the `fused` object.
-   In `game/ParticleManager.js`, find the `updateParticles` method. Remove the entire `if (particle.attracted && particle.targetX !== undefined)` block that handles attracted particles.
-   In `rendering/particleRenderers/Swirl.js` and other particle renderers, ensure no logic relies on these properties.
-   In `ui/VisualPreview.js`, remove the `'vortex'` case from `determineVisualStyle` and delete the `buildVortex` static method.
-   In `styles/visual-preview.css`, delete all CSS rules associated with `.visual-preview-vortex`.

### 5. Remove UI Assets and Styles

-   Delete the files `img/attraction.png` and `img/repulsion.png`. We will no longer need these icons.
-   In `styles/properties.css`, remove the CSS rules that assign background images for `[data-property="vortex"]` and `[data-property="repulsion"]`.

