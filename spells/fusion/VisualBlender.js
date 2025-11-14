import { ColorUtils } from './colorUtils.js';

// Blend that considers visualGenes and secondary colors to produce primary/secondary/accent
export const VisualBlender = {
  blendWithVisualGenes(...elements) {
    if (!elements || elements.length === 0) {
      return {
        primary: { r: 200, g: 200, b: 200 },
        secondary: { r: 180, g: 180, b: 180 },
        accent: null
      };
    }

    const primaryColors = elements.map(e => e.color);
    const secondaryColors = elements.map(e => e.secondaryColor || e.color);
    const visualGenes = elements.map(e => e.visualGenes || {
      primaryColorInfluence: 1.0,
      secondaryAffinity: 0.5,
      particleColor: 0.8,
      auraColor: 0.7
    });

    const primHslList = primaryColors.map(c => ColorUtils.rgbToHsl(c));
    const secHslList = secondaryColors.map(c => ColorUtils.rgbToHsl(c));

    let weightedHuePrimary = 0, weightedSatPrimary = 0, weightedLightPrimary = 0, weightPrimSum = 0;
    let weightedHueSecondary = 0, weightedSatSecondary = 0, weightedLightSecondary = 0, weightSecSum = 0;

    for (let i = 0; i < elements.length; i++) {
      const p = primHslList[i];
      const s = secHslList[i];
      const genes = visualGenes[i] || {};
      const posPrim = 1.2 - (i / Math.max(1, elements.length)) * 0.6;
      const posSec = 0.8 + (i / Math.max(1, elements.length)) * 0.6;
      const satBoostPrim = 0.5 + p.s * (genes.primaryColorInfluence || 1.0);
      const satBoostSec = 0.5 + s.s * (genes.secondaryAffinity || 0.5);

      const wPrim = posPrim * satBoostPrim;
      const wSec = posSec * satBoostSec;

      weightedHuePrimary += (p.h * wPrim);
      weightedSatPrimary += (p.s * wPrim);
      weightedLightPrimary += (p.l * wPrim);
      weightPrimSum += wPrim;

      weightedHueSecondary += (s.h * wSec);
      weightedSatSecondary += (s.s * wSec);
      weightedLightSecondary += (s.l * wSec);
      weightSecSum += wSec;
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

    const avgInputSat = (primHslList.reduce((s, x) => s + x.s, 0) + secHslList.reduce((s, x) => s + x.s, 0)) / (primHslList.length + secHslList.length);
    const satScale = 0.6 + Math.pow(avgInputSat, 1.2) * 0.55;
    primaryHsl.s = Math.min(1, primaryHsl.s * satScale);
    secondaryHsl.s = Math.min(1, secondaryHsl.s * (0.9 + (1 - avgInputSat) * 0.1));

    const BLACK_WHITE_SAT_THRESHOLD = 0.06;
    const BLACK_LIGHTNESS_THRESHOLD = 0.12;
    const WHITE_LIGHTNESS_THRESHOLD = 0.88;

    let primaryRgb = ColorUtils.hslToRgb(primaryHsl);
    const primLum = primaryHsl.l;
    const primSat = primaryHsl.s;
    if (primSat < BLACK_WHITE_SAT_THRESHOLD) {
      if (primLum <= BLACK_LIGHTNESS_THRESHOLD) {
        primaryRgb = { r: 0, g: 0, b: 0 };
      } else if (primLum >= WHITE_LIGHTNESS_THRESHOLD) {
        primaryRgb = { r: 255, g: 255, b: 255 };
      } else {
        const gray = Math.round(primaryHsl.l * 255);
        primaryRgb = { r: gray, g: gray, b: gray };
      }
    }

    const secRgbCandidate = ColorUtils.hslToRgb(secondaryHsl);
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

    let accentColor = null;
    let maxHueDiff = 0;
    let accentIndex = -1;
    for (let i = 0; i < primHslList.length; i++) {
      let hueDiff = Math.abs(primHslList[i].h - primaryHsl.h);
      if (hueDiff > 180) hueDiff = 360 - hueDiff;
      const satFactor = 1 + primHslList[i].s;
      const score = hueDiff * satFactor;
      if (score > maxHueDiff) {
        maxHueDiff = score;
        accentIndex = i;
      }
    }
    if (accentIndex >= 0) {
      const accentHsl = { ...primHslList[accentIndex] };
      accentHsl.s = Math.min(1.0, accentHsl.s * 1.25);
      accentHsl.l = Math.min(0.85, accentHsl.l * 1.05);
      accentColor = ColorUtils.hslToRgb(accentHsl);
    }

    return { primary: primaryRgb, secondary: secondaryRgb, accent: accentColor };
  }
};