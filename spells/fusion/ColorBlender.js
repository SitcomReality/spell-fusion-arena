// Color blending utilities extracted from SpellFusion
import { BlendPrimary } from './BlendPrimary.js';
import { VisualBlender } from './VisualBlender.js';

export const ColorBlender = {
  blend(...colors) {
    return BlendPrimary.blend(...colors);
  },

  blendWithVisualGenes(...elements) {
    return VisualBlender.blendWithVisualGenes(...elements);
  }
};