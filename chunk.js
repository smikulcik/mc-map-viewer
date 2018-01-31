
// use a dirty cache
var dirty = require('dirty');
var dirtycache = dirty('worlddata.db').on('load', function() {console.log("dirty cache is loaded")});

var Anvil=require("prismarine-provider-anvil").Anvil("1.8");
var Vec3 = require("vec3");

var anvil = new Anvil(".");

var cache = function(req, res, next){
  var value = dirtycache.get(req.path);
  if (value !== undefined){
    res.send(value);
    return;
  }
  next()
}

function getChunkBlocks(chunk_x, chunk_z){
  var blocks = [];
  return new Promise(function(resolve, reject){
    var d=anvil.load(chunk_x, chunk_z);
    d.then(function(data){
      if (data == null){
        console.log("NULL" + chunk_x + " "+ chunk_z)
        resolve(null);
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
      console.log("Got chunk " + chunk_x, chunk_z)
      resolve(blocks);
    }).catch(function(err){
      console.log("anvil load error")
      console.log(err)
      console.log(err.stack);
      reject(err)
    });
  })
}

function getRegionChunks(chunk_x, chunk_z){
  return new Promise(function(resolve, reject){
    var chunks = [];

    var rx=Math.floor(chunk_x/32)
    var rz=Math.floor(chunk_z/32)

    var promises = [];
    for(var x=rx;x<32;x++){
      chunks.push([])
      for(var z=rz;z<32;z++){
        (function(x, z){
          promises.push(getChunkBlocks(x, z))
        })(x, z)
      }
    }
    Promise.all(promises).then((results) => {
      for(var r in results){
        chunks[Math.floor(r/32)][r%32] = results[r]
      }
      resolve(chunks)
    }).catch((err) => {
      reject(err)
    });
  })
}

var addRoutes = function(app){
  app.get('/chunks/:chunk_x/:chunk_z', cache, function (req, res) {
    var x = parseInt(req.params.chunk_x);
    var z = parseInt(req.params.chunk_z);
    console.log("GET /chunks/" + req.params.chunk_x + "/" + req.params.chunk_z )

    getChunkBlocks(x, z)
    .then((result) => {
      res.send(result);
      dirtycache.set(req.path, result);
      console.log("Updating cache for " + req.path);
    }).catch((err) => {
      console.log("GET error")
      console.log(err)
      console.log(err.stack)
    })
  })

  app.get('/regions/:chunk_x/:chunk_z', cache, function (req, res) {
    var x = parseInt(req.params.chunk_x);
    var z = parseInt(req.params.chunk_z);
    console.log("GET /regions/" + req.params.chunk_x + "/" + req.params.chunk_z )

    getRegionChunks(x, z)
    .then((result) => {
      res.send(result);
      dirtycache.set(req.path, result);
      console.log("Updating cache for " + req.path);
    }).catch((err) => {
      console.log("GET error")
      console.log(err)
      console.log(err.stack)
    })
  })
};

module.exports = {
  addRoutes: addRoutes
}
