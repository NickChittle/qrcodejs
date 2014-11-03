
isNumeric = function(input) {
  for (var i = 0; i < input.length; ++i) {
    if (isNaN(input.charAt(i))) {
      return false;
    }
  }
  return true;
}

encodeNumeric = function(input) {
  var encoded = "";
  for (var i = 0; i < input.length; i += 3) {
    var end = Math.min(input.length, i + 3);
    var piece = input.substring(i, end);
    var length = end - i;
    var binLength = 4 + (3 * (length - 1));
    var binary = padFrontWithZeros(convertToBinary(piece), binLength);
    encoded += binary;
  }
  return encoded;
};

decodeNumeric = function(encodedData, charCount) {
  var decoded = "";
  for (var i = 0; i < Math.floor(charCount / 3); ++i) {
    var pos = 10 * i;
    var bin = encodedData.substring(pos, pos + 10);
    var num = convertToDecimal(bin);
    decoded += padFrontWithZeros(num.toString(), 3);
  }
  var remaining = charCount % 3;
  if (remaining != 0) {
    var length = 4 + (3 * (remaining - 1));
    var pos = 10 * Math.floor(charCount / 3);
    var bin = encodedData.substring(pos, pos + length);
    var num = convertToDecimal(bin);
    decoded += padFrontWithZeros(num.toString(), remaining);
  }
  return decoded;
};
