getMiddleBrightness = function(imageMatrix) {
  var min = imageMatrix[0][0];
  var max = imageMatrix[0][0];
  for (var i = 0; i < imageMatrix.length; ++i) {
    for (var j = 0; j < imageMatrix[0].length; ++j) {
      if (imageMatrix[i][j] < min) {
        min = imageMatrix[i][j];
      }
      if (imageMatrix[i][j] > max) {
        max = imageMatrix[i][j];
      }
    }
  }
  return (min + max) / 2;
};

getGreyscaleBitmap = function(image) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var width = image.width;
  var height = image.height;
  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);
  var myData = context.getImageData(0, 0, width, height);

  var greyScale = [];
  var ret = [];
  for (var x = 0; x < width; ++x) {
    ret.push(new Array(height));
    greyScale.push(new Array(height));
  }

  for (var x = 0; x < width; ++x) {
    for (var y = 0; y < height; ++y) {
      var point = x * 4 + y * width * 4;
      greyScale[x][y] = (myData.data[point]*33 + myData.data[point + 1] * 34 + myData.data[point + 2] * 33 ) / 100;
    }
  }


  var middle = getMiddleBrightness(greyScale);

  for (var x = 0; x < width; ++x) {
    for (var y = 0; y < height; ++y) {
      ret[x][y] = (greyScale[x][y] < middle) ? 1 : 0;
    }
  }

  return ret;
};

zeroArray = function(arr) {
  for (var i = 0; i < arr.length; ++i) {
    arr[i] = 0;
  }
  return arr;
};

sumArray = function(arr) {
  var total = 0;
  for (var i = 0; i < arr.length; ++i) {
    total += arr[i];
  }
  return total;
};

isFinderPattern = function(pixelCount) {
  var totalModules = sumArray(pixelCount);
  if (totalModules < 7) {
    return false;
  }
  var moduleSize = Math.floor(totalModules / 7);
  var maxVariance = Math.floor(moduleSize / 2);
  if (Math.abs(moduleSize - pixelCount[0]) < maxVariance &&
      Math.abs(moduleSize - pixelCount[1]) < maxVariance &&
      Math.abs((3 * moduleSize) - pixelCount[2]) < 3 * maxVariance &&
      Math.abs(moduleSize - pixelCount[3]) < maxVariance &&
      Math.abs(moduleSize - pixelCount[4]) < maxVariance) {
    return moduleSize;
  } else {
    return false;
  }
};

changeState = function(bit, state) {
  if (bit == 1) {
    // Black Pixel
    if (state.currentState == 1 || state.currentState == 3) {
      // We were previously looking at white pixels, move up.
      state.currentState++;
    }
    state.pixelCount[state.currentState]++;
  } else {
    // White Pixel.
    if (state.currentState == 0 && state.pixelCount[state.currentState] == 0) {
      return;
    }
    if (state.currentState != 1 && state.currentState != 3) {
      // We were previously looking at black pixels, move on.
      state.currentState++;
    }
    if (state.currentState >= 5) {
      return;
    }
    state.pixelCount[state.currentState]++;
  }
};

findTopLeftCenter = function(bitmap) {
  var width = bitmap.length;
  var height = bitmap[0].length;
  state = {currentState: 0, pixelCount: new Array(5)};
  for (var y = 0; y < height; ++y) {
    state.currentState = 0;
    zeroArray(state.pixelCount);
    for (var x = 0; x < width; ++x) {
      changeState(bitmap[x][y], state);
      if (state.currentState >= 5) {
        var result = isFinderPattern(state.pixelCount);
        if (result) {
          var middleWidth = state.pixelCount[2];
          var cx = Math.round(x - (state.pixelCount[4] + state.pixelCount[3] + (middleWidth / 2)));
          var cy = Math.round(y + (middleWidth / 2));
          return {cx: cx, cy: cy, modulesize: result};
        } else {
          break;
        }
      }
    }
  }
  return undefined;
};

findTopRightCenter = function(bitmap) {
  var width = bitmap.length;
  var height = bitmap[0].length;
  state = {currentState: 0, pixelCount: new Array(5)};
  for (var y = 0; y < height; ++y) {
    state.currentState = 0;
    zeroArray(state.pixelCount);
    for (var x = width-1; x >= 0; --x) {
      changeState(bitmap[x][y], state);
      if (state.currentState >= 5) {
        var result = isFinderPattern(state.pixelCount);
        if (result) {
          var middleWidth = state.pixelCount[2];
          var cx = Math.round(x + state.pixelCount[4] + state.pixelCount[3] + (middleWidth / 2));
          var cy = Math.round(y + (middleWidth / 2));
          return {cx: cx, cy: cy, modulesize: result};
        } else {
          break;
        }
      }
    }
  }
  return undefined;
};

findBottomLeftCenter = function(bitmap) {
  var width = bitmap.length;
  var height = bitmap[0].length;
  state = {currentState: 0, pixelCount: new Array(5)};
  for (var y = height-1; y >= 0; --y) {
    state.currentState = 0;
    zeroArray(state.pixelCount);
    for (var x = 0; x < width; ++x) {
      changeState(bitmap[x][y], state);
      if (state.currentState >= 5) {
        var result = isFinderPattern(state.pixelCount);
        if (result) {
          var middleWidth = state.pixelCount[2];
          var cx = Math.round(x - (state.pixelCount[4] + state.pixelCount[3] + (middleWidth / 2)));
          var cy = Math.round(y - (middleWidth / 2));
          return {cx: cx, cy: cy, modulesize: result};
        } else {
          break;
        }
      }
    }
  }
};

findFinderPatterns = function(bitmap) {
  var width = bitmap.length;
  var height = bitmap[0].length;
  state = {currentState: 0, pixelCount: new Array(5)};

  // Find top-left center.
  var topleft = findTopLeftCenter(bitmap);

  // Find top-right center.
  var topright = findTopRightCenter(bitmap);

  // Find bottom-left center.
  var bottomleft = findBottomLeftCenter(bitmap);

  return {topleft: topleft, topright: topright, bottomleft: bottomleft };
};

getMatrixFromImage = function(image) {
  var bitmap = getGreyscaleBitmap(image);
  var centers = findFinderPatterns(bitmap);
  if (!centers.topleft || !centers.topright || !centers.bottomleft) {
    console.warn("Could not find a finder pattern:");
    console.warn(centers);
    return {success: false, errorReason: "Could not find the finder patterns"};
  }
  // Verify module sizes
  var moduleSize = Math.round((centers.topleft.modulesize + centers.topright.modulesize + centers.bottomleft.modulesize) / 3);
  var topLength = Math.round((centers.topright.cx - centers.topleft.cx) / moduleSize) + 7;
  var leftLength = Math.round((centers.bottomleft.cy - centers.topleft.cy) / moduleSize) + 7;
  if (topLength != leftLength) {
    console.warn("Cannot agree on module size from finder patterns");
    console.warn("TopLength: " + topLength +", LeftLength: " + leftLength);
    return {success: false, errorReason: "Could not agree on module size from finder patterns"};
  }
  var length = topLength;
  var matrix = [];
  // We want to start in the middle of a module.
  // Left edge of QR Code is cx - moduleSize * 3.5, but we add another
  // 0.5 * moduleSize to get to the center of the first module.
  var startX = centers.topleft.cx - (moduleSize * 3);
  var startY = centers.topleft.cy - (moduleSize * 3);
  for (var x = startX; x < startX + (length * moduleSize); x += moduleSize) {
    var column = [];
    for (var y = startY; y < startY + (length * moduleSize); y += moduleSize) {
      column.push(bitmap[x][y]);
    }
    matrix.push(column);
  }
  return {success: true, matrix: matrix};
};
