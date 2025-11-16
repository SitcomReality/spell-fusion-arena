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
      score: gameApp.gameState ? gameApp.gameState.score : 0,
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
    // Use the built-in WebsimSocket available in the runtime instead of attempting to import from esm.sh
    const room = new WebsimSocket();
    const topScores = await room.collection('highscore_v1').getList();
    const sorted = Array.isArray(topScores) ? topScores.sort((a, b) => (b.score || 0) - (a.score || 0)) : [];
    return sorted.slice(0, 10);
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
    const room = new WebsimSocket();
    const topScores = await room.collection('highscore_v1').getList();
    
    const userEntry = Array.isArray(topScores) ? topScores.find(s => s.username === username) : undefined;
    
    if (userEntry) {
      // Update if new score is higher
      if (score > userEntry.score) {
        await room.collection('highscore_v1').update(userEntry.id, { score, wave });
      }
    } else {
      // Before adding a new entry, delete any stale entries with this username to prevent duplicates
      const allEntries = Array.isArray(topScores) ? topScores : [];
      for (const entry of allEntries) {
        if (entry.username === username) {
          await room.collection('highscore_v1').delete(entry.id);
        }
      }
      
      // Now add/replace the entry
      if (allEntries.length < 10) {
        await room.collection('highscore_v1').create({ username, score, wave });
      } else {
        const sorted = allEntries.sort((a, b) => (b.score || 0) - (a.score || 0));
        const lowest = sorted[9];
        if (score > (lowest.score || 0)) {
          await room.collection('highscore_v1').update(lowest.id, { username, score, wave });
        }
      }
    }
    
    return true;
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