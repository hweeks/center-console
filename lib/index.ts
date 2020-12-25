import os from 'os';

interface ScreenSize {
  x: number,
  y: number
}

type AlignmentChoices = 'left' | 'center' | 'right'

export class CenterConsole {
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

  getScreenSize() : ScreenSize {
    const [x, y] = process.stdout.getWindowSize();
    return { x, y };
  }

  getMaxRowLength(inputStrings : string[]) {
    let maxLength = inputStrings[0].length;
    for (let i = 0; i < inputStrings.length; i++) {
      maxLength = inputStrings[i].length > maxLength ? inputStrings[i].length : maxLength;
    }
    return maxLength;
  }

  getPadding(longestRow: number) {
    if (this.align === 'left') {
      return 0;
    } if (this.align === 'center') {
      return Math.ceil((this.windowSize.x - longestRow) / 2);
    }
    return Math.floor((this.windowSize.x - longestRow));
  }

  render(frame: string | string[]) {
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
    let finalizedRows = frameRows.map((row) => Array(this.getPadding(row.length)).fill(' ').join('') + row);
    finalizedRows = rowsToPad > 0 ? [...Array(rowsToPad).fill(' '), ...finalizedRows] : finalizedRows;
    console.clear();
    console.log(finalizedRows.join('\n'));
  }
}
