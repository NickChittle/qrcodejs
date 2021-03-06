/**
 * Contains the information for creating and working with the QR Matricies.
 */

// Contains the information about the alignment pattern locations in the
// different versions of QR Codes
var alignmentPatternLocations = [
  [0, 0],
  [0, 0], [18, 0], [22, 0], [26, 0], [30, 0], // 1- 5
  [34, 0], [22, 38], [24, 42], [26, 46], [28, 50], // 6-10
  [30, 54], [32, 58], [34, 62], [26, 46], [26, 48], //11-15
  [26, 50], [30, 54], [30, 56], [30, 58], [34, 62], //16-20
  [28, 50], [26, 50], [30, 54], [28, 54], [32, 58], //21-25
  [30, 58], [34, 62], [26, 50], [30, 54], [26, 52], //26-30
  [30, 56], [34, 60], [30, 58], [34, 62], [30, 54], //31-35
  [24, 50], [28, 54], [32, 58], [26, 54], [30, 58], //35-40
  ];

// The bits for a finder pattern.
var finderPattern = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]];

// The bits for an alignment pattern.
var alignmentPattern = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1]];

// The format string bits for the different Error Correction Levels.
var eclFormatStringBits = ["01", "00", "11", "10"];
// The mask that the standard says to apply to the format string.
var magicMaskForFormatStr = convertToDecimal("101010000010010");

// The Version Patterns that are supposed to be applied to the QR Code versions 7 and higher.
var versionPattern = [
  0, 0, 0, 0, 0, 0, 0, 0x07c94, 0x085bc,
  0x09a99, 0x0a4d3, 0x0bbf6, 0x0c762, 0x0d847, 0x0e60d, 0x0f928, 0x10b78,
  0x1145d, 0x12a17, 0x13532, 0x149a6, 0x15683, 0x168c9, 0x177ec, 0x18ec4,
  0x191e1, 0x1afab, 0x1b08e, 0x1cc1a, 0x1d33f, 0x1ed75, 0x1f250, 0x209d5,
  0x216f0, 0x228ba, 0x2379f, 0x24b0b, 0x2542e, 0x26a64, 0x27541, 0x28c69];

// Creates an empty matrix.
createMatrix = function(x, y) {
  var matrix = [];
  for (var i = 0; i < x; ++i) {
    var subArray = [];
    for (var j = 0; j < y; ++j) {
      subArray.push(-1);
    }
    matrix.push(subArray);
  }
  return matrix;
};

// Creates a finder pattern at the given coordinates.
addFinderPattern = function(x, y, matrix) {
  for (var i = 0; i < 7; ++i) {
    for (var j = 0; j < 7; ++j) {
      matrix[x + i][y + j] = finderPattern[i][j];
    }
  }
  return matrix;
};

// Adds the finder patterns in all corners except the bottom right one as
// defined in the standard.
addFinderPatterns = function(version, matrix) {
  var length = getLength(version);
  addFinderPattern(0, 0, matrix);
  addFinderPattern(length-7, 0, matrix);
  addFinderPattern(0, length-7, matrix);
  return matrix;
}

// Removes the finder pattern from the matrix, used for decoding.
removeFinderPattern = function(x, y, matrix) {
  for (var i = 0; i < 7; ++i) {
    for (var j = 0; j < 7; ++j) {
      matrix[x + i][y + j] = -1;
    }
  }
  return matrix;
};

// Removes the finder patterns from the matrix, used for decoding.
removeFinderPatterns = function(version, matrix) {
  var length = getLength(version);
  removeFinderPattern(0, 0, matrix);
  removeFinderPattern(length-7, 0, matrix);
  removeFinderPattern(0, length-7, matrix);
  return matrix;
};

// The separators are the white spaces that go around the finder patterns.
addSeparators = function(matrix) {
  var length = matrix.length;
  for (var i = 0; i < 8; ++i) {
    matrix[i][7] = 0;
    matrix[7][i] = 0;

    matrix[length-8][i] = 0;
    matrix[length-i-1][7] = 0;

    matrix[i][length-8] = 0;
    matrix[7][length-i] = 0;
  }
  return matrix;
};

// The separators are the white spaces that go around the finder patterns.
// Removed for decoding.
removeSeparators = function(matrix) {
  var length = matrix.length;
  for (var i = 0; i < 8; ++i) {
    matrix[i][7] = -1;
    matrix[7][i] = -1;

    matrix[length-8][i] = -1;
    matrix[length-i-1][7] = -1;

    matrix[i][length-8] = -1;
    matrix[7][length-i] = -1;
  }
  return matrix;
};

// Sets the value in the matrix if it is not already set.
// This is useful when we are applying the timing pattern that will intersect
// with an alignment pattern. We are supposed to just skip the alignment
// pattern.
maybeSet = function(x, y, value, matrix) {
  if (matrix[x][y] == -1) {
    matrix[x][y] = value;
  }
  return matrix;
}

// Adds the timing patterns to the matrix.
addTimingPatterns = function(matrix) {
  length = matrix.length;
  var color = 1;
  for (var i = 8; i < length - 8; ++i) {
    // Don't overwrite alignment patterns, so we use maybeSet.
    maybeSet(6, i, color, matrix);
    maybeSet(i, 6, color, matrix);
    color = 1 - color;
  }
  return matrix;
};

// Removes the timing patterns from the Matrix. Used for decoding.
removeTimingPatterns = function(matrix) {
  length = matrix.length;
  for (var i = 8; i < length - 8; ++i) {
    matrix[6][i] = -1;
    matrix[i][6] = -1;
  }
  return matrix;
};

// Adds an alignment pattern to the matrix at the given coordinates.
addAlignmentPattern = function(x, y, matrix) {
  for (var i = 0; i < 5; ++i) {
    for (var j = 0; j < 5; ++j) {
      matrix[x-2+i][y-2+j] = alignmentPattern[i][j];
    }
  }
  return matrix;
};

// Adds an alignment pattern to the matrix at the given coordinates. Used for
// decoding.
removeAlignmentPattern = function(x, y, matrix) {
  for (var i = 0; i < 5; ++i) {
    for (var j = 0; j < 5; ++j) {
      matrix[x-2+i][y-2+j] = -1;
    }
  }
  return matrix;
};

// Gets the allignment pattern locations for a matrix.
getAlignmentPatternLocations = function(version) {
  if (version < 2) {
    // No alignment patterns in version 1.
    return [];
  }
  var locations = [];
  var length = getLength(version);
  var d = alignmentPatternLocations[version][1] - alignmentPatternLocations[version][0];
  var w = 2;
  if (d >= 0) {
    w = Math.floor((length - alignmentPatternLocations[version][0]) / d + 2);
  }

  // In version two there is only one alignment pattern in the bottom right hand corner.
  if (w == 2) {
    var x = alignmentPatternLocations[version][0];
    var y = alignmentPatternLocations[version][0];
    locations.push([x, y]);
    return locations;
  }

  var cx = alignmentPatternLocations[version][0];
  for (var i = 0; i < w - 2; ++i) {
    locations.push([6, cx + (i * d)]);
    locations.push([cx + (i * d), 6]);
  }

  var cy = alignmentPatternLocations[version][0];
  for (var y = 0; y < w - 1; ++y) {
    var cx = alignmentPatternLocations[version][0];
    for (var x = 0; x < w - 1; ++x) {
      locations.push([cx, cy]);
      cx += d;
    }
    cy += d;
  }
  return locations;
};

// Adds all the alignment patterns to the matrix.
addAlignmentPatterns = function(version, matrix) {
  locations = getAlignmentPatternLocations(version);
  for (var i = 0; i < locations.length; ++i) {
    matrix = addAlignmentPattern(locations[i][0], locations[i][1], matrix);
  }
  return matrix;
};

// Removes all the alignment patterns from the matrix.  Used for decoding.
removeAlignmentPatterns = function(version, matrix) {
  locations = getAlignmentPatternLocations(version);
  for (var i = 0; i < locations.length; ++i) {
    matrix = removeAlignmentPattern(locations[i][0], locations[i][1], matrix);
  }
  return matrix;
};

// Adds the dark module to the matrix as defined by the standard.
addDarkModule = function(matrix) {
  var length = matrix.length;
  matrix[8][length-8] = 1;
};

// Removes the dark module from the matrix.  Used for decoding.
removeDarkModule = function(matrix) {
  var length = matrix.length;
  matrix[8][length-8] = -1;
};

// There are reserved areas for the version information and format information.
// We add them as reserved so the functions that add the data modules can skip
// them.
addReservedAreas = function(version, matrix) {
  // Areas for version and format info.
  var length = getLength(version);
  for (var i = 0; i < 8; ++i) {
    maybeSet(i, 8, 2, matrix);
    maybeSet(8, i, 2, matrix);

    maybeSet(length-i-1, 8, 2, matrix);

    maybeSet(8, length-i-1, 2, matrix);
  }
  matrix[8][8] = 2;
  if (version >= 7) {
    for (var i = 0; i < 6; ++i) {
      for (var j = 0; j < 3; ++j) {
        matrix[i][length-9-j] = 2;
        matrix[length-9-j][i] = 2;
      }
    }
  }
  return matrix;
};

/**
 * Contains the logic for masking the QR Matricies as defined by the 8
 * different mask patterns.
 *
 * Mask Number  If the formula below is true for a given row/column coordinate, switch the bit at that coordinate
 * 0)           (row + column) mod 2 == 0
 * 1)           (row) mod 2 == 0
 * 2)           (column) mod 3 == 0
 * 3)           (row + column) mod 3 == 0
 * 4)           (floor(row / 2) + floor(column / 3) ) mod 2 == 0
 * 5)           ((row * column) mod 2) + ((row * column) mod 3) == 0
 * 6)           (((row * column) mod 2) + ((row * column) mod 3) ) mod 2 == 0
 * 7)           (((row + column) mod 2) + ((row * column) mod 3) ) mod 2 == 0
 */
getMaskedBit = function(bit, x, y, maskNumber) {
  switch(maskNumber) {
    case 0:
      if ((x + y) % 2 == 0) {
        bit ^= 0x1;
      }
      break;
    case 1:
      if (y % 2 == 0) {
        bit ^= 0x1;
      }
      break;
    case 2:
      if (x % 3 == 0) {
        bit ^= 0x1;
      }
      break;
    case 3:
      if ((x + y) % 3 == 0) {
        bit ^= 0x1;
      }
      break;
    case 4:
      if ((Math.floor(y / 2) + Math.floor(x / 3)) % 2 == 0) {
        bit ^= 0x1;
      }
      break;
    case 5:
      if (((x * y) % 2) + ((x * y) % 3) == 0) {
        bit ^= 0x1;
      }
      break;
    case 6:
      if ((((x * y) % 2) + ((x * y) % 3)) % 2 == 0) {
        bit ^= 0x1;
      }
      break;
    case 7:
      if ((((x + y) % 2) + ((x * y) % 3)) % 2 == 0) {
        bit ^= 0x1;
      }
      break;
  }
  return bit;
};

/** Gets the next spot in the pattern for setting data bits.
 *
 * When moving down the pattern is as follows:
 * 2 1
 * 4 3
 * 6 5
 * 8 7
 *
 * When moving up the pattern is as follows:
 * 8 7
 * 6 5
 * 4 3
 * 2 1
 */
nextSpot = function(state) {
  if (state.column == 1) {
    state.x--;
    state.column = 2;
  } else {
    state.column = 1;
    state.x++;
    state.y += state.direction;
  }
  return state;
};

// Changes the state when setting the data bits.
moveState = function(state) {
  state = nextSpot(state);
  // We hit the edge, move over and change directions.
  if (state.y < 0 || state.y >= length) {
    state.x -= 2;
    if (state.x == 6) {
      // Don't overlap with vertical timing pattern
      state.x--;
    }
    state.direction *= -1;
    // Get back on board.
    state.y += state.direction;
  }
  return state;
};

/**
 * Adds the data bits to the matrix.
 *
 * This function should only be called after all finder/alignment/timing
 * patterns etc, have already been added from the matrix.
 */
addDataBits = function(bitString, matrix, maskNumber) {
  var length = matrix.length;
  // Start adding bits at the bottom right corner of the matrix, moving up in
  // the 'y' direction.
  var state = {"x": length-1, "y": length-1, "column": 1, "direction": -1};
  for (var i = 0; i < bitString.length; ++i) {
    // Continue moving until we find a space that is not occupied. This is so
    // we can skip alignment/finder patterns
    while (matrix[state.x][state.y] != -1) {
      moveState(state);
      if (state.x < 0) {
        console.warn("addDataBits: Something Weird Happened");
        return matrix;
      }
    }
    matrix[state.x][state.y] = getMaskedBit(bitString[i], state.x, state.y, maskNumber);
  };
  return matrix;
};

/**
 * Reads the data bits from the matrix, used for decoding.
 *
 * This function should only be called after all finder/alignment/timing
 * patterns etc, have already been removed from the matrix.
 */
getDataBits = function(version, maskNumber, matrix) {
  bitString = "";
  var length = matrix.length;
  var state = {"x": length-1, "y": length-1, "column": 1, "direction": -1};
  var dataModulesCount = getDataModulesCount(version);
  for (var i = 0; i < dataModulesCount; ++i) {
    while (matrix[state.x][state.y] == -1) {
      state = moveState(state);
      if (state.x < 0) {
        console.warn("getDataBits: Something Weird Happened");
        return matrix;
      }
    }
    bitString += getMaskedBit(matrix[state.x][state.y], state.x, state.y, maskNumber);
    matrix[state.x][state.y] = -1;
  };
  return bitString;
};

/**
 * Changes the character to a number.
 */
getDecimalBit = function(bit) {
  if (bit == "1") {
    return 1;
  }
  return 0;
};

/**
 * Creates the masked format string for the given Error Correction Level and
 * mask pattern number.
 */
createFormatString = function(ecl, maskNumber) {
  var maskBinary = padFrontWithZeros(convertToBinary(maskNumber), 3);
  var data = eclFormatStringBits[ecl] + maskBinary;
  var polyData = [
      getDecimalBit(data.charAt(0)),
      getDecimalBit(data.charAt(1)),
      getDecimalBit(data.charAt(2)),
      getDecimalBit(data.charAt(3)),
      getDecimalBit(data.charAt(4)),
    ];
  var polyGen = [1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1];
  var ecBits = rs_encode_msg_with_gen(polyData, 10, polyGen);
  var data = convertToDecimal(data + ecBits.join(""));
  data ^= magicMaskForFormatStr;

  return padFrontWithZeros(convertToBinary(data), 15);
};

/**
 * Adds the given format string to the matrix. It goes next to the finder
 * patterns, while skipping the dark module.
 */
addFormatStringToMatrix = function(formatString, matrix) {
  var length = matrix.length;
  formatString = formatString.split("").reverse().join("");
  for (var i = 0; i < 6; ++i) {
    matrix[8][i] = formatString[i];
    matrix[length-i-1][8] = formatString.charAt(i);
  }

  for (var i = 0; i < 2; ++i) {
    matrix[8][7 + i] = formatString.charAt(6 + i);
    matrix[length - 7 - i][8] = formatString.charAt(6 + i);
  }

  matrix[7][8] = formatString.charAt(8);
  matrix[8][length-7] = formatString.charAt(8);
  for (var i = 0; i < 6; ++i) {
    matrix[5-i][8] = formatString.charAt(9+i);
    matrix[8][length-6+i] = formatString.charAt(9+i);
  }
  return matrix;
};

/**
 * Removes the format string from the matrix, used for decoding.
 */
removeFormatStringFromMatrix = function(matrix) {
  var length = matrix.length;
  for (var i = 0; i < 6; ++i) {
    matrix[8][i] = -1;
    matrix[length-i-1][8] = -1;
  }

  for (var i = 0; i < 2; ++i) {
    matrix[8][7 + i] = -1;
    matrix[length - 7 - i][8] = -1;
  }

  matrix[7][8] = -1;
  matrix[8][length-7] = -1;
  for (var i = 0; i < 6; ++i) {
    matrix[5-i][8] = -1;
    matrix[8][length-6+i] = -1;
  }
  return matrix;
};

/**
 * Reads the format string from the matrix.
 */
getFormatStringFromMatrix = function(matrix) {
  // The format string is put into the matrix twice. Once in the along the top
  // left Finder Pattern, and the second one is split up between the remaining
  // two finder patterns.
  var length = matrix.length;
  var formatString1 = "";
  var formatString2 = "";

  for (var i = 0; i < 6; ++i) {
    formatString1 += matrix[8][i];
    formatString2 += matrix[length-i-1][8];
  }

  for (var i = 0; i < 2; ++i) {
    formatString1 += matrix[8][7 + i];
    formatString2 += matrix[length - 7 - i][8];
  }

  formatString1 += matrix[7][8];
  formatString2 += matrix[8][length-7];

  for (var i = 0; i < 6; ++i) {
    formatString1 += matrix[5-i][8];
    formatString2 += matrix[8][length-6+i];
  }

  if (formatString1 != formatString2) {
    console.warn("Format Strings are different");
    return "";
  }
  var reverseFormatString = formatString1.split("").reverse().join("");
  var num = convertToDecimal(reverseFormatString);
  num ^= magicMaskForFormatStr;

  return padFrontWithZeros(convertToBinary(num), 15);
};

/**
 * Adds the version information to the matrix for versions 7 and higher.
 *
 * This is used by the decoder to check that they have determined the correct
 * version for the matrix.
 */
addVersionInfo = function(version, matrix) {
  if (version < 7) {
    return;
  }
  var length = matrix.length;

  var versionString = padFrontWithZeros(convertToBinary(versionPattern[version]), 18);
  versionString = versionString.split("").reverse().join("");

  for (var i = 0; i < 6; ++i) {
    for (var j = 0; j < 3; ++j) {
      matrix[length-11+j][i] = versionString.charAt((i * 3) + j);
      matrix[i][length-11+j] = versionString.charAt((i * 3) + j);
    }
  }

  return matrix;
};

/**
 * Removes the version information from the matrix.  Used for decoding.
 */
removeVersionInfo = function(version, matrix) {
  if (version < 7) {
    return;
  }
  var length = matrix.length;

  for (var i = 0; i < 6; ++i) {
    for (var j = 0; j < 3; ++j) {
      matrix[length-11+j][i] = -1;
      matrix[i][length-11+j] = -1;
    }
  }

  return matrix;
}

/**
 * Checks that the version information in the matrix matches the version that
 * we have determined by the matrix length.
 */
verifyVersionInfo = function(version, matrix) {
  if (version < 7) {
    return true;
  }
  versionInfo1 = "";
  versionInfo2 = "";
  for (var i = 0; i < 6; ++i) {
    for (var j = 0; j < 3; ++j) {
      versionInfo1 += matrix[length-11+j][i];
      versionInfo2 += matrix[i][length-11+j];
    }
  }
  if (versionInfo1 != versionInfo2) {
    console.warn("The two version infos do not match");
    return false;
  }
  var correctVersionString = padFrontWithZeros(convertToBinary(versionPattern[version]), 18);
  correctVersionString = correctVersionString.split("").reverse().join("");
  if (correctVersionString != versionInfo1) {
    console.warn("Version Info Is Incorrect");
    console.warn("Should Be: " + correctVersionString);
    console.warn("Actually Is: " + versionInfo1);
    return false;
  }
  return true;
};

/**
 * Creates the QR Matrix for the appropriate version, error correction level,
 * input(data), and mask number.
 */
createQRMatrix = function(version, ecl, input, mask) {
  var length = getLength(version);
  var matrix = createMatrix(length, length);

  addFinderPatterns(version, matrix);
  addSeparators(matrix);
  addAlignmentPatterns(version, matrix);
  addTimingPatterns(matrix);
  addDarkModule(matrix);
  addReservedAreas(version, matrix);

  addDataBits(input, matrix, mask);

  formatString = createFormatString(ecl, mask);
  addFormatStringToMatrix(formatString, matrix);
  addVersionInfo(version, matrix);

  return matrix;
};
