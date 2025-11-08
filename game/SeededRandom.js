/**
 * SeededRandom: A simple seeded PRNG using a linear congruential generator (LCG).
 * Allows reproducible "random" sequences for game rewards and other mechanics.
 */
export class SeededRandom {
  constructor(seed = null) {
    if (seed === null) {
      // Generate a seed from current time and Math.random()
      seed = Math.floor(Math.random() * 0x7FFFFFFF);
    }
    this.seed = seed;
    this.state = seed;
  }

  /**
   * LCG parameters (same as glibc)
   */
  static LCG_A = 1103515245;
  static LCG_C = 12345;
  static LCG_M = 0x80000000; // 2^31

  /**
   * Returns the next pseudo-random number in [0, 1)
   */
  next() {
    this.state = (SeededRandom.LCG_A * this.state + SeededRandom.LCG_C) % SeededRandom.LCG_M;
    return this.state / SeededRandom.LCG_M;
  }

  /**
   * Returns a random integer in [min, max)
   */
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Returns a random element from an array
   */
  choice(arr) {
    if (arr.length === 0) return undefined;
    return arr[this.nextInt(0, arr.length)];
  }

  /**
   * Weighted random choice from array of { value, weight } objects
   */
  weightedChoice(options) {
    const total = options.reduce((sum, opt) => sum + opt.weight, 0);
    let r = this.next() * total;
    for (const opt of options) {
      if ((r -= opt.weight) < 0) {
        return opt.value;
      }
    }
    // Fallback (should not happen with valid weights)
    return options[options.length - 1].value;
  }
}