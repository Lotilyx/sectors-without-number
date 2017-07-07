// Constants
const hexPadding = 3; // Pixels between Hexes
const pixelBuffer = 100; // Pixel buffer between the sector and window

// Size Conversion
const sizeDiff = Math.sqrt(3) / 2;
const toWidth = height => height / sizeDiff;
const toHeight = width => width * sizeDiff;

// Height/Vertical Calculations
const getTotalHeight = (hexHeight, rows) => (rows + (1 / 2)) * hexHeight;
const getHexHeight = (totalHeight, rows) => totalHeight / (rows + (1 / 2));
const getRows = (totalHeight, hexHeight) => (totalHeight - (2 / hexHeight)) / hexHeight;

// Width/Horizontal Calculations
const getTotalWidth = (hexWidth, columns) => (hexWidth / 4) * ((3 * columns) + 1);
const getHexWidth = (totalWidth, columns) => (4 * totalWidth) / ((3 * columns) + 1);
const getColumns = (totalWidth, hexWidth) => ((4 * totalWidth) / (3 * hexWidth)) - (1 / 3);

const getHexSize = ({ width, height, columns, rows }) => {
  const bufferedHeight = height - (2 * pixelBuffer);
  const bufferedWidth = width - (2 * pixelBuffer);
  const pixelHeight = getHexHeight(bufferedHeight, rows);
  const pixelWidth = getHexWidth(bufferedWidth, columns);
  const scaledWidth = Math.min(toWidth(pixelHeight), pixelWidth);
  const scaledHeight = toHeight(scaledWidth);
  const totalHeight = getTotalHeight(scaledHeight, rows);
  const totalWidth = getTotalWidth(scaledWidth, columns);
  const scaledXBuffer = pixelBuffer + ((bufferedWidth - totalWidth) / 2);
  const scaledYBuffer = pixelBuffer + ((bufferedHeight - totalHeight) / 2);
  const widthUnit = scaledWidth / 4;
  const heightUnit = scaledHeight / 2;
  return { widthUnit, scaledWidth, scaledXBuffer, heightUnit, scaledHeight, scaledYBuffer };
};

const getGridData = ({
  scaledWidth,
  scaledXBuffer,
  scaledHeight,
  scaledYBuffer,
}, {
  rows,
  columns,
}) => {
  const hexesInVertical = getRows(scaledYBuffer, scaledHeight);
  const hexesInHorizontal = getColumns(scaledXBuffer, scaledWidth);
  const paddedRows = Math.ceil(hexesInVertical);
  const totalRows = rows + (2 * paddedRows);
  const yRemainder = Math.trunc(hexesInVertical);
  const scaledYOffset = ((hexesInVertical - yRemainder) * scaledHeight) - scaledHeight;
  const paddedColumns = Math.ceil(hexesInHorizontal);
  const totalColumns = columns + (2 * paddedColumns);
  const xRemainder = Math.trunc(hexesInHorizontal);
  const scaledXOffset = ((hexesInHorizontal - xRemainder) * scaledWidth) - scaledWidth;
  return { paddedRows, totalRows, scaledYOffset, paddedColumns, totalColumns, scaledXOffset };
};

export default (config) => {
  const { renderSector } = config;
  const hexSize = getHexSize(config);
  const { widthUnit, scaledWidth, heightUnit } = hexSize;
  const { paddedRows, totalRows, scaledYOffset,
    paddedColumns, totalColumns, scaledXOffset } = getGridData(hexSize, config);

  const hexArray = [];
  let isWithinHeight = true;
  let isWithinWidth = true;
  let i = 0;
  let j = 0;

  while (isWithinHeight) {
    const minRowHeight = (heightUnit * 2 * i) + scaledYOffset;
    while (isWithinWidth) {
      const xOffset = (j * 3 * widthUnit) + scaledXOffset;
      hexArray.push({
        key: `${i}-${j}`,
        width: scaledWidth - hexPadding,
        xOffset,
        yOffset: j % 2 ? minRowHeight + heightUnit : minRowHeight,
        highlighted: renderSector
          && i > paddedRows - 1 && i < totalRows - paddedRows
          && j > paddedColumns - 1 && j < totalColumns - paddedColumns,
      });
      j += 1;
      isWithinWidth = j < totalColumns;
    }
    j = 0;
    i += 1;
    isWithinWidth = true;
    isWithinHeight = i < totalRows;
  }

  return hexArray;
};