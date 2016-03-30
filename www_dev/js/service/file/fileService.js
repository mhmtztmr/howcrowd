var fileService = function(filesystem) {

  var dataFile = '.crwd.txt';

  function writeData(data, onSuccess, onFailure) {
    filesystem.requestFileSystem(
      function(fs) {
        console.log('request file system done');
        fs.root.getFile(dataFile, {
          create: true,
          exclusive: false
        }, function(fileEntry) {
          console.log('file entry got');
          fileEntry.createWriter(function(writer) {
            console.log('file writer got');
            writer.onwriteend = function(evt) {
              console.log('data written');
              onSuccess();
            };
            writer.write(data);
          }, function(err) {
            console.log('file writer failed: ' + err.code);
            onFailure();
          });
        }, function(err) {
          console.log('file entry failed: ' + err.code);
          onFailure();
        });
      },
      function() {
        console.log('request file system failed');
        onFailure();
      }
    );
  }

  function readData(onSuccess, onFailure) {
    filesystem.requestFileSystem(
      function(fs) {
        console.log('request file system done');
        fs.root.getFile(dataFile, {
          create: true,
          exclusive: false
        }, function(fileEntry) {
          console.log('file entry got');
          fileEntry.file(function(file) {
            console.log('file reader got');
            var reader = new FileReader();
            reader.onloadend = function(evt) {
              console.log('data read');
              onSuccess(evt.target.result);
            }
            reader.readAsText(file);
          }, function(err) {
            console.log('file reader failed: ' + err.code);
            onFailure();
          });
        }, function(err) {
          console.log('file entry failed: ' + err.code);
          onFailure();
        });
      },
      function() {
        console.log('request file system failed');
        onFailure();
      }
    );
  }

  return {
    writeData: writeData,
    readData: readData
  };
};

angular.module('file', ['filesystem'])
  .factory('fileService', ['filesystem', fileService]);
