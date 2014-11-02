displayDecodedQRCode = function(matrix) {
};

getVersion = function(matrix) {
  return (matrix.length - 17) / 4;
};

decode = function(matrix) {
  var version = getVersion(matrix);
  //removeFinderPatterns(version, matrix);
  //removeAlignmentPatterns(version, matrix);
  //removeDarkModule(matrix);

  //removeSeparators(matrix);
  removeTimingPatterns(matrix);
  var formatString = getFormatStringFromMatrix(matrix);
  console.warn(formatString);
  var eclBits = formatString.substring(0, 2);
  var ecl = -1;
  for (var i = 0; i < eclFormatStringBits.length; ++i) {
    if (eclBits == eclFormatStringBits[i]) {
      ecl = i;
    }
  }
  console.warn(ecl);
  //removeFormatString();
  //getVersionInfo();
  //removeVersionInfo();

  console.warn(version);
};

