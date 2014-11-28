/**
 * This file contains the logice to encode and decode 'byte' data.
 */

/**
 * Returns true if the given input can be encoded using byte mode.
 */
isByte = function(input) {
  return true;
};

/**
 * Encodes the given input in byte mode, each one is simple the characters ascii value.
 */
encodeByte = function(input) {
  var encoded = "";
  for (var i = 0; i < input.length; ++i) {
    encoded += padFrontWithZeros(convertToBinary(input.charCodeAt(i)), 8);
  }
  return encoded;
};

/**
 * Decodes the given data into byte mode.
 */
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
