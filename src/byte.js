
isByte = function(input) {
  return true;
};

encodeByte = function(input) {
  var encoded = "";
  for (var i = 0; i < input.length; ++i) {
    encoded += padFrontWithZeros(convertToBinary(input.charCodeAt(i)), 8);
  }
  return encoded;
};

decodeByte = function(input, charCount) {
  var decoded = "";
  for (var i = 0; i < charCount; ++i) {
    var pos = i * 8;
    var bin = input.substring(pos, pos + 8);
    var num = convertToDecimal(bin);
    decoded += String.fromCharCode(num);
  }
  return decoded;
};
