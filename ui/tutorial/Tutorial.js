/* ...existing code ... */
  setupStepCompletion(stepIndex) {
    const step = this.stepManager.get(stepIndex);

    if (stepIndex === 0) {
      // Step 0: Select element. Progression is handled in FusionUI.js when an element card is clicked.
    } else if (stepIndex === 1) {
      // Step 1: Add element to fusion - wait for .element-add-btn click
      this.completionHandlers[stepIndex] = this.fusionUI.detailsPanel.onAddButtonClick(() => {
        this.showStep(stepIndex + 1);
      });
    } else if (stepIndex === 2) {
      // Step 2: Create spell - wait for .fusion-preview-create click
      this.completionHandlers[stepIndex] = this.fusionUI.fusionPreview.onCreateButtonClick(() => {
        this.showStep(stepIndex + 1);
      });
    } else if (stepIndex === 3) {
      // Step 3: Equip spell - wait for spell to be equipped in a slot
      this.completionHandlers[stepIndex] = this.fusionUI.spellSlotsUI.onSpellEquipped(() => {
        this.showStep(stepIndex + 1);
      });
    } else if (stepIndex === 4) {
      // Step 4: Start wave - wave-start-panel button will trigger next step (handled by GameApp)
      // Wait for the wave start (which calls waveManager.startNextWave)
    } else if (stepIndex === 5) {
      // Step 5: Create 2-element spell - wait for Create on fusion preview (two-element flow)
      // Allow the player to interact with Elements library & Details while keeping fusion UI focused.
      // Use the 'fusion-full' lock which mutes equipped-spells/hud but leaves #elements-library and #element-details-panel interactive.
      document.documentElement.classList.add('tutorial-lock-to-fusion-full');
      this.completionHandlers[stepIndex] = this.fusionUI.fusionPreview.onCreateButtonClick(() => {
        this.showStep(stepIndex + 1);
      });
    } else if (stepIndex === 6) {
      // Step 6: Allocate focus - wait for .slot-add-focus button click
      this.completionHandlers[stepIndex] = this.fusionUI.spellSlotsUI.onFocusAllocated(() => {
        this.complete();
      });
    }
  }
/* ...existing code ... */

/* ...existing code ... */
  lockUIForStep(stepIndex) {
    // Remove all locks first
    document.documentElement.classList.remove(
      'tutorial-lock-to-elements',
      'tutorial-lock-to-elements-details',
      'tutorial-lock-to-fusion-preview',
      'tutorial-lock-to-equipped',
      'tutorial-lock-to-wave',
      'tutorial-lock-to-reward',
      'tutorial-lock-to-fusion-full'
    );

    // Apply appropriate lock based on step
    switch (stepIndex) {
      case 0: // Step 1: Select element (Library/Details Panel open)
        document.documentElement.classList.add('tutorial-lock-to-elements');
        break;
      case 1: // Step 2: Add to fusion (Library/Details Panel open)
        document.documentElement.classList.add('tutorial-lock-to-elements-details');
        break;
      case 2: // Step 3: Create spell (Fusion Preview open)
        document.documentElement.classList.add('tutorial-lock-to-fusion-preview');
        break;
      case 3: // Step 4: Equip spell (Equipped Slots open)
        document.documentElement.classList.add('tutorial-lock-to-equipped');
        break;
      case 4: // Step 5: Start wave (Wave button open)
        document.documentElement.classList.add('tutorial-lock-to-wave');
        break;
      case 5: // Step 6 (after removal): Create 2-element spell (Fusion area open, strict 2-element rule enforced)
        document.documentElement.classList.add('tutorial-lock-to-fusion-full');
        break;
      case 6: // Step 7: Allocate focus (Equipped Slots open)
        document.documentElement.classList.add('tutorial-lock-to-equipped');
        break;
    }
  }
/* ...existing code ... */

/* ...existing code ... */
  setupStep(stepIndex) {
    const step = this.stepManager.get(stepIndex);

    // Lock/unlock UI areas based on step
    this.lockUIForStep(stepIndex);

    // For the initial 'select-element' step highlight the whole library container
    let target = null;
    if (step.id === 'select-element') {
      target = document.getElementById('elements-library') || document.querySelector(step.targetSelector);
    } else {
      target = document.querySelector(step.targetSelector);
    }
    if (target && !step.isOverlay) {
      this.highlightedElement = target;
      target.classList.add('tutorial-highlight');
    }
  }
/* ...existing code ... */