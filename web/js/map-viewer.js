
var minecraftData = [];
var mapColors = [];

var mvcanvas = document.getElementById("mapviewer");
var ctx = mvcanvas.getContext('2d');

//ctx.putImageData(imgData, 0,0);

var preload = function(){
  var funcs = [
    fetch("./js/minecraft-data/blocks.json")
    .then((resp) => resp.json())
    .then(function(data) {
      minecraftData = data;
    })
    .catch(error => console.error('Error:', error)),
    fetch("./js/map-color-index.json")
    .then((resp) => resp.json())
    .then(function(data) {
      mapColors = data;
    })
    .catch(error => console.error('Error:', error))
  ];
  return Promise.all(funcs)
}


var PIXEL_SIZE = 1;
var createChunkImage = function(chunk){
  var imgData = ctx.createImageData(16*PIXEL_SIZE, 16*PIXEL_SIZE);

  for(var block_z=0;block_z<16;block_z++){
    for(var block_x=0;block_x<16;block_x++){
      var color = mapColors[chunk[block_x][block_z]];
      for(var pix_z=PIXEL_SIZE*block_z; pix_z<PIXEL_SIZE*(block_z+1);pix_z++){
        for(var pix_x=PIXEL_SIZE*block_x; pix_x<PIXEL_SIZE*(block_x+1);pix_x++){
          var base_pixel = (pix_z*16*PIXEL_SIZE + pix_x)*4;
          imgData.data[base_pixel] = color[0];
          imgData.data[base_pixel+1] = color[1];
          imgData.data[base_pixel+2] = color[2];
          imgData.data[base_pixel+3] = color[3];
        }
      }
    }
  }
  return imgData;
}

var fetchChunk = function(x, z){
  return fetch("/chunks/" + x + "/"+ z)
  .then((resp) => resp.json())
}

preload().then(()=>{
  console.log("Ready");
}).catch((err) => {
  console.error(err);
})
.then(function(){
  for(var i=0;i<32;i++){
    for(var j=0;j<32;j++){
      (function(i, j){
        console.log("Fetching chunk " + i + " " + j)
        fetchChunk(i, j).then(function(chunk){
          var img = createChunkImage(chunk);
          ctx.putImageData(img, i*16*PIXEL_SIZE, j*16*PIXEL_SIZE);
        })
      })(i, j);
    }
  }
})
