var input = "Nick Chittle Dec 22 1992"
var numericInput = "01234567"
var helloWorld = "HELLO WORLD";

for (var i = 1; i <= 40; ++i) {
  //console.warn("Version: " + i + " Data Modules: " + getCodewordCount(i));
  for (var j = 0; j < 4; ++j) {
    console.warn("Version: " + i + " DataCapacity: " + getDataCapacity(i, ALPHANUMERIC, j));
    //console.warn("Version: " + i + " Data Codewords: " + getDataCodewords(i, j));
  }
  console.warn("");
}

encode = function(input, encodeMode, ecl) {
  var version = getMinimumVersion(input.length, encodeMode, ecl);
  var modeIndicator = getModeIndicator(encodeMode);
  var charCountIndicatorLength = getCharacterCountIndicatorBitLength(version, encodeMode);
  var charCountIndicator = padFrontWithZeros(convertToBinary(input.length), charCountIndicatorLength);
  var encodedData = encodeAlphanumeric(input);
  console.warn(modeIndicator, charCountIndicator, encodedData);
}

encode(helloWorld, ALPHANUMERIC, ECL_Q);
