    this.fusionUI = new FusionUI((spells, focus) => {
      this.gameState.player.equipSpells(spells, focus);
    });

    this.rewardUI = new RewardUI((reward) => {
      // Handle chosen reward
      if (reward.type === 'essence') {
        this.fusionUI.addEssenceToBank(reward.amount);
      }
      this.gameState.resume();
      this.fusionUI.refresh();
    });

