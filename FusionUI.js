/* ...existing code... */
      // Delete button handler: remove spell from inventory and re-render
      const deleteBtn = item.querySelector('.created-spell-delete');
      // Only show/allow deletion when the tutorial is not active and the spell is not currently equipped.
      const tutorialActive = !!(window && window.gameInstance && window.gameInstance.tutorial && window.gameInstance.tutorial.isActive);
      const isEquipped = this.equippedSpells.includes(spell);
      if (deleteBtn) {
        if (tutorialActive || isEquipped) {
          // hide the delete button when tutorial running or spell is equipped
          deleteBtn.style.display = 'none';
        } else {
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Prevent deletion if the spell became equipped since rendering
            if (this.equippedSpells.includes(spell)) {
              alert('Cannot delete a spell while it is equipped.');
              return;
            }
            // Remove the spell at this index
            this.spellInventory.splice(idx, 1);
            // Re-render slots and created list
            this.renderSpellSlots();
            this.renderCreatedSpells();
          });
        }
      }
/* ...existing code... */