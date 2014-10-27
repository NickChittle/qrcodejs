
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
