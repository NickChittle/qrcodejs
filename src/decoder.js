displayDecodedQRCode = function(matrix) {
};

getVersion = function(matrix) {
  return (matrix.length - 17) / 4;
};

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

getMaskNumberFromFormatString = function(formatString) {
  var maskBits = formatString.substring(2, 5);
  return convertToDecimal(maskBits);
};

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
      break;
    case KANJI:
      break;
  }
  return decodedData;
}

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

  var dataString = o.data;
  var errorString = o.error;

  var modeIndicator = dataString.substring(0, 4);
  var mode = getModeFromIndicator(modeIndicator);

  var charCountIndicatorLength = getCharacterCountIndicatorBitLength(version, mode);
  var charCount = convertToDecimal(dataString.substring(4, 4 + charCountIndicatorLength));
  var encodedData = dataString.substring(4 + charCountIndicatorLength);

  var text = decodeDataByMode(encodedData, mode, charCount);
  console.warn(text);
  console.warn(mode);
};

