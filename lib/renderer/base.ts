/* eslint-disable no-console */
import os from 'os';

export interface ScreenSize {
  x: number,
  y: number
}

export type AlignmentChoices = 'left' | 'center' | 'right'
export type LayoutChoices = 'top' | 'center' | 'bottom'

export class BaseRenderer {
  windowSize: ScreenSize

  align: AlignmentChoices

  lastFrame?: string | string[]

  shouldCheckWindowManually: boolean

  constructor(alignMint?: AlignmentChoices) {
    this.windowSize = this.getScreenSize();
    process.stdout.on('resize', () => {
      this.windowSize = this.getScreenSize();
    });
    this.align = alignMint || 'center';
    this.shouldCheckWindowManually = os.type() === 'Windows_NT';
  }

  // eslint-disable-next-line class-methods-use-this
  getScreenSize() : ScreenSize {
    const [x, y] = process.stdout.getWindowSize();
    return { x, y };
  }

  getPadding(rowLength: number, alignmentChoice = this.align, areaLength = this.windowSize.x) {
    if (alignmentChoice === 'left') {
      return 0;
    } if (alignmentChoice === 'center') {
      return Math.floor((areaLength - rowLength) / 2);
    }
    return Math.floor((areaLength - rowLength));
  }

  getLeftPadding(rowLength: number, alignmentChoice = this.align, areaLength = this.windowSize.x) {
    if (alignmentChoice === 'left') {
      return 0;
    } if (alignmentChoice === 'center') {
      return Math.floor((areaLength - rowLength) / 2);
    }
    return Math.floor((areaLength - rowLength));
  }

  getRightPadding(rowLength: number, alignmentChoice = this.align, areaLength = this.windowSize.x) {
    if (alignmentChoice === 'right') {
      return 0;
    } if (alignmentChoice === 'center') {
      return Math.floor((areaLength - rowLength) / 2);
    }
    return Math.floor((areaLength - rowLength));
  }

  getTopPadding(rowLength: number, alignmentChoice = 'center', areaLength = this.windowSize.y) {
    if (alignmentChoice === 'top') {
      return 0;
    } if (alignmentChoice === 'center') {
      return Math.floor((areaLength - rowLength) / 2);
    }
    return Math.floor((areaLength - rowLength));
  }

  getBottomPadding(rowLength: number, alignmentChoice = 'center', areaLength = this.windowSize.y) {
    if (alignmentChoice === 'bottom') {
      return 0;
    } if (alignmentChoice === 'center') {
      return Math.floor((areaLength - rowLength) / 2);
    }
    return Math.floor((areaLength - rowLength));
  }

  render(frame: string | string[], shouldPadRows = true) {
    if (this.lastFrame === frame) {
      return;
    }
    this.lastFrame = frame;
    if (this.shouldCheckWindowManually) {
      this.windowSize = this.getScreenSize();
    }
    const frameRows = Array.isArray(frame) ? frame : frame.split('\n');
    const maxRowHeight = frameRows.length;
    const rowsToPad = Math.ceil((this.windowSize.y - maxRowHeight) / 2);
    let finalizedRows = shouldPadRows ? frameRows.map((row) => Array(this.getPadding(row.length)).fill(' ').join('') + row) : frameRows;
    finalizedRows = rowsToPad > 0 ? [...Array(rowsToPad).fill(' '), ...finalizedRows] : finalizedRows;
    console.clear();
    process.stdout.write(finalizedRows.join('\n'));
  }
}

export default BaseRenderer;
