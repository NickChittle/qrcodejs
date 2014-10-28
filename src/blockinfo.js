
eccTable = [
    [[1, 0], [1, 0], [1, 0], [1, 0]], // 1
    [[1, 0], [1, 0], [1, 0], [1, 0]],
    [[1, 0], [1, 0], [2, 0], [2, 0]],
    [[1, 0], [2, 0], [2, 0], [4, 0]],
    [[1, 0], [2, 0], [2, 2], [2, 2]], // 5
    [[2, 0], [4, 0], [4, 0], [4, 0]],
    [[2, 0], [4, 0], [2, 4], [4, 1]],
    [[2, 0], [2, 2], [4, 2], [4, 2]],
    [[2, 0], [3, 2], [4, 4], [4, 4]],
    [[2, 2], [4, 1], [6, 2], [6, 2]], //10
    [[4, 0], [1, 4], [4, 4], [3, 8]],
    [[2, 2], [6, 2], [4, 6], [7, 4]],
    [[4, 0], [8, 1], [8, 4], [12, 4]],
    [[3, 1], [4, 5], [11, 5], [11, 5]],
    [[5, 1], [5, 5], [5, 7], [11, 7]], //15
    [[5, 1], [7, 3], [15, 2], [3, 13]],
    [[1, 5], [10, 1], [1, 15], [2, 17]],
    [[5, 1], [9, 4], [17, 1], [2, 19]],
    [[3, 4], [3, 11], [17, 4], [9, 16]],
    [[3, 5], [3, 13], [15, 5], [15, 10]], //20
    [[4, 4], [17, 0], [17, 6], [19, 6]],
    [[2, 7], [17, 0], [7, 16], [34, 0]],
    [[4, 5], [4, 14], [11, 14], [16, 14]],
    [[6, 4], [6, 14], [11, 16], [30, 2]],
    [[8, 4], [8, 13], [7, 22],  [22, 13]], //25
    [[10, 2], [19, 4], [28, 6], [33, 4]],
    [[8, 4], [22, 3], [8, 26],  [12, 28]],
    [[3, 10], [3, 23], [4, 31], [11, 31]],
    [[7, 7], [21, 7], [1, 37],  [19, 26]],
    [[5, 10], [19, 10], [15, 25], [23, 25]], //30
    [[13, 3], [2, 29], [42, 1], [23, 28]],
    [[17, 0], [10, 23], [10, 35], [19, 35]],
    [[17, 1], [14, 21], [29, 19], [11, 46]],
    [[13, 6], [14, 23], [44, 7], [59, 1]],
    [[12, 7], [12, 26], [39, 14], [22, 41]], //35
    [[6, 14], [6, 34], [46, 10], [2, 64]],
    [[17, 4], [29, 14], [49, 10], [24, 46]],
    [[4, 18], [13, 32], [48, 14], [42, 32]],
    [[20, 4], [40, 7], [43, 22], [10, 67]],
    [[19, 6], [18, 31], [34, 34], [20, 61]] //40
  ];

splitIntoBlocks = function(codewords, version, ecl) {
  var blocks = [];
  var blockInfo = eccTable[version-1][ecl];
  blockSize = Math.floor(codewords.length / (blockInfo[0] + blockInfo[1]));
  var start = 0;
  for (var i = 0; i < blockInfo[0]; ++i) {
    var end = start + blockSize;
    var block = codewords.slice(start, end);
    blocks.push({dataCodewords: block});
    start += blockSize;
  }
  blockSize++;
  for (var i = 0; i < blockInfo[1]; ++i) {
    var end = start + blockSize;
    var block = codewords.slice(start, end);
    blocks.push({dataCodewords: block});
    start += blockSize;
  }
  return blocks;
};

interleaveDataAndErrorBlocks = function(blocks) {
  dataBlocks = [];
  errorBlocks = [];
  for (var i = 0; i < blocks.length; ++i) {
    dataBlocks.push(blocks[i].dataCodewords);
    errorBlocks.push(blocks[i].errorCodewords);
  }
  return {dataCodewords: interleaveBlocks(dataBlocks), errorCodewords: interleaveBlocks(errorBlocks)};
};

interleaveBlocks = function(blocks) {
  // Go one further because often times the blocks are not the same size, but
  // will only be off by one.
  var blockSize = blocks[0].length + 1;
  var codewords = [];
  for (var i = 0; i < blockSize; ++i) {
    for (var j = 0; j < blocks.length; ++j) {
      if (i < blocks[j].length) {
        codewords.push(blocks[j][i]);
      }
    }
  }
  return codewords;
};
