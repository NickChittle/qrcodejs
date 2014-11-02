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

  console.warn(version);
};

