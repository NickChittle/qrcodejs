/**
 * This file evaluates a matrix that has been masked and determines the penalty
 * score to be attributed to it.
 *
 * There are 8 Data masks and we want to use the one with the lowest penalty
 * score.
 */

/**
 * Determines the penalty for 'count' number of the same modules in a row/column.
 */
getPenaltyForConsecutiveModules = function(count) {
  if (count >= 5) {
    // For five consecutive modules there is a penalty of 3, for each
    // additional module after 5, we add one to the penalty.
    return 3 + (count - 5);
  }
  return 0;
};

evalOneModule = function(color, state) {
  if (color == state.currentColor) {
    state.count++;
  } else {
    var tmp = state.count;
    state.count = 1;
    state.currentColor = color;
    return getPenaltyForConsecutiveModules(tmp);
  }
  return 0;
};

/**
 * Evaluates the penalty by counting the number of consecutive modules in a row
 * that are the same.
 */
evalConditionOne = function(matrix) {
  var penalty = 0;
  var length = matrix.length;
  // Evaluates the rows.
  for (var y = 0; y < length; ++y) {
    var state = {count: 0, currentColor: -1};
    for (var x = 0; x < length; ++x) {
      penalty += evalOneModule(matrix[x][y], state);
    }
    penalty += getPenaltyForConsecutiveModules(state.count);
  }

  // Evaluates the columns.
  for (var x = 0; x < length; ++x) {
    var currentColor = -1;
    var count = 0;
    for (var y = 0; y < length; ++y) {
      penalty += evalOneModule(matrix[x][y], state);
    }
    penalty += getPenaltyForConsecutiveModules(state.count);
  }

  return penalty;
};

/**
 * Determines the penalty by counting how many squares(2 x 2) of the same color
 * there are.
 */
evalConditionTwo = function(matrix) {
  var penalty = 0;
  var length = matrix.length;
  for (var x = 0; x < length - 1; ++x) {
    for (var y = 0; y < length - 1; ++y) {
      var color = matrix[x][y];
      if (matrix[x+1][y] == color && matrix[x][y+1] == color && matrix[x+1][y+1] == color) {
        penalty += 3;
      }
    }
  }
  return penalty;
};

/**
 * Checks if the matrix matches the pattern starting at (x,y) going in the x direction.
 */
checkMatchX = function(matrix, x, y, badPattern) {
  for (var i = 0; i < badPattern.length; ++i) {
    if (matrix[x+i][y] != badPattern[i]) {
      return false;
    }
  }
  return true;
};

/**
 * Checks if the matrix matches the pattern starting at (x,y) going in the y direction.
 */
checkMatchY = function(matrix, x, y, badPattern) {
  for (var i = 0; i < badPattern.length; ++i) {
    if (matrix[x][y+i] != badPattern[i]) {
      return false;
    }
  }
  return true;
};

/**
 * The given bad patterns match then finder patterns.  This evaluation
 * condition looks for those patterns in the matrix and determines the
 * appropriate penalty.
 */
evalConditionThree = function(matrix) {
  var bad1 = [1,0,1,1,1,0,1,0,0,0,0];
  var bad2 = [0,0,0,0,1,0,1,1,1,0,1];
  var length = matrix.length;
  var badLength = bad1.length;
  var end = length - badLength + 1;

  var penalty = 0;
  for (var x = 0; x < end; ++x) {
    for (var y = 0; y < length; ++y) {
      if (checkMatchX(matrix, x, y, bad1)) {
        penalty += 40;
      }
      if (checkMatchX(matrix, x, y, bad2)) {
        penalty += 40;
      }
    }
  }
  for (var x = 0; x < length; ++x) {
    for (var y = 0; y < end; ++y) {
      if (checkMatchY(matrix, x, y, bad1)) {
        penalty += 40;
      }
      if (checkMatchY(matrix, x, y, bad2)) {
        penalty += 40;
      }
    }
  }
  return penalty;
};

/**
 * Evaluates the ration of black modules to white modules and assigns a penalty
 * if the ration is far off from 1:1.
 */
evalConditionFour = function(matrix) {
  var length = matrix.length;
  var totalModules = length * length;
  var darkModules = 0;
  for (var i = 0; i < matrix.length; ++i) {
    for (var j = 0; j < matrix.length; ++j) {
      if (matrix[i][j] == 1) {
        darkModules++;
      }
    }
  }

  var percentDark = (darkModules / totalModules) * 100;
  var previousPercent = Math.floor(percentDark / 5) * 5;
  var nextPercent = previousPercent + 5;

  var one = Math.abs(previousPercent - 50) / 5;
  var two = Math.abs(nextPercent - 50) / 5;
  var min = Math.min(one, two);
  return min * 10;
};

/**
 * Sums up the four penalty conditions for a matrix.
 */
evaluateMatrixMask = function(matrix) {
  var penalty1 = evalConditionOne(matrix);
  var penalty2 = evalConditionTwo(matrix);
  var penalty3 = evalConditionThree(matrix);
  var penalty4 = evalConditionFour(matrix);

  var penalty = penalty1 + penalty2 + penalty3 + penalty4;
  return penalty;
};
