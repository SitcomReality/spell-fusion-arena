export class SpellFusion {
  static fuse(elements) {
    if (!elements || elements.length === 0) {
      return null;
    }

    if (elements.length === 1) {
      return {
        name: elements[0].name,
        color: elements[0].color,
        traits: { ...elements[0].traits },
        elements: [elements[0]]
      };
    }

    const blendedColor = this.blendColors(elements.map(e => e.color));
    const fusedTraits = this.fuseTraits(elements.map(e => e.traits));
    
    // Create a name based on the first two elements and how many others
    let name = `${elements[0].name}-${elements[1].name}`;
    if (elements.length > 2) {
      name += ` (+${elements.length - 2})`;
    }

    return {
      name,
      color: blendedColor,
      traits: fusedTraits,
      elements: elements
    };
  }
  
  static blendColors(colors) {
    const total = colors.length;
    const sum = colors.reduce((acc, c) => {
      acc.r += c.r;
      acc.g += c.g;
      acc.b += c.b;
      return acc;
    }, { r: 0, g: 0, b: 0 });

    return {
      r: Math.floor(sum.r / total),
      g: Math.floor(sum.g / total),
      b: Math.floor(sum.b / total)
    };
  }
  
  static fuseTraits(traitsArray) {
    const fused = {
        speed: 0,
        damage: 0,
    };
    const total = traitsArray.length;

    // Average numerical values
    traitsArray.forEach(traits => {
        for (const key in traits) {
            if (typeof traits[key] === 'number') {
                fused[key] = (fused[key] || 0) + traits[key];
            }
        }
    });
    
    for (const key in fused) {
        if (typeof fused[key] === 'number' && key !== 'damage' && key !== 'speed') {
            fused[key] /= traitsArray.filter(t => t[key]).length;
        }
    }
    fused.speed = (fused.speed || 0) / total;
    fused.damage = (fused.damage || 0) / total;

    // Combine other traits. The last element added has priority for conflicting traits.
    traitsArray.forEach(traits => {
        Object.assign(fused, traits);
    });

    // Special logic for pierce
    const hasPierce = traitsArray.some(t => t.pierce);
    if (hasPierce) {
        fused.pierce = true;
        fused.maxPierce = Math.max(...traitsArray.filter(t => t.maxPierce).map(t => t.maxPierce));
    }

    return fused;
  }
}

