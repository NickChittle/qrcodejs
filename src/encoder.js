var input = "Nick Chittle Dec 22 1992"
var numericInput = "01234567"
var helloWorld = "HELLO WORLD";

for (var i = 1; i <= 40; ++i) {
  //console.warn("Version: " + i + " Data Modules: " + getCodewordCount(i));
  for (var j = 0; j < 4; ++j) {
    //console.warn("Version: " + i + " DataCapacity: " + getDataCapacity(i, ALPHANUMERIC, j));
    //console.warn("Version: " + i + " Data Codewords: " + getDataCodewords(i, j));
  }
  console.warn("");
}

getEncodeMode = function(input) {
  if (isNumeric(input)) {
    return NUMERIC;
  } else if (isAlphanumeric(input)) {
    return ALPHANUMERIC;
  }
  console.warn("NO MODE");
  return "NO MODE";
};

isValidMode = function(mode) {
  return (mode == NUMERIC || mode == ALPHANUMERIC
      || mode == BYTE || mode == KANJI);
};

encode = function(input, ecl) {
  var mode = getEncodeMode(input);
  if (!isValidMode(mode)) {
    console.warn("Invalid Mode: " + mode);
    return;
  }
  var version = getMinimumVersion(input.length, mode, ecl);
  var modeIndicator = getModeIndicator(mode);
  var charCountIndicatorLength = getCharacterCountIndicatorBitLength(version, mode);
  var charCountIndicator = padFrontWithZeros(convertToBinary(input.length), charCountIndicatorLength);
  var encodedData;
  switch(mode) {
    case NUMERIC:
      encodedData = encodeNumeric(input);
      break;
    case ALPHANUMERIC:
      encodedData = encodeAlphanumeric(input);
      break;
    case BYTE:
      break;
    case KANJI:
      break;
  }

  var bitString = modeIndicator + charCountIndicator + encodedData;

  var dataCodewords = getDataCodewords(version, ecl);
  var totalBits = dataCodewords * 8;
  // Add Terminator
  var terminatorLength = Math.min(4, totalBits - bitString.length);
  bitString = padRight(bitString, "0", terminatorLength);
  // Make length a multiple of 8
  var remainder = bitString.length % 8;
  if (remainder != 0) {
    bitString = padRight(bitString, "0", 8 - remainder);
  }

  if (bitString.length % 8 != 0) {
    console.warn("BitString length is not a multiple of 8");
  }

  // Pad with special numbers to fill maximum capacity.
  console.warn(version, dataCodewords, totalBits, bitString.length);
  var missingBytes = (totalBits - bitString.length) / 8;
  var byte1 = "11101100"; // 236
  var byte2 = "00010001"; // 17
  bitString = padRight(bitString, byte1 + byte2, Math.floor(missingBytes / 2));
  if (missingBytes % 2 == 1) {
    bitString += byte1;
  }
  console.warn(modeIndicator, charCountIndicator, encodedData);
  console.warn(bitString);
}

encode(helloWorld, ECL_Q);
