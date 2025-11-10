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

    // Convert all to HSL up-front
    const primHslList = primaryColors.map(c => this.rgbToHsl(c));
    const secHslList = secondaryColors.map(c => this.rgbToHsl(c));

    // Compute saturation influence: stronger contribution from high-sat elements,
    // but preserve order influence: earlier elements bias primary, later bias secondary.
    let weightedHuePrimary = 0, weightedSatPrimary = 0, weightedLightPrimary = 0, weightPrimSum = 0;
    let weightedHueSecondary = 0, weightedSatSecondary = 0, weightedLightSecondary = 0, weightSecSum = 0;

    for (let i = 0; i < elements.length; i++) {
      const p = primHslList[i];
      const s = secHslList[i];
      const genes = visualGenes[i] || {};
      // position weight: earlier elements favor primary, later favor secondary
      const posPrim = 1.2 - (i / Math.max(1, elements.length)) * 0.6; // in [~0.6..1.2]
      const posSec  = 0.8 + (i / Math.max(1, elements.length)) * 0.6; // in [0.8..1.4]
      // saturation multiplier: more saturated colors should influence final saturation more
      const satBoostPrim = 0.5 + p.s * (genes.primaryColorInfluence || 1.0);
      const satBoostSec  = 0.5 + s.s * (genes.secondaryAffinity || 0.5);

      const wPrim = posPrim * satBoostPrim;
      const wSec = posSec * satBoostSec;

      // accumulate primary mix
      weightedHuePrimary += (p.h * wPrim);
      weightedSatPrimary += (p.s * wPrim);
      weightedLightPrimary += (p.l * wPrim);
      weightPrimSum += wPrim;

      // accumulate secondary mix
      weightedHueSecondary += (s.h * wSec);
      weightedSatSecondary += (s.s * wSec);
      weightedLightSecondary += (s.l * wSec);
      weightSecSum += wSec;
    }

    // finalize HSL averages (clamp/normalize)
    const primaryHsl = {
      h: weightPrimSum > 0 ? (weightedHuePrimary / weightPrimSum) % 360 : primHslList[0].h,
      s: Math.min(1, weightPrimSum > 0 ? (weightedSatPrimary / weightPrimSum) : primHslList[0].s),
      l: Math.min(1, weightPrimSum > 0 ? (weightedLightPrimary / weightPrimSum) : primHslList[0].l)
    };

    const secondaryHsl = {
      h: weightSecSum > 0 ? (weightedHueSecondary / weightSecSum) % 360 : secHslList[0].h,
      s: Math.min(1, weightSecSum > 0 ? (weightedSatSecondary / weightSecSum) : secHslList[0].s),
      l: Math.min(1, weightSecSum > 0 ? (weightedLightSecondary / weightSecSum) : secHslList[0].l)
    };

    // Combine an overall saturation modifier so that very desaturated ingredient sets
    // produce a final desaturated outcome; strong saturated ingredients can rescue saturation.
    const avgInputSat = (primHslList.reduce((s, x) => s + x.s, 0) + secHslList.reduce((s, x) => s + x.s, 0)) / (primHslList.length + secHslList.length);
    // scale factor in [0.6..1.15] so desaturated pools bias down, saturated pools can boost slightly
    const satScale = 0.6 + Math.pow(avgInputSat, 1.2) * 0.55;
    primaryHsl.s = Math.min(1, primaryHsl.s * satScale);
    secondaryHsl.s = Math.min(1, secondaryHsl.s * (0.9 + (1 - avgInputSat) * 0.1)); // slightly lower influence for secondary

    // Strict black/white thresholding:
    // If the resulting saturation is extremely low and lightness is near extremes, snap to pure black or white.
    const BLACK_WHITE_SAT_THRESHOLD = 0.06; // very desaturated
    const BLACK_LIGHTNESS_THRESHOLD = 0.12; // dark enough -> black
    const WHITE_LIGHTNESS_THRESHOLD = 0.88; // light enough -> white

    let primaryRgb = this.hslToRgb(primaryHsl);
    // Check for black/white snapping using primary result (drives final dominant color)
    const primLum = primaryHsl.l;
    const primSat = primaryHsl.s;
    if (primSat < BLACK_WHITE_SAT_THRESHOLD) {
      if (primLum <= BLACK_LIGHTNESS_THRESHOLD) {
        primaryRgb = { r: 0, g: 0, b: 0 };
      } else if (primLum >= WHITE_LIGHTNESS_THRESHOLD) {
        primaryRgb = { r: 255, g: 255, b: 255 };
      } else {
        // Slightly desaturate toward gray but do not fully snap
        const gray = Math.round(primaryHsl.l * 255);
        primaryRgb = { r: gray, g: gray, b: gray };
      }
    }

    // For secondary, prefer a slightly lower saturation and allow ordering to cause secondary
    // to sometimes be a muted variant of primary if elements are similar.
    const secRgbCandidate = this.hslToRgb(secondaryHsl);
    let secondaryRgb = secRgbCandidate;

    const secLum = secondaryHsl.l;
    const secSat = secondaryHsl.s;
    if (secSat < BLACK_WHITE_SAT_THRESHOLD) {
      if (secLum <= BLACK_LIGHTNESS_THRESHOLD) {
        secondaryRgb = { r: 0, g: 0, b: 0 };
      } else if (secLum >= WHITE_LIGHTNESS_THRESHOLD) {
        secondaryRgb = { r: 255, g: 255, b: 255 };
      } else {
        const gray = Math.round(secondaryHsl.l * 255);
        secondaryRgb = { r: gray, g: gray, b: gray };
      }
    }

    // Accent: pick the element with the most contrasting hue to primary (as before),
    // but penalize accent selection if its saturation is very low (prefer vivid accents).
    let accentColor = null;
    let maxHueDiff = 0;
    let accentIndex = -1;
    for (let i = 0; i < primHslList.length; i++) {
      let hueDiff = Math.abs(primHslList[i].h - primaryHsl.h);
      if (hueDiff > 180) hueDiff = 360 - hueDiff;
      // boost for saturated candidates
      const satFactor = 1 + primHslList[i].s;
      const score = hueDiff * satFactor;
      if (score > maxHueDiff) {
        maxHueDiff = score;
        accentIndex = i;
      }
    }
    if (accentIndex >= 0) {
      const accentHsl = { ...primHslList[accentIndex] };
      // accent should be slightly more saturated/light adjusted for visibility
      accentHsl.s = Math.min(1.0, accentHsl.s * 1.25);
      accentHsl.l = Math.min(0.85, accentHsl.l * 1.05);
      accentColor = this.hslToRgb(accentHsl);
    }

    return { primary: primaryRgb, secondary: secondaryRgb, accent: accentColor };
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