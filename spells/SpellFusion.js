import { PROPERTY_TYPES } from './Element.js';

export class SpellFusion {
  static fuse(...elements) {
    const colorResult = this.blendColors(...elements.map(e => e.color));
    const fusedProperties = this.fuseProperties(...elements);
    const fusedVisuals = this.fuseVisualEffects(...elements.map(e => e.visualEffects));
    
    return {
      name: elements.map(e => e.name).join('-'),
      color: colorResult.primary,
      accentColor: colorResult.accent,
      secondaryColor: colorResult.secondary,
      visualEffects: fusedVisuals,
      properties: fusedProperties,
      elements: elements
    };
  }
  
  static blendColors(...colors) {
    if (colors.length === 0) return { 
      primary: { r: 200, g: 200, b: 200 },
      accent: null,
      secondary: null
    };
    
    if (colors.length === 1) {
      // Single element: slightly desaturate
      const hsl = this.rgbToHsl(colors[0]);
      hsl.s *= 0.85; // Reduce saturation by 15%
      hsl.l = Math.min(0.65, hsl.l * 0.95); // Slightly darken
      return {
        primary: this.hslToRgb(hsl),
        accent: null,
        secondary: null
      };
    }
    
    // First element is dominant for hue
    const primaryHsl = this.rgbToHsl(colors[0]);
    
    // Convert all colors to HSL
    const allHsl = colors.map(c => this.rgbToHsl(c));
    
    // Calculate average hue with first element weighted more heavily
    let totalHue = primaryHsl.h * 2.5; // First element has 2.5x weight
    let totalSat = 0;
    let totalLight = 0;
    let weightSum = 2.5;
    
    for (let i = 0; i < allHsl.length; i++) {
      const weight = i === 0 ? 2.5 : 0.8; // First already counted, others have less weight
      if (i > 0) {
        // Handle hue wrapping (e.g., red at 0 and 360)
        let hueDiff = allHsl[i].h - primaryHsl.h;
        if (hueDiff > 180) hueDiff -= 360;
        if (hueDiff < -180) hueDiff += 360;
        totalHue += (primaryHsl.h + hueDiff) * weight;
        weightSum += weight;
      }
      
      // Each element contributes saturation and brightness
      totalSat += allHsl[i].s;
      totalLight += allHsl[i].l;
    }
    
    // Average and boost saturation
    const finalHue = (totalHue / weightSum) % 360;
    const baseSat = totalSat / colors.length;
    const baseLight = totalLight / colors.length;
    
    // Boost saturation when combining elements (up to +30%)
    const saturationBoost = Math.min(0.3, (colors.length - 1) * 0.12);
    const finalSat = Math.min(1.0, baseSat + saturationBoost);
    
    // Slightly increase brightness for multi-element spells
    const lightnessBoost = Math.min(0.15, (colors.length - 1) * 0.05);
    const finalLight = Math.min(0.7, baseLight + lightnessBoost);
    
    const primaryColor = this.hslToRgb({ h: finalHue, s: finalSat, l: finalLight });
    
    // Create accent color: find most contrasting element
    let accentColor = null;
    let secondaryColor = null;
    
    if (colors.length >= 2) {
      // Find the element with most different hue from primary
      let maxHueDiff = 0;
      let accentIndex = 1;
      
      for (let i = 1; i < allHsl.length; i++) {
        let hueDiff = Math.abs(allHsl[i].h - primaryHsl.h);
        if (hueDiff > 180) hueDiff = 360 - hueDiff;
        if (hueDiff > maxHueDiff) {
          maxHueDiff = hueDiff;
          accentIndex = i;
        }
      }
      
      // Accent is highly saturated, bright version of contrasting color
      const accentHsl = { ...allHsl[accentIndex] };
      accentHsl.s = Math.min(1.0, accentHsl.s * 1.3);
      accentHsl.l = Math.min(0.65, accentHsl.l * 1.15);
      accentColor = this.hslToRgb(accentHsl);
      
      // Secondary is a blend of all non-primary colors
      if (colors.length >= 3) {
        let secHue = 0;
        let secSat = 0;
        let secLight = 0;
        for (let i = 1; i < allHsl.length; i++) {
          secHue += allHsl[i].h;
          secSat += allHsl[i].s;
          secLight += allHsl[i].l;
        }
        const count = colors.length - 1;
        secondaryColor = this.hslToRgb({
          h: (secHue / count) % 360,
          s: Math.min(1.0, (secSat / count) * 1.2),
          l: Math.min(0.6, (secLight / count) * 1.1)
        });
      }
    }
    
    return {
      primary: primaryColor,
      accent: accentColor,
      secondary: secondaryColor
    };
  }
  
  static rgbToHsl(rgb) {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    if (max === min) {
      return { h: 0, s: 0, l };
    }
    
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    let h;
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
    
    return { h: h * 360, s, l };
  }
  
  static hslToRgb(hsl) {
    const h = hsl.h / 360;
    const s = hsl.s;
    const l = hsl.l;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
  
  static fuseTraits(...traits) {
    const avgSpeed = traits.reduce((sum, t) => sum + t.speed, 0) / traits.length;
    const avgDamage = traits.reduce((sum, t) => sum + t.damage, 0) / traits.length;
    
    // Pick random projectile type from the elements
    const projectileType = traits[Math.floor(Math.random() * traits.length)].projectileType;
    
    return {
      speed: avgSpeed,
      damage: avgDamage,
      projectileType: projectileType,
      particleShape: traits[0].particleShape,
      secondaryShape: traits[1]?.particleShape,
      destructionType: traits[0].destructionType,
      secondaryDestruction: traits[1]?.destructionType
    };
  }

  static fuseProperties(...elements) {
    const propertyScores = {};
    const numElements = elements.length;
    
    // Core stats (damage, speed) are handled separately for clarity
    let totalDamage = 0;
    let totalSpeed = 0;

    // 1. Sum up property contributions from all elements
    // The first element has the most impact, subsequent ones have diminishing contributions
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      // Earlier elements have a higher weight. 1st: 1.0, 2nd: 0.75, 3rd: 0.6, 4th: 0.5
      const positionMultiplier = 1.0 / (1 + i * 0.35);

      for (const [property, value] of Object.entries(element.propertyGenes || {})) {
        if (property === 'damage') {
          totalDamage += value * (i === 0 ? 1 : 0.6); // Base damage is mostly from the first element
          continue;
        }
        if (property === 'speed') {
          totalSpeed += value; // Speed is averaged later
          continue;
        }

        if (!propertyScores[property]) {
          propertyScores[property] = 0;
        }
        propertyScores[property] += value * positionMultiplier;
      }
    }
    
    // 2. Calculate final property values without a binary threshold
    const finalProperties = {
      // Base damage is the average, with a boost from the sum of genes
      damage: (totalDamage / numElements) + (elements.reduce((s, e) => s + (e.propertyGenes.damage || 0), 0) * 0.1),
      speed: totalSpeed / numElements,
    };
    
    for (const [property, score] of Object.entries(propertyScores)) {
      if (score > 0) {
        // The "potency" of a property is its calculated score divided by a balancing factor.
        // This yields values typically between 0.1 and 1.5, representing weak to strong effects.
        // A divisor of 12 provides a good range for current gene values (which are ~1-10).
        // This allows projectile mechanics to use this value as a multiplier for things like
        // knockback force, slow duration, AOE radius, or chance to split.
        const potency = score / 12;
        finalProperties[property] = Math.round(potency * 100) / 100; // round to 2 decimal places
      }
    }
    
    return finalProperties;
  }

  static fuseVisualEffects(...visuals) {
    // Normalize inputs: ensure every entry is an object to avoid undefined property access
    const vs = visuals.map(v => v || {});
    
    // Combine visual effects from all elements (using normalized array)
    const fused = {
      trail: vs.some(v => v.trail),
      trailType: (vs.find(v => v.trail) || {}).trailType || 'trail',
      trailDensity: Math.floor(vs.reduce((sum, v) => sum + (v.trailDensity || 0), 0) / Math.max(1, vs.length)),
      trailSize: Math.floor(vs.reduce((sum, v) => sum + (v.trailSize || 0), 0) / Math.max(1, vs.length)),
      aura: vs.some(v => v.aura),
      auraSize: Math.floor(vs.reduce((sum, v) => sum + (v.auraSize || 0), 0) / Math.max(1, vs.length)),
      auraIntensity: vs.reduce((sum, v) => sum + (v.auraIntensity || 0), 0) / Math.max(1, vs.length),
      impactParticles: Math.floor(vs.reduce((sum, v) => sum + (v.impactParticles || 0), 0) / Math.max(1, vs.length)),
      impactType: (vs[0] && vs[0].impactType) || 'spark',
      
      // Special effects - combine from all elements
      beam: vs.some(v => v.beam),
      swirl: vs.some(v => v.swirl),
      vortex: vs.some(v => v.vortex),
      wispy: vs.some(v => v.wispy),
      shimmer: vs.some(v => v.shimmer),
      chaotic: vs.some(v => v.chaotic),
      pullParticles: vs.some(v => v.pullParticles),
      
      // Visual modifiers: size and shape
      sizeModifier: this.calculateSizeModifier(vs),
      shapeVariant: this.determineShapeVariant(vs)
    };
     
    return fused;
  }
  
  static calculateSizeModifier(visuals) {
    // Elements can affect projectile size
    // Base is 1.0, range from 0.7 to 1.5
    let sizeSum = 0;
    let count = 0;
    
    for (const v of visuals) {
      if (v && v.sizeMultiplier !== undefined) {
        sizeSum += v.sizeMultiplier;
        count++;
      }
    }
    
    if (count === 0) return 1.0;
    
    const average = sizeSum / count;
    // Add slight variety based on number of elements
    const varietyBonus = Math.min(0.15, (visuals.length - 1) * 0.05);
    return Math.max(0.7, Math.min(1.5, average + varietyBonus));
  }
  
  static determineShapeVariant(visuals) {
    // Determine projectile shape based on visual effects
    const hasBeam = visuals.some(v => v && v.beam);
    const hasSwirl = visuals.some(v => v && v.swirl);
    const hasVortex = visuals.some(v => v && v.vortex);
    
    if (hasBeam) return 'elongated';
    if (hasSwirl || hasVortex) return 'swirling';
    return 'round';
  }
}