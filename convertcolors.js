

// Read the file and print its contents.
var fs = require('fs');
var mcData = require('minecraft-data')("1.12");


fs.readFile("./web/js/map-colors.csv", 'utf8', function(err, data) {
  if (err) throw err;
  console.log(data);
  var lines = data.split("\n");
  for(var i in lines){
    var line = lines[i];
    var elements = line.split(",");
    for(var j in elements){
      var el = elements[j].trim();
      //console.log(el);
      var found = false;
      for(var b in mcData.blocks){
        var block = mcData.blocks[b];
        if(block.displayName == el){
          process.stdout.write(block.id + ", ")
          found=true;
          break;
        }
      }
      if(!found){
        process.stdout.write(el + ", ")
      }
    }
    process.stdout.write("\n")
  }
});
