// Color blending utilities extracted from SpellFusion
export const ColorBlender = {
  blend(...colors) {
    if (!colors || colors.length === 0) return {
      primary: { r: 200, g: 200, b: 200 },
      accent: null,
      secondary: null
    };
    if (colors.length === 1) {
      const hsl = this.rgbToHsl(colors[0]);
      hsl.s *= 0.85;
      hsl.l = Math.min(0.65, hsl.l * 0.95);
      return { primary: this.hslToRgb(hsl), accent: null, secondary: null };
    }

    const primaryHsl = this.rgbToHsl(colors[0]);
    const allHsl = colors.map(c => this.rgbToHsl(c));

    let totalHue = primaryHsl.h * 2.5;
    let totalSat = 0;
    let totalLight = 0;
    let weightSum = 2.5;

    for (let i = 0; i < allHsl.length; i++) {
      const weight = i === 0 ? 2.5 : 0.8;
      if (i > 0) {
        let hueDiff = allHsl[i].h - primaryHsl.h;
        if (hueDiff > 180) hueDiff -= 360;
        if (hueDiff < -180) hueDiff += 360;
        totalHue += (primaryHsl.h + hueDiff) * weight;
        weightSum += weight;
      }
      totalSat += allHsl[i].s;
      totalLight += allHsl[i].l;
    }

    const finalHue = (totalHue / weightSum) % 360;
    const baseSat = totalSat / colors.length;
    const baseLight = totalLight / colors.length;
    const saturationBoost = Math.min(0.3, (colors.length - 1) * 0.12);
    const finalSat = Math.min(1.0, baseSat + saturationBoost);
    const lightnessBoost = Math.min(0.15, (colors.length - 1) * 0.05);
    const finalLight = Math.min(0.7, baseLight + lightnessBoost);

    const primaryColor = this.hslToRgb({ h: finalHue, s: finalSat, l: finalLight });

    let accentColor = null;
    let secondaryColor = null;

    if (colors.length >= 2) {
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
      const accentHsl = { ...allHsl[accentIndex] };
      accentHsl.s = Math.min(1.0, accentHsl.s * 1.3);
      accentHsl.l = Math.min(0.65, accentHsl.l * 1.15);
      accentColor = this.hslToRgb(accentHsl);

      if (colors.length >= 3) {
        let secHue = 0, secSat = 0, secLight = 0;
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

    return { primary: primaryColor, accent: accentColor, secondary: secondaryColor };
  },

  // NEW: Blend with element visual genes to determine secondary color and influence patterns
  blendWithVisualGenes(...elements) {
    if (!elements || elements.length === 0) {
      return {
        primary: { r: 200, g: 200, b: 200 },
        secondary: { r: 180, g: 180, b: 180 },
        accent: null
      };
    }

    // Extract primary and secondary colors from elements
    const primaryColors = elements.map(e => e.color);
    const secondaryColors = elements.map(e => e.secondaryColor || e.color);
    const visualGenes = elements.map(e => e.visualGenes || {
      primaryColorInfluence: 1.0,
      secondaryAffinity: 0.5,
      particleColor: 0.8,
      auraColor: 0.7
    });

    // Blend primary colors normally
    const blendedPrimary = this.blend(...primaryColors);
    const primaryResult = blendedPrimary.primary;

    // Blend secondary colors with weighting based on visual genes
    let secondaryHueSum = 0, secondarySatSum = 0, secondaryLightSum = 0;
    let secondaryWeightSum = 0;

    for (let i = 0; i < elements.length; i++) {
      const genes = visualGenes[i];
      const influence = (genes.secondaryAffinity || 0.5) * (genes.primaryColorInfluence || 1.0);
      const secHsl = this.rgbToHsl(secondaryColors[i]);
      
      // Position matters: earlier elements have stronger influence
      const positionMultiplier = 1 / (1 + i * 0.3);
      const weight = influence * positionMultiplier;

      secondaryHueSum += secHsl.h * weight;
      secondarySatSum += secHsl.s * weight;
      secondaryLightSum += secHsl.l * weight;
      secondaryWeightSum += weight;
    }

    let secondaryResult = primaryResult;
    if (secondaryWeightSum > 0) {
      const secondaryHsl = {
        h: (secondaryHueSum / secondaryWeightSum) % 360,
        s: Math.min(1.0, secondarySatSum / secondaryWeightSum),
        l: Math.min(0.75, secondaryLightSum / secondaryWeightSum)
      };
      secondaryResult = this.hslToRgb(secondaryHsl);
    }

    // Generate accent from the element with highest secondary affinity
    let accentColor = null;
    let maxSecondaryAffinity = 0;
    let accentElementIdx = -1;
    for (let i = 0; i < visualGenes.length; i++) {
      if ((visualGenes[i].secondaryAffinity || 0) > maxSecondaryAffinity) {
        maxSecondaryAffinity = visualGenes[i].secondaryAffinity || 0;
        accentElementIdx = i;
      }
    }
    if (accentElementIdx >= 0) {
      const accentHsl = this.rgbToHsl(secondaryColors[accentElementIdx]);
      accentHsl.s = Math.min(1.0, accentHsl.s * 1.2);
      accentHsl.l = Math.min(0.7, accentHsl.l * 1.1);
      accentColor = this.hslToRgb(accentHsl);
    }

    return {
      primary: primaryResult,
      secondary: secondaryResult,
      accent: accentColor
    };
  },

  rgbToHsl(rgb) {
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
    return { h: h * 360, s, l };
  },

  hslToRgb(hsl) {
    const h = hsl.h / 360, s = hsl.s, l = hsl.l;
    let r, g, b;
    if (s === 0) r = g = b = l;
    else {
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
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }
};