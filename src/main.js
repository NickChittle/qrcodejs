var inputText = "Hello World This is a test";
var ecl = ECL_M;
var inputTextElement;
var eclInputElement;

createQRCode = function(input, ecl) {
  matrix = encode(input, ecl);
  var encodeCanvas = new Canvas("imageCanvas");
  encodeCanvas.drawMatrix(matrix, 10);

  decode(matrix);
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

