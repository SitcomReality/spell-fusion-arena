dev/02-rework-element-structure.md
# Step 2: Rework Element Structure for New Rarities
## Goal
To accommodate a vast number of new elements and 13 rarity tiers, we need to overhaul how element data is structured, stored, and loaded. This step establishes a scalable foundation for all future element creation.
## New Rarity Tiers
1.  Mundane
2.  Common
3.  Uncommon
4.  Unusual
5.  Rare
6.  Prestigious
7.  Exotic
8.  Outstanding
9.  Exceptional
10. Legendary
11. Wondrous
12. Supernal
13. Mythic
## Implementation Steps
### 1. Create New Directory Structure
First, create a new home for our element definitions.
-   Create the directory: `/spells/elements/definitions/`
### 2. Create Rarity Files
Inside the new directory, create a JavaScript file for each rarity tier. These files will hold the element definitions for that tier.
-   `01-mundane.js`
-   `02-common.js`
-   `03-uncommon.js`
-   `04-unusual.js`
-   `05-rare.js`
-   ...and so on, up to `13-mythic.js`.
Each file should export a const object containing the elements, like so:
```javascript
// Example for /spells/elements/definitions/01-mundane.js
export const MUNDANE_ELEMENTS = {
  // ... element definitions will go here
};
```
## Step 3: Define Elements
Now that we have our directory structure and files in place, we can begin defining our elements.
Each element should be defined as a JavaScript object with the following properties:
- `name`: A string representing the element's name.
- `color`: An object with `r`, `g`, and `b` properties representing the element's color in RGB format.
- `propertyGenes`: An object containing the element's property contributions (e.g., speed, damage, lifesteal).
- `visualEffects`: An object defining the element's visual effects (e.g., trail, aura, impact particles).
- `rarity`: A string indicating the element's rarity tier (e.g., 'mundane', 'common', 'uncommon', etc.).
```javascript
// Example element definition
const fire = {
  name: 'Fire',
  color: { r: 255, g: 100, b: 50 },
  propertyGenes: { speed: 280, damage: 20 },
  visualEffects: { trail: true },
  rarity: 'common'
};
```
## Step 4: Populate Rarity Files
Populate each rarity file with the corresponding element definitions.
For example, `01-mundane.js` might contain:
```javascript
export const MUNDANE_ELEMENTS = {
  fire: {
    name: 'Fire',
    color: { r: 255, g: 100, b: 50 },
    propertyGenes: { speed: 280, damage: 20 },
    visualEffects: { trail: true },
    rarity: 'mundane'
  },
  // ... other mundane elements ...
};
```
Similarly, `02-common.js` might contain:
```javascript
export const COMMON_ELEMENTS = {
  frost: {
    name: 'Frost',
    color: { r: 120, g: 220, b: 255 },
    propertyGenes: { speed: 240, damage: 18 },
    visualEffects: { trail: true },
    rarity: 'common'
  },
  // ... other common elements ...
};
```
And so on, up to `13-mythic.js`.
## Step 5: Import and Merge Element Definitions
Create a new file `/spells/elements/index.js` to import and merge all element definitions from the rarity files.
```javascript
import { MUNDANE_ELEMENTS } from './definitions/01-mundane.js';
import { COMMON_ELEMENTS } from './definitions/02-common.js';
import { UNCOMMON_ELEMENTS } from './definitions/03-uncommon.js';
// ... import other rarity files ...

export const ELEMENTS = {
  ...MUNDANE_ELEMENTS,
  ...COMMON_ELEMENTS,
  ...UNCOMMON_ELEMENTS,
  // ... other rarity elements ...
};
```
This file will serve as the central hub for accessing all element definitions.
## Step 6: Update Game Logic to Use New Element Structure
Update the game logic to utilize the new element structure.
This includes updating the `Element` class, `element.js`, to accommodate the new rarity system and element properties.
```javascript
// Example updated Element class
class Element {
  constructor(name, color, propertyGenes, visualEffects, rarity = 'common') {
    this.name = name;
    this.color = color;
    this.propertyGenes = propertyGenes || {};
    this.visualEffects = visualEffects || {};
    this.rarity = rarity;
  }
}
```
Additionally, update any game logic that interacts with elements to use the new `ELEMENTS` object from `index.js`.
```javascript
// Example updated game logic
import { ELEMENTS } from '../spells/elements/index.js';

// Accessing an element by its key
const fire = ELEMENTS.fire;
```
By following these steps, we can ensure a scalable and maintainable element system that can accommodate a vast number of new elements across various rarity tiers.