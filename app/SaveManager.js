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

// NEW: WebSim high-score API integration for top-10 (one entry per username)
const WEBSIM_HIGHSCORE_ENDPOINT = '/api/highscores'; // configurable endpoint; proxy or server provides this

/**
 * Fetch the current top-10 high scores from the remote database.
 * Returns an array of { username, score, wave } or [] on error.
 */
export async function fetchRemoteTopScores() {
  try {
    const res = await fetch(WEBSIM_HIGHSCORE_ENDPOINT, { method: 'GET', credentials: 'same-origin' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.slice(0, 10);
  } catch (e) {
    console.warn('Failed to fetch remote top scores', e);
    return [];
  }
}

/**
 * Submit or update a single user's entry in the remote top-10 list.
 * The server is expected to enforce "one entry per username" and ordering.
 * Returns true on success, false otherwise.
 */
export async function submitRemoteTopScore(username, score, wave) {
  if (!username) username = 'Player';
  try {
    const payload = { username, score: Number(score) || 0, wave: Number(wave) || 0 };
    const res = await fetch(WEBSIM_HIGHSCORE_ENDPOINT, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to submit remote top score', e);
    return false;
  }
}

/**
 * Helper: Atomically check and update remote top-10 if this player's score qualifies.
 * - Ensures at most one entry per username.
 * - Replaces the lowest entry if not present and qualifies.
 *
 * Returns true if remote list was changed, false otherwise.
 */
export async function checkAndUpdateRemoteTopTen(username, score, wave) {
  try {
    const top = await fetchRemoteTopScores();
    // Normalize
    const normalized = top.map(t => ({ username: String(t.username || ''), score: Number(t.score || 0), wave: Number(t.wave || 0) }));
    // If player already in list, update if new score is higher
    const existingIdx = normalized.findIndex(e => e.username === username);
    if (existingIdx >= 0) {
      if (score > normalized[existingIdx].score) {
        // update server with new value
        return await submitRemoteTopScore(username, score, wave);
      }
      return false; // no change required
    }
    // Not present: if list has <10 entries, submit; else check whether beats lowest
    if (normalized.length < 10) {
      return await submitRemoteTopScore(username, score, wave);
    }
    // find lowest
    let min = normalized[0];
    for (const it of normalized) if (it.score < min.score) min = it;
    if (score > min.score) {
      return await submitRemoteTopScore(username, score, wave);
    }
    return false;
  } catch (e) {
    console.warn('Failed to check/update remote top ten', e);
    return false;
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