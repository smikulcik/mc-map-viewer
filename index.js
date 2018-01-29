var Anvil=require("prismarine-provider-anvil").Anvil("1.8");
var Vec3 = require("vec3");
var mcData=require("minecraft-data")("1.8.8");
var sprintf=require("sprintf-js").sprintf
var colors=require("colors")

var anvil = new Anvil(".");

var express = require('express')

// use a dirty cache
var dirty = require('dirty');
var dirtycache = dirty('worlddata.db').on('load', function() {console.log("dirty cache is loaded")});

var app = express()

var cache = function(req, res, next){
  var value = dirtycache.get(req.path);
  if (value !== undefined){
    res.send(value);
    return;
  }
  next()
}

// var mcColors = {
//   "water": colors.bgCyan,
//     "waterlily": colors.blue,
//   "grass": (x) => colors.greenBG(colors.grey(x)),
//   "tallgrass": (x) => colors.greenBG(colors.black(x)),
//   "vine": colors.green,
//   "leaves": (x) => colors.blackBG(colors.green(x)),
// }
// var defaultColor = colors.blackBG
//
// var doDisplayChunk = function(x, z){
//   var deferred = Promise.defer();
//   // console.log("loading x="+x+" z="+z)
//   var d=anvil.load(x, z);
//   d.then(function(data){
//     // console.log("x="+x+" z="+z)
//     displayTopBlock(data)
//     deferred.resolve();
//   })
//   .catch(function(err){
//     console.log(err.stack);
//     deferred.reject();
//   });
//   return deferred.promise;
// }
//
// function displayTopBlock(data){
//     if(data === null){
//       console.log("null")
//       return
//     }
//     for(var x=0; x<16;x++){
//       for(var z=0; z<16;z++){
//         for(var y=255;y>=0;y--){
//           var dataType = data.getBlock(new Vec3(x, y, z)).type;
//           if(dataType!==0){
//             var typeName =  mcData.blocks[dataType].name
//             process.stdout.write(getColor(typeName)(sprintf("%2s", typeName.substring(0,2))))
//             //process.stdout.write(""+y+" ");
//             break;
//           }
//         }
//       }
//       process.stdout.write("\n")
//     }
// }
//
// function displayAllBlocks(d){
//     for(var y=0; y<256;y++){
//       console.log("y="+y)
//         for(var x=0; x<16;x++){
//             for(var z=0; z<16;z++){
//               var dataType = data.getBlock(new Vec3(x, y, z)).type;
//               process.stdout.write(
//                 mcData.blocks[dataType].name + " ")
//             }
//             process.stdout.write("\n")
//         }
//         process.stdout.write("\n")
//     }
// }
//
// function getColor(typeName){
//   if (mcColors.hasOwnProperty(typeName)){
//     return mcColors[typeName]
//   }
//   return defaultColor
// }
//
// function showAll(){
//   var chain = Promise.resolve()
//   for(var x=0;x<32;x++){
//     for(var z=0;z<32;z++){
//       (function(x, z){
//         chain=chain.then(() => doDisplayChunk(x, z))
//       })(x, z)
//     }
//   }
// }
//
//
// var doDisplayChunk = function(x, z){
//   var deferred = Promise.defer();
//   // console.log("loading x="+x+" z="+z)
//   var d=anvil.load(x, z);
//   d.then(function(data){
//     // console.log("x="+x+" z="+z)
//     displayTopBlock(data)
//     deferred.resolve();
//   })
//   .catch(function(err){
//     console.log(err.stack);
//     deferred.reject();
//   });
//   return deferred.promise;
// }

function getChunkBlocks(chunk_x, chunk_z){
  var blocks = [];
  return new Promise(function(resolve, reject){
    var d=anvil.load(chunk_x, chunk_z);
    d.then(function(data){
      if (data == null){
        resolve(null);
        return
      }
      for(var x=0; x<16;x++){
        blocks.push([]);
        for(var z=0; z<16;z++){
          for(var y=255;y>=0;y--){
            var block = data.getBlock(new Vec3(x, y, z));
            if(block.type !== 0){
              blocks[x][z] = block.type;
              break;
            }
          }
        }
      }
      resolve(blocks);
    }).catch(function(err){
      console.log("anvil load error")
      console.log(err)
      console.log(err.stack);
      reject(err)
    });
  })
}

// function regionToJSON(){
//   var chunks = [];
//
//   var promises = [];
//   for(var x=0;x<4;x++){
//     chunks.push([])
//     for(var z=0;z<4;z++){
//       (function(x, z){
//         promises.push(getChunkBlocks(x, z))
//       })(x, z)
//     }
//   }
//   console.log(chunks);
//   Promise.all(promises).then((results) => {
//     for(var r in results){
//       chunks[Math.floor(r/16)][r%16] = results[r]
//     }
//     console.log(JSON.stringify(chunks))
//   }).catch((err) => {
//     console.log(err.stack);
//   });
// }

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

app.use(express.static('web'))

function logErrors (err, req, res, next) {
  console.log("LOGGING ERRORS")
  console.error(err.stack)
  next(err)
}

function errorHandler (err, req, res, next) {
  res.status(500)
  res.json({ error: err })
}

app.use(logErrors)
app.use(errorHandler)
app.listen(3000, () => console.log('Example app listening on port 3000!'))
