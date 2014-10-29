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

  this.context.fillStyle = "#2e2";
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

  for (var i = 0; i < length; ++i) {
    for (var j = 0; j < length; ++j) {
      if (matrix[i][j] == 1) {
        this.context.fillStyle = "#000";
        this.context.fillRect(i * pixelWidth, j * pixelWidth, pixelWidth, pixelWidth);
      } else if (matrix[i][j] == 0) {
        this.context.fillStyle = "#FFF";
        this.context.fillRect(i * pixelWidth, j * pixelWidth, pixelWidth, pixelWidth);
      } else if (matrix[i][j] == 2) {
        // Reserved Square.
        this.context.fillStyle = "#00F";
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
