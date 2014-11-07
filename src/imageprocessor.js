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

getGrayscaleBitmap = function(image) {
  //var canvas = document.createElement('canvas');
  var canvas = document.getElementById("imageCanvas");
  var context = canvas.getContext('2d');
  //context.drawImage(image, 0, 0 );
  var width = canvas.width;
  var height = canvas.height;
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
      ret[x][y] = (myData.data[point]*33 + myData.data[point + 1] * 34 + myData.data[point + 2] * 33 ) / 100;
    }
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

findCenter = function(state, x, y) {
  var middleWidth = state.pixelCount[2];
  var cx = Math.round(x - (state.pixelCount[4] + state.pixelCount[3] + (middleWidth / 2)));
  var cy = Math.round(y + (middleWidth / 2));
  return {cx: cx, cy: cy};
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
    if (state.currentState != 1 && state.currentState != 3) {
      // We were previously looking at black pixels, move on.
      state.currentState++;
    }
    if (state.currentState >= 5) {
      // Check if it matches pattern.
      if (isFinderPattern(state.pixelCount)){
        return true;
      }
    }
    state.pixelCount[state.currentState]++;
  }
  return false;
};

findFinderPattern = function(bitmap) {
  var skip = 1;
  var width = bitmap.length;
  var height = bitmap[0].length;
  state = {currentState: 0, pixelCount: new Array(5)};
  for (var y = 0; y < height; y+=skip) {
    state.currentState = 0;
    zeroArray(state.pixelCount);
    for (var x = 0; x < width; ++x) {
      if (changeState(bitmap[x][y], state)) {
        console.warn(findCenter(state, x, y));
        return;
      }
    }
  }
};
