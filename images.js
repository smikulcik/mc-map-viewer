
  var fs = require('fs'),
      PNG = require('pngjs').PNG;

var Anvil=require("prismarine-provider-anvil").Anvil("1.8");
var Vec3 = require("vec3");
var path = require('path');

var mapColors = require("./map-color-index.json")

var REGION_IMG_DIR="./web/assets/region"
var MINECRAFT_DIR='C:\\Users\\Simon\\AppData\\Roaming\\.minecraft\\saves\\SimonSim'

var anvil = new Anvil(path.join(MINECRAFT_DIR, 'region'));

function getChunkBlocks(chunk_x, chunk_z){
  var blocks = [];
  return new Promise(function(resolve, reject){
    var d=anvil.load(chunk_x, chunk_z);
    d.then(function(data){
      if (data == null){
        reject(null);
        return
      }
      for(var x=0; x<16;x++){
        blocks.push([]);
        for(var z=0; z<16;z++){
          for(var y=255;y>=0;y--){
            var blockType = data.getBlockType(new Vec3(x, y, z));
            //  console.log(" BT" + blockType)
            if(blockType !== 0){
              blocks[x][z] = blockType;
              break;
            }
          }
        }
      }
      console.log("Got chunk " + chunk_x, chunk_z + " " + blocks.length + "x" + blocks[0].length)
      resolve(blocks);
    }).catch(function(err){
      console.log("anvil load error")
      console.log(err)
      console.log(err.stack);
      reject(err)
    });
  })
}

var addChunk = function(chunk, file, start_x, start_y){
  return new Promise(function(resolve, reject){
    for (var y = 0; y < 16; y++) {
      for (var x = 0; x < 16; x++) {
        var idx = (file.width * (start_y+y) + (start_x+x)) << 2;
        var col = (start_x+x) < (file.width >> 1) ^ (start_y+y) < (file.height >> 1) ? 0xe5 : 0xff;

        file.data[idx] = mapColors[chunk[x][y]][0];
        file.data[idx + 1] = mapColors[chunk[x][y]][1];
        file.data[idx + 2] = mapColors[chunk[x][y]][2];
        file.data[idx + 3] = 0xff;
      }
    }
    //console.log("Wrote chunk " + start_x/16, start_y/16)
    resolve();
  });
};


var drawRegion = function(rx, rz, filename){
  var regionImage = new PNG({width:16*32,height:16*32});

  var promises = [];
  for(var x=0;x<32;x++){
    for(var z=0;z<32;z++){
      (function(x, z){
        promises.push(
          getChunkBlocks(rx*32 + x, rz*32 + z)
          .then(chunk => {
            return addChunk(chunk, regionImage, x*16, z*16)
          })
          .catch(err => {
            if(err !== null)console.log(err)
          })
        )
      })(x, z)
    }
  }

  return Promise.all(promises).then(() => {
    console.log("Got all chunks " + rx + " " + rz)
    return new Promise(function(resolve, reject){
      regionImage.pack()
      .pipe(fs.createWriteStream(REGION_IMG_DIR + '/' + filename))
      .on('finish', function() {
        console.log('Written! ' + rx + " " + rz);
        resolve()
      })
      .on('error', function(err){
        reject(err);
      });
    })
    .catch(err => console.log(err))
  });
};

var getOutdatedRegions = function(directory){
  return new Promise(function(resolve, reject){
    fs.readdir(directory, function(err, regions) {
      outdatedRegions = []
      for(r in regions){
        var regionModified = new Date(fs.statSync(path.join(directory,regions[r])).mtime);

        var imageFilename = path.basename(regions[r], ".mca") + ".png"
        try{
          var imageStat = fs.statSync(path.join(REGION_IMG_DIR, imageFilename))
          var imageModified = new Date(imageStat.mtime);
          if(imageModified < regionModified){
            outdatedRegions.push(regions[r])
          }
        }catch(err){
          outdatedRegions.push(regions[r])
        }
      }
      console.log(outdatedRegions)
      resolve(outdatedRegions);
    });
  });
};
// getOutdatedRegions(path.join(MINECRAFT_DIR, 'region')).catch(err => console.log(err));

var updateRegionImages = function(){
  return getOutdatedRegions(path.join(MINECRAFT_DIR, 'region'))
  .catch(err => console.log(err))
  .then(regions => regions.map(r => {
    var region = path.basename(r)
    var regionRegex = /r\.(-?\d+)\.(-?\d+)\.mca/g
    var results = regionRegex.exec(region)
    if(results){
      var x = parseInt(results[1]);
      var z = parseInt(results[2]);
      console.log("Drawing region " + x + " " + z)
      drawRegion(x, z, "r."+ x + "." + z + ".png")
    }
  }))
  .catch(err => console.log(err))
};

module.exports = {
  updateRegionImages: updateRegionImages
}
