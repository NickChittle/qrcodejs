var input = "Nick Chittle Dec 22 1992"

for (var i = 1; i <= 40; ++i) {
  console.warn("Version: " + i + " Data Modules: " + getDataModulesCount(i));
}

getCharacterCountIndicatorBitLength = function(mode, version) {
  if (version < 1 || version > 40) {
    console.warn("Incorrect Version: " + version);
  }
  switch(mode.toLowerCase()) {
    case "numeric":
      if (version <= 9) {
        return 10;
      } else if (version <= 26) {
        return 12;
      } else if (version <= 40) {
        return 14;
      }
      break;
    case "alphanumeric":
      if (version <= 9) {
        return 9;
      } else if (version <= 26) {
        return 11;
      } else if (version <= 40) {
        return 13;
      }
      break;
    case "byte":
      if (version <= 9) {
        return 8;
      } else if (version <= 26) {
        return 16;
      } else if (version <= 40) {
        return 16;
      }
      break;
    case "kanji":
      if (version <= 9) {
        return 8;
      } else if (version <= 26) {
        return 10;
      } else if (version <= 40) {
        return 12;
      }
      break;
    default:
      return 0;
  }
}
