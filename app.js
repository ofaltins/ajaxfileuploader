var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
require('shelljs/global');

// initialize - remove files in /uploads and /public/processedimage
function rmDir(dirPath) {
  dirPath = path.join(__dirname, dirPath);
  try { var files = fs.readdirSync(dirPath); }
  catch(e) { console.log(e); return; }
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
    }
}
rmDir('/uploads');
rmDir('/public/processedimage');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we do not want to allow the user to upload multiple files in a single request
  form.multiples = false;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(_field, _file) {
    fs.rename(_file.path, path.join(form.uploadDir, _file.name));
    console.log('received ' + _file.name)

    // do something with file
    doSomethingWithFile(_file);
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

function doSomethingWithFile(_file) {
  // this is a shell function
  echo('shell has access to ' + _file.name);

  // this is a js function to move the file from /uploads to /public/processedimage
  // where it will be accessible for the webserver
  // let's wait 3 seconds before moving the file to simulate processing
  setTimeout(function() {
    fs.rename(path.join(__dirname, '/uploads', _file.name), path.join(__dirname, '/public/processedimage/image.jpg'));
  }, 3000);
}

var server = app.listen(3000, function(){
  console.log('Server listening on localhost:3000');
});
