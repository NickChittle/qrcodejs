
createMatrix = function(x, y) {
  var matrix = [];
  for (var i = 0; i < x; ++i) {
    var subArray = [];
    for (var j = 0; j < y; ++j) {
      subArray.push(0);
    }
    matrix.push(subArray);
  }
  return matrix;
};

addFinderPattern = function(x, y, matrix) {
  for (var i = 0; i < 7; ++i) {
    matrix[x+i][y] = 1;
    matrix[x+i][y+6] = 1;
    matrix[x][y+i] = 1;
    matrix[x+6][y+i] = 1;
  }
  for (var i = 0; i < 3; ++i) {
    for (var j = 0; j < 3; ++j) {
      matrix[x+2+i][y+2+j] = 1;
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

function Canvas() {
  this.canvas = document.getElementById('imageCanvas');
  this.context = this.canvas.getContext('2d');
}

/*
 * Paints the canvas.
 */
Canvas.prototype.drawMatrix = function(matrix, pixelWidth) {
  this.clear();
  var length = matrix.length;
  this.canvas.width = pixelWidth * length;
  this.canvas.height = pixelWidth * length;

  this.context.fillStyle = "#FFF";
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  this.context.fillStyle = "#000";

  for (var i = 0; i < length; ++i) {
    for (var j = 0; j < length; ++j) {
      if (matrix[i][j] == 1) {
        console.warn(i,j);
        this.context.fillRect(i * pixelWidth, j * pixelWidth, pixelWidth, pixelWidth);
      }
    }
  }
}

/*
 * Clears the canvas.
 */
Canvas.prototype.clear = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

createQRMatrix = function(version, input) {
  var length = getLength(version);
  var matrix = createMatrix(length, length);
  matrix = addFinderPattern(0, 0, matrix);
  matrix = addFinderPattern(length-7, 0, matrix);
  matrix = addFinderPattern(0, length-7, matrix);
  printMatrix(matrix);

  var canvas = new Canvas();
  canvas.drawMatrix(matrix, 5);
};
