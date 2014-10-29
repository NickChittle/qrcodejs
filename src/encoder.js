var input = "Nick Chittle Dec 22 1992"
var numericInput = "01234567"
var helloWorld = "HELLO WORLDAAEUAOEAOEAOEAOEAOEAOEAOEAOETHAONETHAONETHAONETHANOTHAOEAOAEAOEAO";

//for (var i = 1; i <= 40; ++i) {
  //console.warn("Version: " + i + " Data Modules: " + getCodewordCount(i));
  //for (var j = 0; j < 4; ++j) {
    //console.warn("Version: " + i + " DataCapacity: " + getDataCapacity(i, ALPHANUMERIC, j));
    //console.warn("Version: " + i + " Data Codewords: " + getDataCodewords(i, j));
  //}
  //console.warn("");
//}

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
  bitString = padLengthToByte(bitString);

  if (bitString.length % 8 != 0) {
    console.warn("BitString length is not a multiple of 8");
  }

  bitString = padWithSpecialBytes(bitString, totalBits);

  // Pad with special numbers to fill maximum capacity.
  return bitString;
};

var helloWorldBitString = encode(helloWorld, ECL_Q);
var codewords = getCodewordsDecimal(helloWorldBitString);
console.warn(codewords);
var ecwords = rs_encode_msg(codewords, 10);
console.warn(ecwords);

//var blocks = splitIntoBlocks(convertCodewordsToDecimal(codewords), 5, ECL_Q);
//blocks = generateErrorCodewords(blocks, 5, ECL_Q);
//blocks = convertBlocksToBinary(blocks);
//console.warn(interleaveDataAndErrorBlocks(blocks));
