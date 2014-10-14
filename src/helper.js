NUMERIC = "NUMERIC";
ALPHANUMERIC = "ALPHANUMERIC";
BYTE = "BYTE";
KANJI = "KANJI";

ECL_L = "L";
ECL_M = "M";
ECL_Q = "Q";
ECL_H = "H";

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
  return Math.floor(getDataModulesCount / 8);
};

get
