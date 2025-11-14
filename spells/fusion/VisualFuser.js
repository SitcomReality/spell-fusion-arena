// Visual effects fusion extracted from SpellFusion
export const VisualFuser = {
  fuse(...elements) {
    const visuals = elements.map(e => e.visualEffects || {});
    const properties = elements.map(e => e.propertyGenes || {});
    
    // 1. Calculate Rarity Score
    const { totalRarityScore, avgRarity } = this.calculateRarity(elements);

    // 2. Determine Shape and Texture
    const shapeAndTexture = this.determineShapeAndTexture(elements);

    // 3. Fuse Base Properties (particles, trails, auras)
    const baseEffects = this.fuseBaseEffects(visuals, avgRarity);
    
    // 4. Determine Advanced/Special Effects
    const specialEffects = this.determineSpecialEffects(elements, avgRarity);

    const fused = {
      ...baseEffects,
      ...shapeAndTexture,
      ...specialEffects,
      sizeModifier: this.calculateSizeModifier(visuals, avgRarity),
    };

    return fused;
  },
  
  calculateRarity(elements) {
    const rarityMap = {
      mundane: 1, common: 2, uncommon: 3, unusual: 4, rare: 5,
      prestigious: 6, exotic: 7, outstanding: 8, exceptional: 9,
      legendary: 10, wondrous: 11, supernal: 12, mythic: 13
    };
    const totalRarityScore = elements.reduce((sum, el) => sum + (rarityMap[el.rarity] || 1), 0);
    const avgRarity = totalRarityScore / Math.max(1, elements.length);
    return { totalRarityScore, avgRarity };
  },

  determineShapeAndTexture(elements) {
    const allProps = elements.map(e => e.propertyGenes || {});
    const allVisuals = elements.map(e => e.visualEffects || {});

    // Sum up influential properties
    const propSum = allProps.reduce((acc, props) => {
      Object.entries(props).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value;
      });
      return acc;
    }, {});
    
    const has = (prop) => (propSum[prop] || 0) > 0;
    const hasVisual = (prop) => allVisuals.some(v => v[prop]);

    // Rarity can unlock special glyphs
    const { avgRarity } = this.calculateRarity(elements);
    if (avgRarity > 10 && Math.random() < 0.3) {
      return { shapeVariant: 'glyph', texture: '/img/particle/magic_01.png' };
    }
    if (avgRarity > 7 && Math.random() < 0.2) {
      return { shapeVariant: 'glyph', texture: '/img/particle/magic_02.png' };
    }

    // Property-based shapes
    if (has('chaining') || hasVisual('chaotic')) {
      return { shapeVariant: 'electric', texture: '/img/particle/spark_02.png' };
    }
    if (hasVisual('beam') || (has('piercing') && propSum.speed > 300 * elements.length)) {
      return { shapeVariant: 'beam', texture: '/img/particle/trace_01.png' };
    }
    if (has('spiral') || has('wave')) {
        return { shapeVariant: 'swirl', texture: '/img/particle/slash_01.png' };
    }
    if (has('homing')) {
        return { shapeVariant: 'seeker', texture: '/img/particle/magic_03.png' };
    }
    if (has('aoe') || has('knockback')) {
      return { shapeVariant: 'heavy', texture: '/img/particle/circle_05.png' };
    }
    if (has('piercing')) {
      return { shapeVariant: 'shard', texture: '/img/particle/trace_06.png' };
    }
    
    // Default
    return { shapeVariant: 'core', texture: '/img/particle/star_03.png' };
  },

  fuseBaseEffects(visuals, avgRarity) {
    const count = Math.max(1, visuals.length);
    const rarityMultiplier = 1 + (avgRarity - 2) * 0.1;

    const trailType = (visuals.find(v => v.trailType) || {}).trailType || 'trail';
    const impactType = (visuals[0] && visuals[0].impactType) || 'spark';

    const fused = {
      trail: visuals.some(v => v.trail),
      trailType: trailType,
      trailDensity: Math.floor(visuals.reduce((sum, v) => sum + (v.trailDensity || 0), 0) / count * rarityMultiplier),
      trailSize: Math.floor(visuals.reduce((sum, v) => sum + (v.trailSize || 0), 0) / count),
      aura: visuals.some(v => v.aura),
      auraSize: Math.floor(visuals.reduce((sum, v) => sum + (v.auraSize || 0), 0) / count * rarityMultiplier),
      auraIntensity: visuals.reduce((sum, v) => sum + (v.auraIntensity || 0), 0) / count,
      impactParticles: Math.floor(visuals.reduce((sum, v) => sum + (v.impactParticles || 0), 0) / count * rarityMultiplier),
      impactType: impactType,
    };
    return fused;
  },

  determineSpecialEffects(elements, avgRarity) {
    const effects = {};
    const allProps = elements.map(e => e.propertyGenes || {});
    const propSum = allProps.reduce((acc, props) => {
        Object.entries(props).forEach(([key, value]) => {
            acc[key] = (acc[key] || 0) + value;
        });
        return acc;
    }, {});
    
    // Determine special impact type
    if ((propSum.aoe || 0) > 6 * elements.length) {
      effects.impactType = 'nova';
    } else if ((propSum.piercing || 0) > 7 * elements.length || (propSum.splitting || 0) > 5 * elements.length) {
      effects.impactType = 'shatter';
    } else if ((propSum.knockback || 0) < -5 * elements.length) { // Assuming negative knockback implies pull
      effects.impactType = 'implosion';
    }

    // Determine special aura effect
    if (avgRarity > 7 && (propSum.chaining || 0) > 5 * elements.length) {
        effects.specialAura = 'electric_crackle';
    } else if (avgRarity > 9 && (propSum.spiral || 0) > 6 * elements.length) {
        effects.specialAura = 'reality_distort';
    }
    
    return effects;
  },

  calculateSizeModifier(visuals, avgRarity) {
    let sizeSum = 0, count = 0;
    for (const v of visuals) {
      if (v && v.sizeMultiplier !== undefined) {
        sizeSum += v.sizeMultiplier;
        count++;
      }
    }
    if (count === 0) return 1.0;
    const average = sizeSum / count;
    const varietyBonus = Math.min(0.15, (visuals.length - 1) * 0.05);
    const rarityBonus = (avgRarity - 2) * 0.02;
    return Math.max(0.7, Math.min(1.5, average + varietyBonus + rarityBonus));
  },
};

