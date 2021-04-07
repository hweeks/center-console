/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable max-len */
import chalk from 'chalk';
import BaseRenderer, { AlignmentChoices, LayoutChoices } from './base';
import { render } from '../runtime/c-dom';
import { JSXConfig } from '../runtime/c-dom-types';
import JOREL from './scheduler';

const syncWrite = (val: unknown) => new Promise((res) => process.stdout.write(`${val}\n`, res));

export interface RowInternalLayout {
  textValue: string
  textLength: number
  alignment: AlignmentChoices
  color?: string
  background?: string
  widthModifier?: number
}

export interface RowParentLayout {
  heightModifier?: number
  layoutPosition: LayoutChoices
  blockLevel: boolean
}

export interface RowLayout {
  content?: RowInternalLayout
  children?: RowLayout[]
  parent?: JSXConfig
  container: RowParentLayout
}

interface TextConfig {paddedString : string, textLength: number}

function flattenElements(rowValue : JSXConfig, parent?: JSXConfig) : RowLayout {
  const widthModifier = rowValue.props.width ? rowValue.props.width / 100 : undefined;
  const heightModifier = rowValue.props.height ? rowValue.props.height / 100 : undefined;
  const layoutPosition = rowValue.props.alignSelf || 'center';
  const blockLevel = rowValue.type === 'div';
  if (rowValue.type === 'CONSOLE_TEXT') {
    const textValue = rowValue.props.nodeValue as string;
    const textLength = rowValue.props.nodeLength as number;
    const alignment = rowValue.props.alignContent || rowValue.parent?.alignContent || 'center';
    const layout = rowValue.props.alignSelf || rowValue.parent?.alignSelf || 'center';
    const color = (rowValue.props.color || rowValue.parent?.color) as string;
    const background = (rowValue.props.background || rowValue.parent?.background) as string;
    return {
      content: {
        color,
        background,
        textValue,
        textLength,
        alignment,
        widthModifier,
      },
      parent,
      container: {
        heightModifier,
        layoutPosition: layout,
        blockLevel,
      },
    };
  }
  return {
    children: rowValue.props.children.map((child) => flattenElements(child, rowValue)),
    parent,
    container: {
      heightModifier,
      layoutPosition,
      blockLevel,
    },
  };
}

export class ConsoleRender extends BaseRenderer {
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

  layoutHorizontalContent(singleRow: RowLayout, parentWidth = this.windowSize.x) : TextConfig[] {
    if (Array.isArray(singleRow.children)) {
      const contentLength = singleRow.children.length;
      const rowLength = this.windowSize.x;
      let rowWidthRemainder = rowLength;
      return singleRow.children.map(
        (row, index) => {
          const properWidth = singleRow.container.blockLevel ? this.windowSize.x : parentWidth;
          const rounder = index % 2 === 0 ? Math.floor : Math.ceil;
          let widthToDivide = rounder(properWidth / contentLength);
          if (row.content?.widthModifier) {
            widthToDivide = properWidth * row.content.widthModifier;
          }
          return this.layoutHorizontalContent(row, widthToDivide);
        },
      ).reduce((acc, cur) => {
        const currentStringLength = cur[0].textLength;
        const lastItem = acc.pop();
        const combinedWidth = (lastItem?.textLength || 0) + currentStringLength;
        rowWidthRemainder -= currentStringLength;
        if (cur.length > 1 && lastItem) return [...acc, lastItem, ...cur];
        if (lastItem && lastItem.textLength >= this.windowSize.x - 1) {
          return [...acc, lastItem, cur[0]];
        }
        if (currentStringLength !== rowLength && combinedWidth <= rowLength && rowWidthRemainder >= 0) {
          const newString = [lastItem?.paddedString, cur[0].paddedString].join('');
          if (rowWidthRemainder === 0) rowWidthRemainder = rowLength;
          return [...acc, { paddedString: newString, textLength: combinedWidth }];
        }
        return [...acc, ...cur];
      }, [{ paddedString: '', textLength: 0 }]);
    }
    const {
      textLength, alignment, textValue, widthModifier, color, background,
    } = singleRow.content || { alignment: 'center', textLength: 0, textValue: '' };
    let builtString = textValue;
    if (color) builtString = chalk.hex(color)(builtString);
    if (background) builtString = chalk.bgHex(background)(builtString);
    const blockSplit = textValue ? textValue.split('\n') : [];
    if (blockSplit.length > 1) {
      return blockSplit.map((splitBlock) => {
        const subRow : RowInternalLayout = {
          textValue: splitBlock,
          alignment,
          color,
          background,
          textLength: splitBlock.length,
          widthModifier,
        };
        const subLayout = {
          content: subRow,
          container: singleRow.container,
        };
        return this.layoutHorizontalContent(subLayout, parentWidth)[0];
      });
    }
    const paddingLeft = this.getLeftPadding(textLength, alignment, parentWidth);
    const paddingRight = this.getRightPadding(textLength, alignment, parentWidth);
    const paddedString = [
      ...Array(paddingLeft).fill(' ').join(''),
      ...builtString,
      ...Array(paddingRight).fill(' ').join(''),
    ].join('');
    return [{ paddedString, textLength: textLength + paddingLeft + paddingRight }];
  }

  layoutVerticalContent(singleRow: RowLayout, rowContent: TextConfig | TextConfig[], parentHeight = this.windowSize.y) : string[] {
    const { heightModifier, layoutPosition } = singleRow.container;
    let baseHeight = parentHeight;
    if (heightModifier) baseHeight = Math.floor(heightModifier * parentHeight);
    const rowHeights = Array.isArray(rowContent) ? rowContent.length : 1;
    const paddingTop = this.getTopPadding(rowHeights, layoutPosition, baseHeight);
    const paddingBottom = this.getBottomPadding(rowHeights, layoutPosition, baseHeight);
    const rowSpread = Array.isArray(rowContent) ? rowContent.map((row) => row.paddedString) : [rowContent?.paddedString];
    return [
      ...Array(paddingTop).fill(' '),
      ...rowSpread,
      ...Array(paddingBottom).fill(' '),
    ];
  }

  finalRender() {
    const { children } = flattenElements(this.innerElement);
    const elementsToRender : RowLayout[] = children || [];
    const columnsRendered = elementsToRender.map((row) => this.layoutHorizontalContent(row));
    const rowsRendered : string[][] = elementsToRender.map((row, index) => this.layoutVerticalContent(row, columnsRendered[index]));
    rowsRendered.map((row) => row.map((val) => syncWrite(val)));
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
