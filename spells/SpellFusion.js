import { ColorBlender } from './fusion/ColorBlender.js';
import { PropertyFuser } from './fusion/PropertyFuser.js';
import { VisualFuser } from './fusion/VisualFuser.js';

export class SpellFusion {
  static fuse(...elements) {
    const colorResult = ColorBlender.blendWithVisualGenes(...elements);
    const fusedProperties = PropertyFuser.fuse(...elements);
    const fusedVisuals = VisualFuser.fuse(...elements.map(e => e.visualEffects));

    return {
      name: elements.map(e => e.name).join('-'),
      color: colorResult.primary,
      secondaryColor: colorResult.secondary,
      accentColor: colorResult.accent,
      visualEffects: fusedVisuals,
      properties: fusedProperties,
      elements: elements
    };
  }
}

