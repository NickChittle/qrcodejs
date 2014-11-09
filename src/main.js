var inputText = "Hello World This is a test";
var ecl = ECL_M;

var inputTextElement;
var eclInputElement;
var uploadImageElement;
var decodeImagePreviewElement;
var decodedTextElement;
var encodedInfoElement;
var decodedInfoElement;

createInfoText = function(version, ecl, mask, mode) {
  return "<b>Version:</b> " + version
    + " - <b>Mode:</b> " + mode
    + " - <b>ECL:</b> " + eclToText[ecl]
    + " - <b>Mask:</b> " + mask;
};

createQRCode = function(input, ecl) {
  result = encode(input, ecl);
  var encodeCanvas = new Canvas("imageCanvas");
  encodeCanvas.drawMatrix(result.matrix, 10);

  encodedInfoElement.innerHTML = createInfoText(result.version, result.ecl, result.mask, result.mode);

  return result;
};

QRCodeClick = function() {
  inputText = inputTextElement.value;
  ecl = eclInputElement.value;

  createQRCode(inputText, ecl);
};

decodeImageByDataUrl = function(url) {
  var img = new Image();
  img.onload = function() {
    var matrix = getMatrixFromImage(img);
    if (matrix) {
      var result = decode(matrix);
      decodedTextElement.innerHTML = result.text;
      decodedInfoElement.innerHTML = createInfoText(result.version, result.ecl, result.mask, result.mode);
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
  encodedInfoElement = document.getElementById('qrencodedinfo');

  uploadImageElement = document.getElementById('qrimageupload');
  decodeImagePreviewElement = document.getElementById('qrdecodeimagepreview');
  decodedTextElement = document.getElementById('qrdecodedtext');
  decodedInfoElement = document.getElementById('qrdecodedinfo');

  inputTextElement.value = inputText;
  eclInputElement.value = ecl;

  QRCodeClick();
};

