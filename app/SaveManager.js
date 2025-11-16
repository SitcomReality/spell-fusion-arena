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
      seed: gameApp.gameState ? gameApp.gameState.seed : undefined,
      score: gameApp.gameState ? gameApp.gameState.score : 0
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
  // Prefer Websim database API when available
  try {
    if (typeof window !== 'undefined' && window.websim) {
      try {
        // Reuse a singleton room instance to avoid repeated connection churn
        if (!window._websimRoom) {
          window._websimRoom = new window.WebsimSocket();
        }
        const room = window._websimRoom;
        // Get all highscore_v2 records (most recent -> oldest)
        let records = room.collection('highscore_v2').getList() || [];
        // Convert to plain objects and select top 10 by score descending, but ensure unique usernames (highest per user)
        const byUser = new Map();
        for (const r of records) {
          const uname = (r.username || '').toString();
          const score = Number(r.score || 0);
          const wave = Number(r.wave || 0);
          if (!byUser.has(uname) || byUser.get(uname).score < score) {
            byUser.set(uname, { username: uname, score, wave, id: r.id, created_at: r.created_at });
          }
        }
        const arr = Array.from(byUser.values()).sort((a, b) => b.score - a.score).slice(0, 10);
        return arr;
      } catch (e) {
        console.warn('Websim top-score fetch failed, falling back to HTTP', e);
        // fallthrough to HTTP fallback below
      }
    }

    // HTTP fallback
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
 * Uses Websim when available; otherwise uses HTTP POST fallback.
 * Returns true on success, false otherwise.
 */
export async function submitRemoteTopScore(username, score, wave) {
  if (!username) username = 'Player';
  try {
    // Prefer Websim API when available
    if (typeof window !== 'undefined' && window.websim) {
      try {
        if (!window._websimRoom) {
          window._websimRoom = new window.WebsimSocket();
        }
        const room = window._websimRoom;
        // Get existing records for this username
        const existing = room.collection('highscore_v2').filter({ username }).getList() || [];
        if (existing.length > 0) {
          // There may be one or more (but policy is one-per-user) — update the highest if our score is higher
          // Find record with highest score for this user
          let best = existing[0];
          for (const rec of existing) {
            if (Number(rec.score || 0) > Number(best.score || 0)) best = rec;
          }
          if (score > Number(best.score || 0)) {
            await room.collection('highscore_v2').update(best.id, { score: Number(score), wave: Number(wave) });
            return true;
          }
          return false;
        } else {
          // Create a new record
          await room.collection('highscore_v2').create({ username, score: Number(score), wave: Number(wave) });
          return true;
        }
      } catch (e) {
        console.warn('Websim submit failed, falling back to HTTP', e);
        // fallthrough to HTTP below
      }
    }

    // HTTP fallback
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
 * Uses Websim API when available to enforce one-entry-per-username constraints and to
 * replace the lowest entry when necessary.
 *
 * Returns true if remote list was changed, false otherwise.
 */
export async function checkAndUpdateRemoteTopTen(username, score, wave) {
  try {
    // Try Websim-backed flow first for atomic-ish behavior
    if (typeof window !== 'undefined' && window.websim) {
      try {
        if (!window._websimRoom) {
          window._websimRoom = new window.WebsimSocket();
        }
        const room = window._websimRoom;

        // Fetch all highscores and normalize to highest-per-username
        const all = room.collection('highscore_v2').getList() || [];
        const byUser = new Map();
        for (const r of all) {
          const uname = (r.username || '').toString();
          const sc = Number(r.score || 0);
          const wv = Number(r.wave || 0);
          if (!byUser.has(uname) || byUser.get(uname).score < sc) {
            byUser.set(uname, { id: r.id, username: uname, score: sc, wave: wv, created_at: r.created_at });
          }
        }
        const entries = Array.from(byUser.values()).sort((a, b) => b.score - a.score);

        // If user already present
        const existing = entries.find(e => e.username === username);
        if (existing) {
          if (score > existing.score) {
            // Update existing record
            await room.collection('highscore_v2').update(existing.id, { score: Number(score), wave: Number(wave) });
            return true;
          }
          return false;
        }

        // Not present: if fewer than 10 entries, create new record
        if (entries.length < 10) {
          await room.collection('highscore_v2').create({ username, score: Number(score), wave: Number(wave) });
          return true;
        }

        // Otherwise check if beat the lowest entry
        const lowest = entries[entries.length - 1];
        if (score > lowest.score) {
          // Delete the lowest entry (best-effort) then create new for this user.
          try {
            await room.collection('highscore_v2').delete(lowest.id);
          } catch (e) {
            // deletion may fail due to permissions; attempt to replace by updating the lowest (if owned)
            // If we cannot delete, still attempt to create — server-side should enforce top-10 uniqueness
            console.warn('Failed to delete lowest remote highscore, attempting create', e);
          }
          await room.collection('highscore_v2').create({ username, score: Number(score), wave: Number(wave) });
          return true;
        }

        return false;
      } catch (e) {
        console.warn('Websim top-ten check failed, falling back to HTTP flow', e);
        // fallthrough to HTTP-based approach below
      }
    }

    // HTTP fallback: existing behavior (fetch list and POST if qualifies)
    const top = await fetchRemoteTopScores();
    const normalized = top.map(t => ({ username: String(t.username || ''), score: Number(t.score || 0), wave: Number(t.wave || 0) }));
    const existingIdx = normalized.findIndex(e => e.username === username);
    if (existingIdx >= 0) {
      if (score > normalized[existingIdx].score) {
        return await submitRemoteTopScore(username, score, wave);
      }
      return false;
    }
    if (normalized.length < 10) {
      return await submitRemoteTopScore(username, score, wave);
    }
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