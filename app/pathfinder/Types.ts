// app/pathfinder/Types.ts
import * as d3 from 'd3';

export type Cell = {
  distance: number;
  isObstacle: boolean;
  isStart: boolean;
  isFinish: boolean;
  isUnknown: boolean;
  g: number;
  rhs: number;
};

export class CellUtility {
  static colorScale = d3.scaleSequential<string>((t) => 
    d3.interpolateRgb("rgba(255, 165, 0, .9)", "rgba(128, 0, 13, .9)")(t))
      .domain([1, 10]);

  static getColorForCell(cell: Cell): string {
    if (cell.isStart) return 'green';
    if (cell.isFinish) return 'red';
    if (cell.isObstacle) return 'black';
    if (cell.isUnknown) return 'gray';
    if (cell.g === Infinity) return CellUtility.colorScale(13);
    return CellUtility.colorScale(cell.g % 10);
  }
}

export class GridUtility {
  static getManhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
};
