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
  //getFormatString();
  //removeFormatString();
  //getVersionInfo();
  //removeVersionInfo();

  console.warn(version);
};

