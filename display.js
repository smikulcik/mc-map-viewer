
var sprintf=require("sprintf-js").sprintf
var mcData=require("minecraft-data")("1.8.8");
var colors=require("colors")


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
