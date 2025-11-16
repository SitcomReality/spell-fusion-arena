export function saveGameSnapshot(gameApp) {
  try {
    const payload = {
      unlockedElementKeys: gameApp.gameState ? gameApp.gameState.unlockedElementKeys : [],
      essenceBank: gameApp.fusionUI ? gameApp.fusionUI.essenceBank : 0,
      focusBank: gameApp.fusionUI ? gameApp.fusionUI.focusBank : 0,
      spellInventory: gameApp.fusionUI ? gameApp.fusionUI.spellInventory : [],
      equippedSpells: gameApp.fusionUI ? gameApp.fusionUI.equippedSpells : [null, null, null, null],
      spellSlotFocus: gameApp.fusionUI ? gameApp.fusionUI.spellSlotFocus : [1,0,0,0],
      targetPreferences: gameApp.fusionUI && gameApp.fusionUI.state ? gameApp.fusionUI.state.targetPreferences : ['nearest', 'furthest', 'strongest', 'weakest'],
      playerHp: gameApp.gameState ? gameApp.gameState.player.hp : undefined,
      wave: gameApp.gameState ? gameApp.gameState.waveManager.currentWave : undefined,
      seed: gameApp.gameState ? gameApp.gameState.seed : undefined
    };
    localStorage.setItem('spellFusion_save_v2', JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save game state', e);
  }
}

export function loadGameSnapshot() {
  try {
    const saved = localStorage.getItem('spellFusion_save_v2');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to parse saved game', e);
    return null;
  }
}

// NEW: High Score management
const HIGH_SCORE_KEY = 'spellFusion_highScore_v2';

/**
 * Saves the highest score and wave reached to local storage.
 * @param {number} score 
 * @param {number} wave 
 */
export function saveHighScore(score, wave) {
  try {
    const data = { score: score, wave: wave };
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save high score', e);
  }
}

/**
 * Loads the saved high score data.
 * @returns {{ score: number, wave: number } | null}
 */
export function loadHighScore() {
  try {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (!saved) return null;
    const data = JSON.parse(saved);
    if (typeof data.score === 'number' && typeof data.wave === 'number') {
      return data;
    }
    return null;
  } catch (e) {
    console.warn('Failed to load high score', e);
    return null;
  }
}