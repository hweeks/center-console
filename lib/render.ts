/* eslint-disable max-len */
import CenterConsole, { AlignmentChoices, LayoutChoices } from './center-console';
import { render } from './runtime/jsx-runtime';

export interface RowInternalLayout {
  textValue: string
  textLength: number
  alignment: AlignmentChoices
  widthModifier?: number
}

export interface RowParentLayout {
  heightModifier?: number
  layoutPosition: LayoutChoices
}

export interface RowLayout {
  content: RowInternalLayout
  container: RowParentLayout
}

function flattenElements(rowValue : any) : RowLayout {
  const alignment = rowValue.alignContent || 'center';
  const widthModifier = rowValue.width ? rowValue.width / 100 : undefined;
  const heightModifier = rowValue.height ? rowValue.height / 100 : undefined;
  const layoutPosition = rowValue.alignSelf || 'center';
  if (rowValue.children[0]?.nodeValue) {
    const textValue = rowValue.children[0].nodeValue;
    const textLength = rowValue.children[0].nodeLength;
    return {
      content: {
        textValue,
        textLength,
        alignment,
        widthModifier,
      },
      container: {
        heightModifier,
        layoutPosition,
      },
    };
  }
  return {
    content: rowValue.children.map(flattenElements),
    container: {
      heightModifier,
      layoutPosition,
    },
  };
}

export class ConsoleRender extends CenterConsole {
  children: any

  constructor(align?: AlignmentChoices) {
    super(align || 'center');
    this.children = [];
  }

  appendChild(child: any) {
    this.children.push(child);
  }

  layoutHorizontalContent(singleRow: RowLayout, parentWidth = this.windowSize.x) : string | string[] {
    if (Array.isArray(singleRow.content)) {
      const contentLength = singleRow.content.length;
      const stringsBuilt = singleRow.content.map(
        (row) => {
          let widthToDivide = Math.floor(parentWidth / contentLength);
          if (row.content.widthModifier) widthToDivide = parentWidth * row.content.widthModifier;
          return this.layoutHorizontalContent(row, widthToDivide);
        },
      );
      return stringsBuilt.join('');
    }
    const {
      textLength, alignment, textValue, widthModifier,
    } = singleRow.content;
    const blockSplit = textValue ? textValue.split('\n') : [];
    if (blockSplit.length > 1) {
      const builtMultiRow = blockSplit.map((splitBlock) => {
        const subRow : RowInternalLayout = {
          textValue: splitBlock,
          alignment,
          textLength: splitBlock.length,
          widthModifier,
        };
        const subLayout = {
          content: subRow,
          container: singleRow.container,
        };
        return this.layoutHorizontalContent(subLayout, parentWidth);
      });
      return [...builtMultiRow] as string[];
    }
    const paddingLeft = this.getLeftPadding(textLength, alignment, parentWidth);
    const paddingRight = this.getRightPadding(textLength, alignment, parentWidth);
    return [
      ...Array(paddingLeft).fill(' ').join(''),
      ...textValue,
      ...Array(paddingRight).fill(' ').join(''),
    ].join('');
  }

  layoutVerticalContent(singleRow: RowLayout, rowContent: string | string[], parentHeight = this.windowSize.y) {
    const { heightModifier, layoutPosition } = singleRow.container;
    let baseHeight = parentHeight;
    if (heightModifier) baseHeight = Math.round(heightModifier * parentHeight);
    const rowHeights = Array.isArray(rowContent) ? rowContent.length : 1;
    const paddingTop = this.getTopPadding(rowHeights, layoutPosition, baseHeight);
    const paddingBottom = this.getBottomPadding(rowHeights, layoutPosition, baseHeight);
    const rowSpread = Array.isArray(rowContent) ? [...rowContent] : [rowContent];
    return [
      ...Array(paddingTop).fill(' '),
      ...rowSpread,
      ...Array(paddingBottom).fill(' '),
    ];
  }

  finalRender() {
    const rootElement = this.children[0];
    const elementsToRender : RowLayout[] = rootElement.children.map(flattenElements);
    const columnsRendered = elementsToRender.map((row) => this.layoutHorizontalContent(row));
    const rowsRendered : string[][] = elementsToRender.map((row, index) => this.layoutVerticalContent(row, columnsRendered[index]));
    console.clear();
    rowsRendered.map((row) => row.map((val) => console.log(val)));
    this.children = [];
  }

  display(input : any) {
    render(input, this);
  }
}
