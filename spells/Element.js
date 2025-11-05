export class Element {
  constructor(name, color, traits) {
    this.name = name;
    this.color = color;
    this.traits = traits;
  }
}

export const ELEMENTS = {
  fire: new Element('Fire', { r: 255, g: 80, b: 20 }, {
    speed: 300,
    damage: 25,
    projectileType: 'straight',
    particleShape: 'spark',
    destructionType: 'explosive'
  }),
  
  frost: new Element('Frost', { r: 100, g: 200, b: 255 }, {
    speed: 200,
    damage: 15,
    projectileType: 'homing',
    particleShape: 'shard',
    destructionType: 'piercing'
  }),
  
  storm: new Element('Storm', { r: 200, g: 150, b: 255 }, {
    speed: 400,
    damage: 20,
    projectileType: 'bouncing',
    particleShape: 'bolt',
    destructionType: 'chain'
  }),
  
  stone: new Element('Stone', { r: 120, g: 100, b: 80 }, {
    speed: 150,
    damage: 35,
    projectileType: 'lob',
    particleShape: 'chunk',
    destructionType: 'shatter'
  })
};

