alphanumericMap = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
  "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  "A": 10, "B": 11, "C": 12, "D": 13, "E": 14,
  "F": 15, "G": 16, "H": 17, "I": 18, "J": 19,
  "K": 20, "L": 21, "M": 22, "N": 23, "O": 24,
  "P": 25, "Q": 26, "R": 27, "S": 28, "T": 29,
  "U": 30, "V": 31, "W": 32, "X": 33, "Y": 34,
  "Z": 35, " ": 36, "$": 37, "%": 38, "*": 39,
  "+": 40, "-": 41, ".": 42, "/": 43, ":": 44};

inverseAlphanumericMap = {
  0: "0", 1: "1", 2: "2", 3: "3", 4: "4",
  5: "5", 6: "6", 7: "7", 8: "8", 9: "9",
  10: "A", 11: "B", 12: "C", 13: "D", 14: "E",
  15: "F", 16: "G", 17: "H", 18: "I", 19: "J",
  20: "K", 21: "L", 22: "M", 23: "N", 24: "O",
  25: "P", 26: "Q", 27: "R", 28: "S", 29: "T",
  30: "U", 31: "V", 32: "W", 33: "X", 34: "Y",
  35: "Z", 36: " ", 37: "$", 38: "%", 39: "*",
  40: "+", 41: "-", 42: ".", 43: "/", 44: ":"};

isAlphanumeric = function(input) {
  // Input must be uppercase.
  for (var i = 0; i < input.length; ++i) {
    if (!(input.charAt(i) in alphanumericMap)) {
      return false;
    }
  }
  return true;
};

encodeAlphanumeric = function(input) {
  var encoded = "";
  for (var i = 0; i < input.length; i += 2) {
    var end = Math.min(input.length, i + 2);
    var length = end - i;
    var bin;
    if (length == 2) {
      var first = input.charAt(i);
      var second = input.charAt(i+1);
      var num = alphanumericMap[first] * 45 + alphanumericMap[second];
      bin = padFrontWithZeros(convertToBinary(num), 11);
    } else {
      var first = input.charAt(i);
      var num = alphanumericMap[first];
      bin = padFrontWithZeros(convertToBinary(num), 6);
    }
    encoded += bin;
  }
  return encoded;
};

decodeAlphanumeric = function(encodedData, charCount) {
  var decoded = "";
  var evenPairs = Math.floor(charCount / 2);
  for (var i = 0; i < evenPairs; ++i) {
    var pos = 11 * i;
    var bin = encodedData.substring(pos, pos + 11);
    var num = convertToDecimal(bin);
    var second = num % 45;
    var first = (num - second) / 45;
    decoded += inverseAlphanumericMap[first] + inverseAlphanumericMap[second];
  }
  if (charCount % 2 == 1) {
    var pos = 11 * evenPairs;
    var bin = encodedData.substring(pos, pos + 6);
    var num = convertToDecimal(bin);
    decoded += inverseAlphanumericMap[num];
  }
  return decoded;
};

