var inputText = "Hello World This is a test";
var ecl = ECL_M;
var inputTextElement;
var eclInputElement;
var uploadImageElement;
var decodeImagePreviewElement;
var decodedTextElement;

createQRCode = function(input, ecl) {
  matrix = encode(input, ecl);
  var encodeCanvas = new Canvas("imageCanvas");
  encodeCanvas.drawMatrix(matrix, 10);

  return matrix;
};

QRCodeClick = function() {
  inputText = inputTextElement.value;
  ecl = eclInputElement.value;

  var matrix = createQRCode(inputText, ecl);
};

decodeImageByDataUrl = function(url) {
  var img = new Image();
  img.onload = function() {
    var matrix = getMatrixFromImage(img);
    if (matrix) {
      var text = decode(matrix);
      console.warn("text");
      decodedTextElement.innerHTML = text;
    }
  };
  img.src = url;
};

decodeImageClick = function() {
  var file = uploadImageElement.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    decodeImagePreviewElement.src = e.target.result;
    decodeImageByDataUrl(e.target.result);
  };
  if (file) {
    reader.readAsDataURL(file);
  }
};

init = function init() {
  inputTextElement = document.getElementById('qrinput');
  eclInputElement = document.getElementById('qrecl');
  uploadImageElement = document.getElementById('qrimageupload');
  decodeImagePreviewElement = document.getElementById('qrdecodeimagepreview');
  decodedTextElement = document.getElementById('qrdecodedtext');

  inputTextElement.value = inputText;
  eclInputElement.value = ecl;

  QRCodeClick();
};

