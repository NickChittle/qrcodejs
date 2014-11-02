
getEncodeMode = function(input) {
  if (isNumeric(input)) {
    return NUMERIC;
  } else if (isAlphanumeric(input)) {
    return ALPHANUMERIC;
  }
  console.warn("NO MODE");
  return "NO MODE";
};

isValidMode = function(mode) {
  return (mode == NUMERIC || mode == ALPHANUMERIC
      || mode == BYTE || mode == KANJI);
};

encode = function(input, ecl) {
  input = input.toUpperCase();
  var mode = getEncodeMode(input);
  if (!isValidMode(mode)) {
    console.warn("Invalid Mode: " + mode);
    return;
  }
  var version = getMinimumVersion(input.length, mode, ecl);
  var modeIndicator = getModeIndicator(mode);
  var charCountIndicatorLength = getCharacterCountIndicatorBitLength(version, mode);
  var charCountIndicator = padFrontWithZeros(convertToBinary(input.length), charCountIndicatorLength);
  var encodedData;
  switch(mode) {
    case NUMERIC:
      encodedData = encodeNumeric(input);
      break;
    case ALPHANUMERIC:
      encodedData = encodeAlphanumeric(input);
      break;
    case BYTE:
      break;
    case KANJI:
      break;
  }

  var bitString = modeIndicator + charCountIndicator + encodedData;

  var dataCodewords = getDataCodewords(version, ecl);
  var totalBits = dataCodewords * 8;
  // Add Terminator
  var terminatorLength = Math.min(4, totalBits - bitString.length);
  bitString = padRight(bitString, "0", terminatorLength);
  // Make length a multiple of 8
  bitString = padLengthToByte(bitString);

  if (bitString.length % 8 != 0) {
    console.warn("BitString length is not a multiple of 8");
  }

  // Pad with special numbers to fill maximum data capacity.
  bitString = padWithSpecialBytes(bitString, totalBits);

  var codewords = getCodewordsDecimal(bitString);
  var blocks = splitIntoBlocks(codewords, version, ecl);
  blocks = generateErrorCodewords(blocks, version, ecl);
  blocks = convertBlocksToBinary(blocks);
  var interleavedBlocks = interleaveDataAndErrorBlocks(blocks);
  var allCodewords = interleavedBlocks.dataCodewords.concat(interleavedBlocks.errorCodewords)
  bitString = allCodewords.join("");

  bitString = padToFullLength(bitString, version);
  var mask = 5;

  var matrix = createQRMatrix(version, ecl, bitString, mask);

  return matrix;
};
