// ...existing code...
          // Fallback: ensure at least an empty array is passed; prefer saved seed if present
          const seed = payload && payload.seed ? payload.seed : Math.floor(Math.random() * 0x7FFFFFFF);
          // Start the game with the recovered starting elements (may be empty) and seed
          this.container.remove();
          this.onGameStart({ startingElements, seed, payload });
        });
      }
    } catch (e) { /* silent */ }
  }

  async startNewGame() {
// ...existing code...

