
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

var finderPattern = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]];

var alignmentPattern = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1]];

var versionPattern = [
  0, 0, 0, 0, 0, 0, 0, 0x07c94, 0x085bc,
  0x09a99, 0x0a4d3, 0x0bbf6, 0x0c762, 0x0d847, 0x0e60d, 0x0f928, 0x10b78,
  0x1145d, 0x12a17, 0x13532, 0x149a6, 0x15683, 0x168c9, 0x177ec, 0x18ec4,
  0x191e1, 0x1afab, 0x1b08e, 0x1cc1a, 0x1d33f, 0x1ed75, 0x1f250, 0x209d5,
  0x216f0, 0x228ba, 0x2379f, 0x24b0b, 0x2542e, 0x26a64, 0x27541, 0x28c69];

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

maybeSet = function(x, y, value, matrix) {
  if (matrix[x][y] == -1) {
    matrix[x][y] = value;
  }
  return matrix;
}

addFinderPattern = function(x, y, matrix) {
  for (var i = 0; i < 7; ++i) {
    for (var j = 0; j < 7; ++j) {
      matrix[x + i][y + j] = finderPattern[i][j];
    }
  }
  return matrix;
};

removeFinderPattern = function(x, y, matrix) {
  for (var i = 0; i < 7; ++i) {
    for (var j = 0; j < 7; ++j) {
      matrix[x + i][y + j] = -1;
    }
  }
  return matrix;
};

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

addTimingPatterns = function(matrix) {
  length = matrix.length;
  var color = 1;
  for (var i = 8; i < length - 8; ++i) {
    // Don't overwrite alignment patterns.
    maybeSet(6, i, color, matrix);
    maybeSet(i, 6, color, matrix);
    color = 1 - color;
  }
  return matrix;
};

addAlignmentPattern = function(x, y, matrix) {
  for (var i = 0; i < 5; ++i) {
    for (var j = 0; j < 5; ++j) {
      matrix[x-2+i][y-2+j] = alignmentPattern[i][j];
    }
  }
  return matrix;
};

removeAlignmentPattern = function(x, y, matrix) {
  for (var i = 0; i < 5; ++i) {
    for (var j = 0; j < 5; ++j) {
      matrix[x-2+i][y-2+j] = -1;
    }
  }
  return matrix;
};

getAlignmentPatternLocations = function(version) {
  if (version < 2) {
    return [];
  }
  var locations = [];
  var length = getLength(version);
  var d = alignmentPatternLocations[version][1] - alignmentPatternLocations[version][0];
  var w = 2;
  if (d >= 0) {
    w = Math.floor((length - alignmentPatternLocations[version][0]) / d + 2);
  }

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

addAlignmentPatterns = function(version, matrix) {
  locations = getAlignmentPatternLocations(version);
  for (var i = 0; i < locations.length; ++i) {
    matrix = addAlignmentPattern(locations[i][0], locations[i][1], matrix);
  }
  return matrix;
};

removeAlignmentPatterns = function(version, matrix) {
  locations = getAlignmentPatternLocations(version);
  for (var i = 0; i < locations.length; ++i) {
    matrix = removeAlignmentPattern(locations[i][0], locations[i][1], matrix);
  }
  return matrix;
};

addDarkModule = function(matrix) {
  var length = matrix.length;
  matrix[8][length-8] = 1;
};

removeDarkModule = function(matrix) {
  var length = matrix.length;
  matrix[8][length-8] = -1;
};

addReservedAreas = function(version, matrix) {
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

addDataBits = function(bitString, matrix, maskNumber) {
  var length = matrix.length;
  var state = {"x": length-1, "y": length-1, "column": 1, "direction": -1};
  matrix[state.x][state.y] = getMaskedBit(bitString[0], state.x, state.y, maskNumber);
  for (var i = 1; i < bitString.length; ++i) {
    while (matrix[state.x][state.y] != -1) {
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
      if (state.x < 0) {
        console.warn("Something Weird Happened");
        return matrix;
      }
    }
    matrix[state.x][state.y] = getMaskedBit(bitString[i], state.x, state.y, maskNumber);
  };
  return matrix;
};

getDecimalBit = function(bit) {
  if (bit == "1") {
    return 1;
  }
  return 0;
};

getFormatString = function(ecl, maskNumber) {
  var eclBits = ["01", "00", "11", "10"];
  var magicMaskForFormatStr = convertToDecimal("101010000010010");
  var maskBinary = padFrontWithZeros(convertToBinary(maskNumber), 3);
  var data = eclBits[ecl] + maskBinary;
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

addFormatStringToMatrix = function(formatString, matrix) {
  formatString = formatString.split("").reverse().join("");
  for (var i = 0; i < 6; ++i) {
    matrix[8][i] = formatString[i];
    matrix[length-i-1][8] = formatString.charAt(i);
  }
  matrix[8][7] = formatString.charAt(6);
  matrix[8][8] = formatString.charAt(7);

  matrix[length - 7][8] = formatString.charAt(6);
  matrix[length - 8][8] = formatString.charAt(7);

  matrix[7][8] = formatString.charAt(8);
  matrix[8][length-7] = formatString.charAt(8);
  for (var i = 0; i < 6; ++i) {
    matrix[5-i][8] = formatString.charAt(9+i);
    matrix[8][length-6+i] = formatString.charAt(9+i);
  }
  return matrix;
};

addVersionInfo = function(version, matrix) {
  if (version < 7) {
    return;
  }

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

printMatrix = function(matrix) {
  if (matrix.length == 0) {
    return;
  }
  for (var i = 0; i < matrix[0].length; ++i) {
    var line = "";
    for (var j = 0; j < matrix.length; ++j) {
      line += matrix[j][i];
    }
    console.log(line);
  }
};

createQRMatrix = function(version, ecl, input, mask) {
  var length = getLength(version);
  var matrix = createMatrix(length, length);
  addFinderPattern(0, 0, matrix);
  addFinderPattern(length-7, 0, matrix);
  addFinderPattern(0, length-7, matrix);
  addSeparators(matrix);
  addAlignmentPatterns(version, matrix);
  addTimingPatterns(matrix);
  addDarkModule(matrix);
  addReservedAreas(version, matrix);
  //var mask = 0;
  addDataBits(input, matrix, mask);
  formatString = getFormatString(ecl, mask);
  addFormatStringToMatrix(formatString, matrix);
  addVersionInfo(version, matrix);

  return matrix;
};
