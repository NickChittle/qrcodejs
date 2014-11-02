displayDecodedQRCode = function(matrix) {
};

getVersion = function(matrix) {
  return (matrix.length - 17) / 4;
};

decode = function(matrix) {
  var version = getVersion(matrix);
  console.warn(version);
};

