import { ColorUtils } from './colorUtils.js';

// Primary blending logic extracted from previous monolith.
// Handles 1..N color inputs and computes a pleasing primary, accent, secondary.
export const BlendPrimary = {
  blend(...colors) {
    if (!colors || colors.length === 0) return {
      primary: { r: 200, g: 200, b: 200 },
      accent: null,
      secondary: null
    };
    if (colors.length === 1) {
      const hsl = ColorUtils.rgbToHsl(colors[0]);
      hsl.s *= 0.85;
      hsl.l = Math.min(0.65, hsl.l * 0.95);
      return { primary: ColorUtils.hslToRgb(hsl), accent: null, secondary: null };
    }

    const primaryHsl = ColorUtils.rgbToHsl(colors[0]);
    const allHsl = colors.map(c => ColorUtils.rgbToHsl(c));

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

    const primaryColor = ColorUtils.hslToRgb({ h: finalHue, s: finalSat, l: finalLight });

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
      accentColor = ColorUtils.hslToRgb(accentHsl);

      if (colors.length >= 3) {
        let secHue = 0, secSat = 0, secLight = 0;
        for (let i = 1; i < allHsl.length; i++) {
          secHue += allHsl[i].h;
          secSat += allHsl[i].s;
          secLight += allHsl[i].l;
        }
        const count = colors.length - 1;
        secondaryColor = ColorUtils.hslToRgb({
          h: (secHue / count) % 360,
          s: Math.min(1.0, (secSat / count) * 1.2),
          l: Math.min(0.6, (secLight / count) * 1.1)
        });
      }
    }

    return { primary: primaryColor, accent: accentColor, secondary: secondaryColor };
  }
};