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
    var num;
    if (length == 2) {
      first = input.charAt(i);
      second = input.charAt(i+1);
      num = alphanumericMap[first] * 45 + alphanumericMap[second];
      bin = padFrontWithZeros(convertToBinary(num), 11);
    } else {
      first = input.charAt(i);
      num = alphanumericMap[first];
      bin = padFrontWithZeros(convertToBinary(num), 6);
    }
    console.warn(bin);
    encoded += bin;
  }
  return encoded;
};
