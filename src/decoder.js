/**
 * Contains the logic for decoding a QR code that has already been processed
 * into a matrix.
 */

/**
 * Determines the version from the matrix.
 */
getVersion = function(matrix) {
  return (matrix.length - 17) / 4;
};

/**
 * Retrieves the Error Correction Level from the format string.
 */
getEclFromFormatString = function(formatString) {
  var eclBits = formatString.substring(0, 2);
  var ecl = -1;
  for (var i = 0; i < eclFormatStringBits.length; ++i) {
    if (eclBits == eclFormatStringBits[i]) {
      ecl = i;
    }
  }
  return ecl;
};

/**
 * Determines the mask number from the format string.
 */
getMaskNumberFromFormatString = function(formatString) {
  var maskBits = formatString.substring(2, 5);
  return convertToDecimal(maskBits);
};

/**
 * After the data blocks have been uninterleaved and error corrected, they can
 * being decoded using the appropriate mode.
 */
decodeDataByMode = function(data, mode, charCount) {
  var decodedData = "";
  switch(mode) {
    case NUMERIC:
      decodedData = decodeNumeric(data, charCount);
      break;
    case ALPHANUMERIC:
      decodedData = decodeAlphanumeric(data, charCount);
      break;
    case BYTE:
      decodedData = decodeByte(data, charCount);
      break;
  }
  return decodedData;
}

/**
 * Fixes the errors in the data blocks using the error blocks under Reed
 * Solomon error correction.
 */
fixErrors = function(dataBlocks, errorBlocks, nsym) {
  for (var i = 0; i < dataBlocks.length; ++i) {
    // Copy the appropriate data and error blocks in.
    var msg_in = dataBlocks[i].slice(0);
    msg_in.push.apply(msg_in, errorBlocks[i]);
    msg_in = convertCodewordsToDecimal(msg_in);
    var result = rs_correct_msg(msg_in, nsym);

    // If the error correction failed, return false.
    if (!result) {
      return false;
    }
    var blocks = result.slice(0, dataBlocks[i].length);
    dataBlocks[i] = convertCodewordsToBinary(blocks);
  }
  return {dataBlocks: dataBlocks, errorBlocks: errorBlocks};
};

/**
 * Decodes the given QR Matrix.
 *
 * Steps are:
 * 1) Determine version
 * 2) Remove all non-data/error bits from the matrix so we can easily find the important bits.
 * 3) Extract the Error Correction Level and Mask number from version String
 * 4) Verify that the version info on the matrix is correct.
 * 5) Uninterleave the data and error blocks.
 * 6) Fix the errors using reed solomon.
 * 7) Extract the mode indicator.
 * 8) Decoding using the appropriate mode.
 */
decode = function(matrix) {
  var version = getVersion(matrix);
  removeFinderPatterns(version, matrix);
  removeAlignmentPatterns(version, matrix);
  removeDarkModule(matrix);

  removeSeparators(matrix);
  removeTimingPatterns(matrix);

  var formatString = getFormatStringFromMatrix(matrix);
  var ecl = getEclFromFormatString(formatString);
  var maskNumber = getMaskNumberFromFormatString(formatString);
  removeFormatStringFromMatrix(matrix);

  verifyVersionInfo(version, matrix);
  removeVersionInfo(version, matrix);

  var bitString = getDataBits(version, maskNumber, matrix);

  var o = uninterleaveDataAndErrorStrings(bitString, version, ecl);
  var errorCodewordsPerBlock = getErrorCodewordsPerBlock(version, ecl, o.dataBlocks.length);
  var fixedErrors = fixErrors(o.dataBlocks, o.errorBlocks, errorCodewordsPerBlock);

  if (!fixedErrors) {
    console.warn("Could not fix errors in QR Code");
    return {success: false, errorReason: "Could not fix errors in QR Code"};
  }
  var dataBlocks = fixedErrors.dataBlocks;
  var dataString = "";
  for (var i = 0; i < dataBlocks.length; ++i) {
    dataString += dataBlocks[i].join("");
  }

  var modeIndicator = dataString.substring(0, 4);
  var mode = getModeFromIndicator(modeIndicator);

  var charCountIndicatorLength = getCharacterCountIndicatorBitLength(version, mode);
  var charCount = convertToDecimal(dataString.substring(4, 4 + charCountIndicatorLength));
  var encodedData = dataString.substring(4 + charCountIndicatorLength);

  var text = decodeDataByMode(encodedData, mode, charCount);
  return {success: true, text: text, version: version, ecl: ecl, mask: maskNumber, mode: mode};
};

