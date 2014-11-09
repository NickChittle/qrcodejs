NUMERIC = "NUMERIC";
ALPHANUMERIC = "ALPHANUMERIC";
BYTE = "BYTE";
KANJI = "KANJI";

ECL_L = 0;
ECL_M = 1;
ECL_Q = 2;
ECL_H = 3;

var eclToText = ["ECL_L", "ECL_M", "ECL_Q", "ECL_H"];

var modeIndicators = { NUMERIC: "0001", ALPHANUMERIC: "0010", BYTE: "0100", KANJI: "1000" };
var inverseModeIndicator = { "0001": NUMERIC, "0010": ALPHANUMERIC, "0100": BYTE, "1000": KANJI };
