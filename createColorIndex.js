

// Read the file and print its contents.
var fs = require('fs');
var mapColors = require("./web/js/map-colors.json");
var mcData = require('minecraft-data')("1.12");

var defaultColors = {
  "Light Blue": [112, 108, 138, 255],
  "Light Gray": [135, 107, 98, 255],
  "White": [209, 177, 161, 255],
  "Orange": [159, 82, 36, 255],
  "Magenta": [149, 87, 108, 255],
  "Yellow": [186, 133, 36, 255],
  "Lime": [103, 117, 53, 255],
  "Pink": [160, 77, 78, 255],
  "Gray": [57, 41, 35, 255],
  "Cyan": [87, 92, 92, 255],
  "Purple": [122, 73, 88, 255],
  "Blue": [76, 62, 92, 255],
  "Brown": [76, 50, 35, 255],
  "Green": [76, 82, 42, 255],
  "Red": [142, 60, 46, 255],
  "Black": [37, 22, 16, 255],
  "Ore": [112, 112, 112, 255]
}

var unknownColor = [255, 0, 255, 255];


function getColor(blockId){
  for(var c in mapColors){
    for(var b in mapColors[c].blocks){
      if (blockId === mapColors[c].blocks[b]){
        return mapColors[c].color;
      }
    }
  }
  return null;
}

function inferColor(displayName){
  for(var c in defaultColors){
    if (displayName.indexOf(c) >= 0){
      return defaultColors[c];
    }
  }
  return null
}

var colorIndex = [];

for(var i=0;i<253;i++) {
  var color = getColor(i);
  if (color !== null){
    colorIndex[i] = color;
    //console.log("Found color for " +mcData.blocks[i].displayName + " : " +color);
    continue;
  }

  color = inferColor(mcData.blocks[i].displayName);
  if (color !== null){
    colorIndex[i] = color;
    //console.log("Inferred color for " +mcData.blocks[i].displayName + " : " +color);
    continue;
  }
  console.log("Can't find it for "+ i + "  " +  mcData.blocks[i].displayName)
  colorIndex[i] = unknownColor;
}

process.stdout.write(JSON.stringify(colorIndex));
