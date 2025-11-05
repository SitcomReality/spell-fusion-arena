export class SpellFusion {
  static fuse(element1, element2) {
    const blendedColor = this.blendColors(element1.color, element2.color);
    const fusedTraits = this.fuseTraits(element1.traits, element2.traits);
    
    return {
      name: `${element1.name}-${element2.name}`,
      color: blendedColor,
      traits: fusedTraits,
      elements: [element1, element2]
    };
  }
  
  static blendColors(color1, color2) {
    return {
      r: Math.floor((color1.r + color2.r) / 2),
      g: Math.floor((color1.g + color2.g) / 2),
      b: Math.floor((color1.b + color2.b) / 2)
    };
  }
  
  static fuseTraits(traits1, traits2) {
    return {
      speed: (traits1.speed + traits2.speed) / 2,
      damage: (traits1.damage + traits2.damage) / 2,
      projectileType: Math.random() > 0.5 ? traits1.projectileType : traits2.projectileType,
      particleShape: traits1.particleShape,
      secondaryShape: traits2.particleShape,
      destructionType: traits1.destructionType,
      secondaryDestruction: traits2.destructionType
    };
  }
}

