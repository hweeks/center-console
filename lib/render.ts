/* eslint-disable max-len */
import CenterConsole, { AlignmentChoices, LayoutChoices } from './center-console';
import { render } from './runtime/c-dom';
import { JSXConfig } from './runtime/c-dom-types';
import JOREL from './scheduler';

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
  content: RowInternalLayout | RowLayout[]
  container: RowParentLayout
}

function flattenElements(rowValue : JSXConfig, renderInstance: ConsoleRender) : RowLayout {
  const alignment = rowValue.props.alignContent || 'center';
  const widthModifier = rowValue.props.width ? rowValue.props.width / 100 : undefined;
  const heightModifier = rowValue.props.height ? rowValue.props.height / 100 : undefined;
  const layoutPosition = rowValue.props.alignSelf || 'center';
  if (rowValue.props.children[0]?.props.nodeValue) {
    const textValue = rowValue.props.children[0].props.nodeValue as string;
    const textLength = rowValue.props.children[0].props.nodeLength as number;
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
    content: rowValue.props.children.map((child) => flattenElements(child, renderInstance)),
    container: {
      heightModifier,
      layoutPosition,
    },
  };
}

export class ConsoleRender extends CenterConsole {
  children: any

  rootElement?: JSXConfig

  innerElement: JSXConfig

  constructor(align?: AlignmentChoices) {
    super(align || 'center');
    this.children = [];
    this.innerElement = {
      type: 'RENDER_MAIN',
      props: {
        children: [],
      },
    };
    JOREL.on('update', () => this.display());
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
          if (!Array.isArray(row.content) && row.content.widthModifier) {
            widthToDivide = parentWidth * row.content.widthModifier;
          }
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
    if (heightModifier) baseHeight = Math.floor(heightModifier * parentHeight);
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
    const { content } = flattenElements(this.innerElement, this);
    const elementsToRender : RowLayout[] = Array.isArray(content) ? content[0].content as RowLayout[] : [];
    const columnsRendered = elementsToRender.map((row) => this.layoutHorizontalContent(row));
    const rowsRendered : string[][] = elementsToRender.map((row, index) => this.layoutVerticalContent(row, columnsRendered[index]));
    console.clear();
    rowsRendered.map((row) => row.map((val) => console.log(val)));
  }

  display(input?: any) {
    if (!input && !this.rootElement) {
      throw new Error('You can not trigger a render if you have nothing to render');
    } else if (!input && this.rootElement) {
      render(this.rootElement, this.innerElement);
      this.finalRender();
    } else {
      this.rootElement = input;
      render(input, this.innerElement);
      this.finalRender();
    }
  }
}
