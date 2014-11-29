/**
 * This file controls the main HTML demo page.
 */

var inputText = "HELLO WORLD";
var ecl = ECL_Q;

// The HTML elements that we will want to read/write info to/from
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

/**
 * Create the formatted information text that will be displayed to the user
 */
createInfoText = function(version, ecl, mask, mode) {
  return "<b>Version:</b> " + version
    + " - <b>Mode:</b> " + mode
    + " - <b>ECL:</b> " + eclToText[ecl]
    + " - <b>Mask:</b> " + mask;
};

/**
 * Create the formatted error text that will be displayed to the user
 */
createError = function(errorReason) {
  return "<span class='error'>Error: " + errorReason + "</span>";
};

/**
 * When the user clicks the "Download as Image" button this sets the download
 * data to be the canvas information.
 */
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

/**
 * Check if a string is a valid URL.
 * If the decoded QR Code is a valid ULR, we will make it a hyperlink.
 */
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

/**
 * Creates a QR Code with the given input and error correction level selection.
 */
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

/**
 * The actions performed when the user clicks on 'Create QR Code'
 */
QRCodeClick = function() {
  inputText = inputTextElement.value;
  ecl = eclInputElement.value;

  createQRCode(inputText, ecl);
};

clearDecodeInfoBoxes = function() {
  decodedTextElement.innerHTML = "";
  decodedInfoElement.innerHTML = "";
}

/**
 * Decodes a given QR Code matrix and displays the appropriate results to the
 * user in the information boxes.
 */
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

/**
 * When an image is uploaded, it is uploaded as a URL, so that is how we decode it.
 */
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

/**
 * Called when the user uploads an image to be decoded.
 */
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
  // Get references to all the HTML elements we will need to work with.
  inputTextElement = document.getElementById('qrinput');
  eclInputElement = document.getElementById('qrecl');
  encodedInfoElement = document.getElementById('qrencodedinfo');
  downloadAnchorElement = document.getElementById('qrdownload');
  canvasElement = document.getElementById('imageCanvas');
  encodeCanvas = new Canvas(canvasElement);

  // Logic for handling when the user wants to download the QR code.
  downloadAnchorElement.addEventListener('click', function() {
    downloadCanvas(this, canvasElement, 'qrcode.png');
  }, false);

  uploadImageElement = document.getElementById('qrimageupload');
  decodeImagePreviewElement = document.getElementById('qrdecodeimagepreview');
  decodedTextElement = document.getElementById('qrdecodedtext');
  decodedInfoElement = document.getElementById('qrdecodedinfo');

  inputTextElement.value = inputText;
  eclInputElement.value = ecl;

  // Fake a QR Code click to encode the default data.
  QRCodeClick();
};

