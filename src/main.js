var inputText = "Hello World This is a test";
var ecl = ECL_L;
var inputTextElement;
var eclInputElement;

createQRCode = function(input, ecl) {
  matrix = encode(input, ECL_L);
  var encodeCanvas = new Canvas("imageCanvas");
  encodeCanvas.drawMatrix(matrix, 10);

  decode(matrix);
  var decodeCanvas = new Canvas("imageCanvas2");
  decodeCanvas.drawMatrix(matrix, 10);
};

QRCodeClick = function() {
  inputText = inputTextElement.value;
  ecl = eclInputElement.value;

  createQRCode(inputText, ecl);
};

init = function init() {
  inputTextElement = document.getElementById("qrinput");
  eclInputElement = document.getElementById("qrecl");

  inputTextElement.value = inputText;
  eclInputElement.value = ecl;

  QRCodeClick();
};

