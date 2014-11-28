/**
 * The main file used for encoding data.
 */

/**
 * Gets the appropriate mode to use encoding the input
 *
 * Numeric takes less space than alphanumeric, alphanumeric takes less space
 * than byte.
 */
getEncodeMode = function(input) {
  if (isNumeric(input)) {
    return NUMERIC;
  } else if (isAlphanumeric(input)) {
    return ALPHANUMERIC;
  } else if (isByte(input)) {
    return BYTE;
  }
  console.warn("NO MODE");
  return "NO MODE";
};

isValidMode = function(mode) {
  return (mode == NUMERIC || mode == ALPHANUMERIC || mode == BYTE);
};

/**
 * Main function for encoding the input using the desired Error Correction
 * Level.
 */
encode = function(input, ecl) {
  // Determine best mode to encode.
  var mode = getEncodeMode(input);
  if (!isValidMode(mode)) {
    return {success: false, errorReason: "Invalid Mode"};
  }
  // Determine minimum version.
  var version = getMinimumVersion(input.length, mode, ecl);
  if (version == -1) {
    return {success: false, errorReason: "Input too large"};
  }
  var modeIndicator = getModeIndicator(mode);
  var charCountIndicatorLength = getCharacterCountIndicatorBitLength(version, mode);
  var charCountIndicator = padFrontWithZeros(convertToBinary(input.length), charCountIndicatorLength);
  var encodedData;
  // Actually encode the data.
  switch(mode) {
    case NUMERIC:
      encodedData = encodeNumeric(input);
      break;
    case ALPHANUMERIC:
      encodedData = encodeAlphanumeric(input);
      break;
    case BYTE:
      encodedData = encodeByte(input);
      break;
  }

  // Concatenate the mode indication, char count, and encoded data.
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
  // Generate the error correction information.
  blocks = generateErrorCodewords(blocks, version, ecl);
  blocks = convertBlocksToBinary(blocks);
  // Interleave for larger QR versions.
  var interleavedBlocks = interleaveDataAndErrorBlocks(blocks);
  var allCodewords = interleavedBlocks.dataCodewords.concat(interleavedBlocks.errorCodewords)
  bitString = allCodewords.join("");

  bitString = padToFullLength(bitString, version);

  // Select the matrix with the best mask pattern using the evaluation functions.
  // There are 8 mask patterns.
  var matrixWithMask = [];
  for (var i = 0; i < 8; ++i) {
    var matrix = createQRMatrix(version, ecl, bitString, i);
    matrixWithMask.push({matrix: matrix, maskPenalty: evaluateMatrixMask(matrix)});
  }
  var bestMask = 0;
  for (var i = 1; i < matrixWithMask.length; ++i) {
    if (matrixWithMask[i].maskPenalty < matrixWithMask[bestMask].maskPenalty) {
      bestMask = i;
    }
  }
  var matrix = matrixWithMask[bestMask].matrix;

  return {success: true, matrix: matrix, version: version, mask: bestMask, ecl: ecl, mode: mode};
};
