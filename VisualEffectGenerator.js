/**
 * VisualEffectGenerator: Creates sophisticated visual effect configurations for fused spells
 * based on element properties, rarity, and available texture sprites.
 * 
 * Uses the full element objects and their rarity to determine:
 * - Projectile shape variants
 * - Trail types and textures
 * - Impact types and particle effects
 * - Persistent aura effects
 */

export const VisualEffectGenerator = {
  /**
   * Generate a complete visual effect configuration for a fused spell
   * @param {Array} elements - Full element objects being fused
   * @param {Object} properties - Fused spell properties
   * @returns {Object} Complete visual effects config
   */
  generate(elements, properties) {
    const rarityScores = this.calculateRarityScores(elements);
    const avgRarity = rarityScores.average;
    const maxRarity = rarityScores.max;

    return {
      // Projectile appearance
      shapeVariant: this.determineShapeVariant(elements, properties, maxRarity),
      sizeMultiplier: this.calculateSizeMultiplier(elements, avgRarity),
      
      // Trail effects
      trail: this.generateTrailConfig(elements, properties, avgRarity),
      
      // Impact effects
      impactType: this.determineImpactType(elements, properties, avgRarity),
      impactParticles: this.calculateImpactParticles(elements, properties, avgRarity),
      
      // Persistent aura
      aura: this.generateAuraConfig(elements, properties, avgRarity),
      
      // Quality indicators
      visibilityTier: this.calculateVisibilityTier(avgRarity),
      particleTextureLevel: this.calculateTextureLevel(maxRarity)
    };
  },

  /**
   * Calculate rarity scores for all elements
   */
  calculateRarityScores(elements) {
    const rarityMap = {
      mundane: 1, common: 2, uncommon: 3, unusual: 4, rare: 5,
      prestigious: 6, exotic: 7, outstanding: 8, exceptional: 9,
      legendary: 10, wondrous: 11, supernal: 12, mythic: 13
    };
    
    const scores = elements.map(el => rarityMap[el.rarity] || 2);
    return {
      scores,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      max: Math.max(...scores),
      sum: scores.reduce((a, b) => a + b, 0)
    };
  },

  /**
   * Determine projectile shape based on properties and rarity
   */
  determineShapeVariant(elements, properties, maxRarity) {
    // Shape priority: magical properties > damage type > rarity fallback
    
    // Spiral takes precedence
    if ((properties.spiral || 0) > 0.5) {
      return maxRarity >= 10 ? 'spiral-elite' : 'spiral';
    }
    
    // Wave effects suggest ethereal/undulating shapes
    if ((properties.wave || 0) > 0.5) {
      return maxRarity >= 8 ? 'wave-ethereal' : 'wave';
    }
    
    // Chaining suggests networked/connected appearance
    if ((properties.chaining || 0) > 0.5) {
      return maxRarity >= 9 ? 'chain-network' : 'chaining';
    }
    
    // Splitting suggests radiating/star-like
    if ((properties.splitting || 0) > 0.5) {
      return maxRarity >= 8 ? 'starburst' : 'splitting';
    }
    
    // Piercing suggests streamlined/focused
    if ((properties.piercing || 0) > 0.5) {
      return maxRarity >= 8 ? 'piercing-beam' : 'piercing';
    }
    
    // Homing suggests seeking/eye-like
    if ((properties.homing || 0) > 0.5) {
      return maxRarity >= 9 ? 'homing-seeker' : 'homing';
    }
    
    // DoT suggests corrosive/corrupting
    if ((properties.dot || 0) > 0.5) {
      return maxRarity >= 8 ? 'corrosive' : 'toxic';
    }
    
    // Knockback suggests forceful/heavy
    if ((properties.knockback || 0) > 0.5) {
      return maxRarity >= 8 ? 'impact-heavy' : 'knockback';
    }
    
    // Lifesteal suggests hungry/draining
    if ((properties.lifesteal || 0) > 0.5) {
      return maxRarity >= 8 ? 'drain-vortex' : 'drain';
    }
    
    // AoE suggests expanding/explosive
    if ((properties.aoe || 0) > 0.5) {
      return maxRarity >= 8 ? 'explosion' : 'blast';
    }
    
    // Default: round/sphere, more ornate at higher rarities
    return maxRarity >= 10 ? 'sphere-prismatic' : (maxRarity >= 6 ? 'sphere-shiny' : 'sphere');
  },

  /**
   * Generate trail configuration with texture selections
   */
  generateTrailConfig(elements, properties, avgRarity) {
    const baseConfig = {
      enabled: true,
      density: 3 + Math.round(avgRarity * 1.5),
      size: 2 + Math.round(avgRarity * 0.5)
    };

    // Select trail type and texture based on properties
    const trailSelection = this.selectTrailType(properties, avgRarity);
    
    return {
      ...baseConfig,
      type: trailSelection.type,
      texture: trailSelection.texture,
      useTexture: avgRarity >= 4, // Start using textures at uncommon+ rarity
      animationStyle: trailSelection.animationStyle
    };
  },

  /**
   * Select appropriate trail type and texture
   */
  selectTrailType(properties, avgRarity) {
    // Spark/lightning trails
    if ((properties.chaining || 0) > 3 || (properties.dot || 0) > 5) {
      return {
        type: 'spark',
        texture: avgRarity >= 8 ? '/img/particle/spark_04.png' : 
                 avgRarity >= 5 ? '/img/particle/spark_03.png' : '/img/particle/spark_01.png',
        animationStyle: 'electric'
      };
    }
    
    // Beam trails (piercing, light-based)
    if ((properties.piercing || 0) > 4 || elements.some(e => e.name?.toLowerCase().includes('light'))) {
      return {
        type: 'beam',
        texture: '/img/particle/trace_06.png',
        animationStyle: 'focused'
      };
    }
    
    // Smoke trails (slow, heavy)
    if ((properties.knockback || 0) > 4 || (properties.slowing || 0) > 4) {
      return {
        type: 'smoke',
        texture: avgRarity >= 7 ? '/img/particle/fire_02.png' : '/img/particle/smoke_01.png',
        animationStyle: 'diffuse'
      };
    }
    
    // Swirl trails (magical, spiral)
    if ((properties.spiral || 0) > 4 || (properties.wave || 0) > 4) {
      return {
        type: 'swirl',
        texture: '/img/particle/slash_01.png',
        animationStyle: 'rotating'
      };
    }
    
    // Default: mix of spark and trail
    return {
      type: 'spark',
      texture: avgRarity >= 6 ? '/img/particle/trace_01.png' : null,
      animationStyle: 'standard'
    };
  },

  /**
   * Determine impact effect type
   */
  determineImpactType(elements, properties, avgRarity) {
    // High-rarity elements get fancier impact effects
    if (avgRarity >= 11) {
      return ['reality-warp', 'cascade', 'shatter'][Math.floor(Math.random() * 3)];
    }
    
    if (avgRarity >= 8) {
      if ((properties.aoe || 0) > 5) return 'nova';
      if ((properties.splitting || 0) > 4) return 'starburst';
      if ((properties.dot || 0) > 5) return 'corrode';
      return 'explosion';
    }
    
    // Mid-tier impacts
    if (avgRarity >= 5) {
      if ((properties.knockback || 0) > 5) return 'shockwave';
      if ((properties.piercing || 0) > 4) return 'puncture';
      if ((properties.chaining || 0) > 4) return 'chain-burst';
      return 'burst';
    }
    
    // Low-tier: standard impacts
    if ((properties.aoe || 0) > 3) return 'blast';
    if ((properties.dot || 0) > 3) return 'scorch';
    return 'spark';
  },

  /**
   * Calculate impact particle count and configuration
   */
  calculateImpactParticles(elements, properties, avgRarity) {
    const baseCount = 15;
    const rarityBonus = Math.round(avgRarity * 2);
    const propertyBonus = this.calculatePropertyBonusParticles(properties);
    
    return {
      count: baseCount + rarityBonus + propertyBonus,
      textureVariation: Math.min(4, Math.round(avgRarity / 3)),
      types: this.selectImpactParticleTextures(elements, properties, avgRarity)
    };
  },

  /**
   * Calculate particle count bonus from properties
   */
  calculatePropertyBonusParticles(properties) {
    let bonus = 0;
    if ((properties.aoe || 0) > 0) bonus += 8;
    if ((properties.knockback || 0) > 0) bonus += 6;
    if ((properties.splitting || 0) > 0) bonus += 5;
    if ((properties.wave || 0) > 0) bonus += 4;
    return bonus;
  },

  /**
   * Select textures for impact particles based on properties and rarity
   */
  selectImpactParticleTextures(elements, properties, avgRarity) {
    const textures = [];
    
    // Always include a base spark texture
    if (avgRarity >= 8) {
      textures.push('/img/particle/star_09.png'); // six-pointed star
    } else if (avgRarity >= 5) {
      textures.push('/img/particle/star_05.png'); // eight-pointed
    } else {
      textures.push('/img/particle/star_01.png'); // basic star
    }
    
    // Add property-specific textures
    if ((properties.aoe || 0) > 5) {
      textures.push(avgRarity >= 8 ? '/img/particle/scorch_03.png' : '/img/particle/scorch_02.png');
    }
    
    if ((properties.chaining || 0) > 4) {
      textures.push('/img/particle/spark_02.png');
    }
    
    if ((properties.dot || 0) > 5) {
      textures.push(avgRarity >= 7 ? '/img/particle/fire_02.png' : '/img/particle/fire_01.png');
    }
    
    if ((properties.piercing || 0) > 4) {
      textures.push('/img/particle/trace_02.png');
    }
    
    if ((properties.splitting || 0) > 4) {
      textures.push('/img/particle/circle_03.png'); // expanding ring
    }
    
    if ((properties.wave || 0) > 4) {
      textures.push('/img/particle/light_03.png');
    }
    
    // For very high rarity, add magical textures
    if (avgRarity >= 10) {
      textures.push('/img/particle/magic_02.png', '/img/particle/magic_05.png');
    }
    
    return textures.length > 0 ? textures : ['/img/particle/light_01.png'];
  },

  /**
   * Generate aura configuration
   */
  generateAuraConfig(elements, properties, avgRarity) {
    const auraType = this.determineAuraType(elements, properties, avgRarity);
    
    return {
      enabled: avgRarity >= 3,
      type: auraType,
      size: 22 + Math.round(avgRarity * 3),
      intensity: 0.3 + (avgRarity / 15),
      color: this.calculateAuraColor(elements, avgRarity),
      animated: avgRarity >= 6,
      texture: this.selectAuraTexture(auraType, avgRarity)
    };
  },

  /**
   * Determine aura type based on properties
   */
  determineAuraType(elements, properties, avgRarity) {
    if (avgRarity >= 10) {
      if ((properties.chaining || 0) > 4) return 'electric-crackle';
      if ((properties.spiral || 0) > 4) return 'reality-distort';
      if ((properties.piercing || 0) > 4) return 'void-edge';
      return 'prismatic';
    }
    
    if (avgRarity >= 7) {
      if ((properties.dot || 0) > 5) return 'corrosion-aura';
      if ((properties.aoe || 0) > 5) return 'explosive-bloom';
      if ((properties.homing || 0) > 4) return 'seeking-glow';
      return 'mana-aura';
    }
    
    if ((properties.chaining || 0) > 4) return 'energy-crackle';
    if ((properties.aoe || 0) > 4) return 'radiance';
    return 'glow';
  },

  /**
   * Select texture for aura based on type
   */
  selectAuraTexture(auraType, avgRarity) {
    const textureMap = {
      'electric-crackle': '/img/particle/spark_04.png',
      'reality-distort': '/img/particle/magic_02.png',
      'void-edge': '/img/particle/circle_05.png',
      'prismatic': '/img/particle/star_09.png',
      'corrosion-aura': '/img/particle/fire_02.png',
      'explosive-bloom': '/img/particle/scorch_03.png',
      'seeking-glow': '/img/particle/magic_03.png',
      'mana-aura': '/img/particle/light_01.png',
      'energy-crackle': '/img/particle/spark_01.png',
      'radiance': '/img/particle/circle_04.png',
      'glow': null
    };
    
    return textureMap[auraType] || null;
  },

  /**
   * Calculate aura color based on elements and rarity
   */
  calculateAuraColor(elements, avgRarity) {
    // Use the fused spell's color as base, but adjust saturation/brightness by rarity
    const primaryEl = elements[0];
    const color = primaryEl.color || { r: 100, g: 100, b: 100 };
    
    // Higher rarity = higher saturation
    const saturationBoost = 1 + (avgRarity / 15);
    
    return {
      r: Math.min(255, Math.round(color.r * saturationBoost)),
      g: Math.min(255, Math.round(color.g * saturationBoost)),
      b: Math.min(255, Math.round(color.b * saturationBoost))
    };
  },

  /**
   * Calculate size multiplier based on rarity
   */
  calculateSizeMultiplier(elements, avgRarity) {
    const baseMultiplier = 1.0;
    const rarityBonus = avgRarity / 20; // Max +0.65 at mythic
    return baseMultiplier + rarityBonus;
  },

  /**
   * Determine visibility tier for VFX quality
   */
  calculateVisibilityTier(avgRarity) {
    if (avgRarity >= 11) return 'legendary';
    if (avgRarity >= 8) return 'rare';
    if (avgRarity >= 5) return 'uncommon';
    if (avgRarity >= 3) return 'common';
    return 'basic';
  },

  /**
   * Calculate texture usage level
   */
  calculateTextureLevel(maxRarity) {
    if (maxRarity >= 12) return 'mythic';
    if (maxRarity >= 10) return 'legendary';
    if (maxRarity >= 8) return 'rare';
    if (maxRarity >= 5) return 'uncommon';
    return 'common';
  }
};

export default VisualEffectGenerator;


