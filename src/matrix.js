
alignmentPattern = [
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
    matrix[x+i][y] = 1;
    matrix[x+i][y+6] = 1;
    matrix[x][y+i] = 1;
    matrix[x+6][y+i] = 1;
  }
  for (var i = 0; i < 5; ++i) {
    matrix[x+1+i][y+1] = 0;
    matrix[x+1+i][y+5] = 0;
    matrix[x+1][y+1+i] = 0;
    matrix[x+5][y+1+i] = 0;
  }
  for (var i = 0; i < 3; ++i) {
    for (var j = 0; j < 3; ++j) {
      matrix[x+2+i][y+2+j] = 1;
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
  matrix[x][y] = 1;
  for (var i = -2; i < 3; ++i) {
    matrix[x+i][y-2] = 1;
    matrix[x+i][y+2] = 1;
    matrix[x-2][y+i] = 1;
    matrix[x+2][y+i] = 1;
  }
  for (var i = -1; i < 2; ++i) {
    matrix[x+i][y-1] = 0;
    matrix[x+i][y+1] = 0;
    matrix[x-1][y+i] = 0;
    matrix[x+1][y+i] = 0;
  }
  return matrix;
};

addAlignmentPatterns = function(version, matrix) {
  if (version < 2) {
    return matrix;
  }
  var length = getLength(version);
  var d = alignmentPattern[version][1] - alignmentPattern[version][0];
  var w = 2;
  if (d >= 0) {
    w = Math.floor((length - alignmentPattern[version][0]) / d + 2);
  }

  if (w == 2) {
    var x = alignmentPattern[version][0];
    var y = alignmentPattern[version][0];
    return addAlignmentPattern(x, y, matrix);
  }

  var cx = alignmentPattern[version][0];
  for (var i = 0; i < w - 2; ++i) {
    matrix = addAlignmentPattern(6, cx + (i*d), matrix);
    matrix = addAlignmentPattern(cx + (i*d), 6, matrix);
  }

  var cy = alignmentPattern[version][0];
  for (var y = 0; y < w - 1; ++y) {
    var cx = alignmentPattern[version][0];
    for (var x = 0; x < w - 1; ++x) {
      matrix = addAlignmentPattern(cx, cy, matrix);
      cx += d;
    }
    cy += d;
  }

  return matrix;
};

addDarkModule = function(matrix) {
  var length = matrix.length;
  matrix[8][length-8] = 1;
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

addDataBits = function(bitString, matrix) {
  var length = matrix.length;
  var state = {"x": length-1, "y": length-1, "column": 1, "direction": -1};
  matrix[state.x][state.y] = bitString[0];
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
    matrix[state.x][state.y] = bitString[i];
  };
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

createQRMatrix = function(version, input) {
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
  addDataBits(input, matrix);

  var canvas = new Canvas();
  canvas.drawMatrix(matrix, 10);
};
