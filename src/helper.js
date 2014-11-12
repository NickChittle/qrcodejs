getLength = function(version) {
  return 17 + version*4;
};

getTotalModules = function(version) {
  var length = getLength(version);
  return length * length;
};

getAllignmentPatternCount = function(version) {
  if (version == 1) {
    return 0;
  } else if (version <= 6) {
    return 1
  } else {
    var l = Math.floor(version / 7) + 2;
    return l * l - 3;
  }
};

getFunctionPatternModules = function(version) {
  var length = getLength(version);
  var allignmentPatternCount = getAllignmentPatternCount(version);
  var finderPatternModules = 64 * 3;

  var overlapModules = 0;
  if (allignmentPatternCount >= 1) {
    var l = Math.sqrt(allignmentPatternCount + 3);
    // 5 Overlap per Allignment Pattern, and there are two timing patterns.
    overlapModules = (l - 2) * 5 * 2;
  }
  var timingPatternModules = 2 * (length-16) - overlapModules;
  var allignmentPatternModules = allignmentPatternCount * 25;
  return finderPatternModules + timingPatternModules + allignmentPatternModules;
};

getFormatAndVersionModules = function(version) {
  // All versions have information on which type of encoding (Numeric,
  // alphanumeric, etc...) Versions later than 6 have extra version
  // information.
  return version < 7 ? 31 : 67;
};

getDataModulesCount = function(version) {
  return getTotalModules(version) - getFunctionPatternModules(version) - getFormatAndVersionModules(version);
};

getCodewordCount = function(version) {
  return Math.floor(getDataModulesCount(version) / 8);
};

getErrorCodewords = function(version, ecl) {
  return errorCorrectionCodewords[version - 1][ecl];
};

getErrorCodewordsPerBlock = function(version, ecl, blocksCount) {
  var errorCodewordsCount = errorCorrectionCodewords[version-1][ecl];
  return errorCodewordsCount / blocksCount;
};

getDataCodewords = function(version, ecl) {
  return getCodewordCount(version) - getErrorCodewords(version, ecl);
};

getNumericDataCapacity = function(version, ecl) {
  var dataCodewords = getDataCodewords(version, ecl);
  var charCountIndicatorLength = getCharacterCountIndicatorBitLength(version, NUMERIC);
  // Subtract four for mode indicator.
  var bits = (dataCodewords * 8) - charCountIndicatorLength - 4;
  var dataCount = 3 * Math.floor(bits / 10);
  var remainder = bits % 10;
  if (remainder >= 7) {
    dataCount += 2;
  } else if (remainder >= 4) {
    dataCount ++;
  }
  return dataCount;
}

getAlphanumericDataCapacity = function(version, ecl) {
  var dataCodewords = getDataCodewords(version, ecl);
  var charCountIndicatorLength = getCharacterCountIndicatorBitLength(version, ALPHANUMERIC);
  // Subtract four for mode indicator.
  var bits = (dataCodewords * 8) - charCountIndicatorLength - 4;
  var dataCount = 2 * Math.floor(bits / 11);
  var remainder = bits % 11;
  if (remainder >= 6) {
    dataCount ++;
  }
  return dataCount;
};

getByteDataCapacity = function(version, ecl) {
  var dataCodewords = getDataCodewords(version, ecl);
  var charCountIndicatorLength = getCharacterCountIndicatorBitLength(version, BYTE);
  // Subtract four for mode indicator.
  var bits = (dataCodewords * 8) - charCountIndicatorLength - 4;
  return Math.floor(bits/8);
};

getDataCapacity = function(version, mode, ecl) {
  switch(mode) {
    case NUMERIC:
      return getNumericDataCapacity(version, ecl);
      break;
    case ALPHANUMERIC:
      return getAlphanumericDataCapacity(version, ecl);
      break;
    case BYTE:
      return getByteDataCapacity(version, ecl);
      break;
    default:
      console.warn("getDataCapacity: Unrecognized Mode: " + mode);

  }
  return -1;
};

getMinimumVersion = function(inputLength, mode, ecl) {
  for (var i = 1; i <= 40; ++i) {
    if (inputLength < getDataCapacity(i, mode, ecl)) {
      return i;
    }
  }
  console.warn("Input too large");
  return -1;
};

getModeIndicator = function(mode) {
  return modeIndicators[mode];
}

getModeFromIndicator = function(modeIndicator) {
  return inverseModeIndicator[modeIndicator];
};

getCharacterCountIndicatorBitLength = function(version, mode) {
  if (version < 1 || version > 40) {
    console.warn("Incorrect Version: " + version);
  }
  switch(mode) {
    case NUMERIC:
      if (version <= 9) {
        return 10;
      } else if (version <= 26) {
        return 12;
      } else if (version <= 40) {
        return 14;
      }
      break;
    case ALPHANUMERIC:
      if (version <= 9) {
        return 9;
      } else if (version <= 26) {
        return 11;
      } else if (version <= 40) {
        return 13;
      }
      break;
    case BYTE:
      if (version <= 9) {
        return 8;
      } else if (version <= 26) {
        return 16;
      } else if (version <= 40) {
        return 16;
      }
      break;
    default:
      return 0;
  }
};

convertToDecimal = function(binary) {
  var total = 0;
  for (var i = 0; i < binary.length; ++i) {
    total += parseInt(binary.charAt(binary.length - i - 1)) << i;
  }
  return total;
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

padRight = function(input, padString, n) {
  return input + Array(n + 1).join(padString);
};

padLeft = function(input, padString, n) {
  return Array(n + 1).join(padString) + input;
};

padFrontWithZeros = function(input, length) {
  return padLeft(input, "0", length - input.length);
};

padEndWithZeros = function(input, length) {
  return padRight(input, "0", length - input.length);
};

padLengthToByte = function(input) {
  var remainder = input.length % 8;
  if (remainder != 0) {
    input = padRight(input, "0", 8 - remainder);
  }
  return input;
};

padWithSpecialBytes = function(input, length) {
  var missingBytes = (length - input.length) / 8;
  var byte1 = "11101100"; // 236
  var byte2 = "00010001"; // 17
  input = padRight(input, byte1 + byte2, Math.floor(missingBytes / 2));
  if (missingBytes % 2 == 1) {
    input += byte1;
  }
  return input;
};

getCodewords = function(bitString) {
  var codewords = [];
  for (var i = 0; i < bitString.length; i += 8) {
    codewords.push(bitString.substring(i, i + 8));
  }
  return codewords;
};

convertCodewordsToDecimal = function(codewords) {
  for (var i = 0; i < codewords.length; ++i) {
    codewords[i] = convertToDecimal(codewords[i]);
  }
  return codewords;
};

convertCodewordsToBinary = function(codewords) {
  for (var i = 0; i < codewords.length; ++i) {
    codewords[i] = padFrontWithZeros(convertToBinary(codewords[i]), 8);
  }
  return codewords;
};

getCodewordsDecimal = function(bitString) {
  var codewords = getCodewords(bitString);
  return convertCodewordsToDecimal(codewords);
};

padToFullLength = function(bitString, version) {
  var totalLength = getDataModulesCount(version);
  if (totalLength - bitString.length > 7) {
    console.warn("Padded length is more than 7");
  }
  bitString = padEndWithZeros(bitString, totalLength);
  return bitString;
};
