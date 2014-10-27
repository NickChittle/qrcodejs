var input = "Nick Chittle Dec 22 1992"
var numericInput = "01234567"

for (var i = 1; i <= 40; ++i) {
  //console.warn("Version: " + i + " Data Modules: " + getCodewordCount(i));
  for (var j = 0; j < 4; ++j) {
    console.warn("Version: " + i + " DataCapacity: " + getDataCapacity(i, NUMERIC, j));
    //console.warn("Version: " + i + " Data Codewords: " + getDataCodewords(i, j));
  }
  console.warn("");
}

encode = function(input, encodeMode, ecl) {
  // Assume numeric for now.
  var version = getMinimumVersion(input.length, encodeMode, ecl);
  var modeIndicator = getModeIndicator(encodeMode);
  var charCountIndicatorLength = getCharacterCountIndicatorBitLength(version, encodeMode);
  var charCountIndicator = padFrontWithZeros(convertToBinary(input.length), charCountIndicatorLength);
  var encodedData = encodeNumeric(input);
}

encodeNumeric = function(input) {
  for (var i = 0; i < input.length; i += 3) {
    var end = Math.min(input.length, i + 3);
    var piece = input.substring(i, end);
    var length = end - i;
    var binLength = 4 + (3 * (length - 1));
    var binary = padFrontWithZeros(convertToBinary(piece), binLength);
    console.warn(binary);
  }
};

convertToBinary = function(number) {
  binary = "";
  while (number > 0) {
    if (number % 2 == 0) {
      binary = "0" + binary;
    } else {
      binary = "1" + binary;
    }
    number = Math.floor(number / 2);
  }
  return binary;
};

padFrontWithZeros = function(input, length) {
  while (input.length < length) {
    input = "0" + input;
  }
  return input;
};

//encodeNumeric(numericInput);
