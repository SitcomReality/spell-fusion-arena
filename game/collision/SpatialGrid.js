/**
 * SpatialGrid: A spatial hashing system for efficient collision detection
 * Divides the game world into a grid of cells, allowing fast neighbor lookups
 */
export class SpatialGrid {
  constructor(cellSize = 150, canvasWidth, canvasHeight) {
    this.cellSize = cellSize;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.cells = new Map(); // Map of "cellX,cellY" -> Set of objects
  }

  /**
   * Clear all objects from the grid at the start of each frame
   */
  clear() {
    this.cells.clear();
  }

  /**
   * Get the grid cell key for a given world position
   */
  getCellKey(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Get all cell keys that an object with a given radius spans
   * Objects may occupy multiple cells if they're large or near boundaries
   */
  getSpannedCells(x, y, radius) {
    const cells = new Set();
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        cells.add(`${cx},${cy}`);
      }
    }
    return cells;
  }

  /**
   * Insert an object (enemy or projectile) into the grid
   * The object must have x, y, and radius properties
   */
  insert(object) {
    const radius = object.radius || (object.type ? object.type.width / 2 : 0);
    const spannedCells = this.getSpannedCells(object.x, object.y, radius);
    
    for (const cellKey of spannedCells) {
      if (!this.cells.has(cellKey)) {
        this.cells.set(cellKey, new Set());
      }
      this.cells.get(cellKey).add(object);
    }
  }

  /**
   * Get all nearby objects (excluding the query object itself)
   * Returns objects in the same or adjacent cells
   */
  getNearby(object) {
    const radius = object.radius || (object.type ? object.type.width / 2 : 0);
    const spannedCells = this.getSpannedCells(object.x, object.y, radius);
    const nearby = new Set();

    for (const cellKey of spannedCells) {
      const cellObjects = this.cells.get(cellKey);
      if (cellObjects) {
        for (const obj of cellObjects) {
          if (obj !== object) {
            nearby.add(obj);
          }
        }
      }
    }
    return Array.from(nearby);
  }
}

export default SpatialGrid;


