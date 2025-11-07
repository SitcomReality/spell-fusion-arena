/* ...existing code ... */
  updateFusionPreview(forceEmpty = false) {
    if (forceEmpty || this.selectedElements.length === 0) {
      this.fusionPreview.showMessage(`Add an element to create a spell`);
      return;
    }

    this.currentSpell = SpellFusion.fuse(...this.selectedElements);
-    this.fusionPreview.showSpell(this.currentSpell, () => this.addSpellToInventory(this.currentSpell));
+    // compute cost and pass it into preview so create button shows "Create (X ME)"
+    const elementCount = this.selectedElements.length;
+    const cost = getSpellCost(elementCount);
+    this.fusionPreview.showSpell(this.currentSpell, () => this.addSpellToInventory(this.currentSpell), cost);
  }
/* ...existing code ... */

