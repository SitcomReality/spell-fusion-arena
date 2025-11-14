import { ColorUtils } from './colorUtils.js';

/**
 * VisualBlender: Handles color blending for fused spells
 * Now accepts full element objects to leverage secondary/accent colors
 */
export const VisualBlender = {
  /**
   * Blend colors from multiple full element objects
   */
  blendWithVisualGenes(...elements) {
    if (!elements || elements.length === 0) {
      return {
        primary: { r: 200, g: 200, b: 200 },
        secondary: { r: 180, g: 180, b: 180 },
        accent: null
      };
    }

    // Filter valid elements and extract color data
    const validElements = elements.filter(e => e && e.color);
    
    if (validElements.length === 0) {
      return {
        primary: { r: 200, g: 200, b: 200 },
        secondary: { r: 180, g: 180, b: 180 },
        accent: null
      };
    }

    const primaryColors = validElements.map(e => e.color);
    const secondaryColors = validElements.map(e => e.secondaryColor || e.color);
    const accentColors = validElements.map(e => e.accentColor || e.secondaryColor || e.color);

    // Convert to HSL for blending
    const primHslList = primaryColors.map(c => ColorUtils.rgbToHsl(c));
    const secHslList = secondaryColors.map(c => ColorUtils.rgbToHsl(c));
    const accentHslList = accentColors.map(c => ColorUtils.rgbToHsl(c));

    // Weight by position (earlier elements have more influence) and saturation
    let weightedHuePrimary = 0, weightedSatPrimary = 0, weightedLightPrimary = 0, weightPrimSum = 0;
    let weightedHueSecondary = 0, weightedSatSecondary = 0, weightedLightSecondary = 0, weightSecSum = 0;
    let weightedHueAccent = 0, weightedSatAccent = 0, weightedLightAccent = 0, weightAccentSum = 0;

    for (let i = 0; i < validElements.length; i++) {
      const p = primHslList[i];
      const s = secHslList[i];
      const a = accentHslList[i];
      
      // Position weighting: earlier elements weighted more heavily
      const posPrim = 1.2 - (i / Math.max(1, validElements.length)) * 0.6;
      const posSec = 0.8 + (i / Math.max(1, validElements.length)) * 0.6;
      const posAccent = 1.0;

      // Saturation weighting
      const satBoostPrim = 0.5 + p.s;
      const satBoostSec = 0.5 + s.s * 0.8;
      const satBoostAccent = 0.5 + a.s * 1.1;

      const wPrim = posPrim * satBoostPrim;
      const wSec = posSec * satBoostSec;
      const wAccent = posAccent * satBoostAccent;

      // Accumulate weighted color components
      weightedHuePrimary += (p.h * wPrim);
      weightedSatPrimary += (p.s * wPrim);
      weightedLightPrimary += (p.l * wPrim);
      weightPrimSum += wPrim;

      weightedHueSecondary += (s.h * wSec);
      weightedSatSecondary += (s.s * wSec);
      weightedLightSecondary += (s.l * wSec);
      weightSecSum += wSec;

      weightedHueAccent += (a.h * wAccent);
      weightedSatAccent += (a.s * wAccent);
      weightedLightAccent += (a.l * wAccent);
      weightAccentSum += wAccent;
    }

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

    const accentHsl = {
      h: weightAccentSum > 0 ? (weightedHueAccent / weightAccentSum) % 360 : accentHslList[0].h,
      s: Math.min(1, weightAccentSum > 0 ? (weightedSatAccent / weightAccentSum) : accentHslList[0].s),
      l: Math.min(1, weightAccentSum > 0 ? (weightedLightAccent / weightAccentSum) : accentHslList[0].l)
    };

    // Apply saturation boost based on element count and rarity
    const avgInputSat = (primHslList.reduce((s, x) => s + x.s, 0) + secHslList.reduce((s, x) => s + x.s, 0)) / (primHslList.length + secHslList.length);
    const satScale = 0.6 + Math.pow(avgInputSat, 1.2) * 0.55;
    primaryHsl.s = Math.min(1, primaryHsl.s * satScale);
    secondaryHsl.s = Math.min(1, secondaryHsl.s * (0.9 + (1 - avgInputSat) * 0.1));
    accentHsl.s = Math.min(1, accentHsl.s * 1.15); // Accents are more saturated

    // Handle near-grayscale colors
    const BLACK_WHITE_SAT_THRESHOLD = 0.06;
    const BLACK_LIGHTNESS_THRESHOLD = 0.12;
    const WHITE_LIGHTNESS_THRESHOLD = 0.88;

    let primaryRgb = ColorUtils.hslToRgb(primaryHsl);
    if (primaryHsl.s < BLACK_WHITE_SAT_THRESHOLD) {
      if (primaryHsl.l <= BLACK_LIGHTNESS_THRESHOLD) {
        primaryRgb = { r: 0, g: 0, b: 0 };
      } else if (primaryHsl.l >= WHITE_LIGHTNESS_THRESHOLD) {
        primaryRgb = { r: 255, g: 255, b: 255 };
      } else {
        const gray = Math.round(primaryHsl.l * 255);
        primaryRgb = { r: gray, g: gray, b: gray };
      }
    }

    let secondaryRgb = ColorUtils.hslToRgb(secondaryHsl);
    if (secondaryHsl.s < BLACK_WHITE_SAT_THRESHOLD) {
      if (secondaryHsl.l <= BLACK_LIGHTNESS_THRESHOLD) {
        secondaryRgb = { r: 0, g: 0, b: 0 };
      } else if (secondaryHsl.l >= WHITE_LIGHTNESS_THRESHOLD) {
        secondaryRgb = { r: 255, g: 255, b: 255 };
      } else {
        const gray = Math.round(secondaryHsl.l * 255);
        secondaryRgb = { r: gray, g: gray, b: gray };
      }
    }

    let accentRgb = ColorUtils.hslToRgb(accentHsl);
    if (accentHsl.s < BLACK_WHITE_SAT_THRESHOLD) {
      if (accentHsl.l <= BLACK_LIGHTNESS_THRESHOLD) {
        accentRgb = { r: 0, g: 0, b: 0 };
      } else if (accentHsl.l >= WHITE_LIGHTNESS_THRESHOLD) {
        accentRgb = { r: 255, g: 255, b: 255 };
      } else {
        const gray = Math.round(accentHsl.l * 255);
        accentRgb = { r: gray, g: gray, b: gray };
      }
    }

    return {
      primary: primaryRgb,
      secondary: secondaryRgb,
      accent: accentRgb
    };
  }
};

export default VisualBlender;