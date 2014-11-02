displayDecodedQRCode = function(matrix) {
  var canvas = new Canvas("imageCanvas2");
  canvas.drawMatrix(matrix, 10);
};

getVersion = function(matrix) {
  return (matrix.length - 17) / 4;
};

decode = function(matrix) {
  var version = getVersion(matrix);
  console.warn(version);
};

init = function init() {
  createQRCode(helloWorld, ECL_L);
  matrix = encode(helloWorld, ECL_L);
  decode(matrix);
  displayDecodedQRCode(matrix);
};

