var inputText = "HELLO WORLD";
var ecl = ECL_Q;

var encodeCanvas;
var inputTextElement;
var eclInputElement;
var uploadImageElement;
var downloadAnchorElement;
var canvasElement;

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

createError = function(errorReason) {
  return "<span class='error'>Error: " + errorReason + "</span>";
};

downloadCanvas = function(anchor, canvas, filename) {
  anchor.href = canvas.toDataURL();
  anchor.download = filename;
};

drawMatrixInCanvas = function(matrix) {
  downloadAnchorElement.style.display = "inline-block";
  encodeCanvas.drawMatrix(matrix, 10);
};

clearCanvas = function() {
  downloadAnchorElement.style.display="none";
  encodeCanvas.clear();
};

isValidUrl = function(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  if(!pattern.test(str)) {
    return false;
  } else {
    return true;
  }
}

createQRCode = function(input, ecl) {
  clearCanvas();
  var result = encode(input, ecl);
  if (!!result.success) {
    drawMatrixInCanvas(result.matrix);

    encodedInfoElement.innerHTML = createInfoText(result.version, result.ecl, result.mask, result.mode);
  } else {
    encodedInfoElement.innerHTML = createError(result.errorReason);
  }

  return result;
};

QRCodeClick = function() {
  inputText = inputTextElement.value;
  ecl = eclInputElement.value;

  createQRCode(inputText, ecl);
};

clearDecodeInfoBoxes = function() {
  decodedTextElement.innerHTML = "";
  decodedInfoElement.innerHTML = "";
}

decodeMatrix = function(matrix) {
  var result = decode(matrix);
  var text = "";
  var info = "";
  if (!result.success) {
    text = result.errorReason;
  } else {
    text = result.text;
    // If the encoded text is a URL, let's make it a link.
    if (isValidUrl(text)) {
      text = "<a target='_blank' href='" + text + "'>" + text + "</a>";
    }
    info = createInfoText(result.version, result.ecl, result.mask, result.mode);
  }
  decodedTextElement.innerHTML = text;
  decodedInfoElement.innerHTML = info;
};

decodeImageByDataUrl = function(url) {
  clearDecodeInfoBoxes();
  var img = new Image();
  img.onload = function() {
    var result = getMatrixFromImage(img);
    if (result.success) {
      decodeMatrix(result.matrix);
    } else {
      decodedTextElement.innerHTML = createError(result.errorReason);
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
  downloadAnchorElement = document.getElementById('qrdownload');
  canvasElement = document.getElementById('imageCanvas');
  encodeCanvas = new Canvas(canvasElement);

  downloadAnchorElement.addEventListener('click', function() {
    downloadCanvas(this, canvasElement, 'qrcode.png');
  }, false);

  uploadImageElement = document.getElementById('qrimageupload');
  decodeImagePreviewElement = document.getElementById('qrdecodeimagepreview');
  decodedTextElement = document.getElementById('qrdecodedtext');
  decodedInfoElement = document.getElementById('qrdecodedinfo');

  inputTextElement.value = inputText;
  eclInputElement.value = ecl;

  QRCodeClick();
};

