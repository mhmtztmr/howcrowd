/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var myApp = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  isCordovaApp: document.URL.indexOf('http://') === -1 && document.URL.indexOf(
    'https://') === -1,
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    myApp.receivedEvent('deviceready');
    //
    // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
    //   onFileSystemSuccess, fail);
    //
    //
    // function onFileSystemSuccess(fileSystem) {
    //   //alert(cordova.file.dataDirectory);
    //   alert(cordova.file.applicationDirectory);
    //   fileSystem.root.getFile("readme.txt", {
    //       create: true,
    //       exclusive: false
    //     },
    //     function() {
    //       alert("file created");
    //     }, fail);
    // }

    // function gotFileEntry(fileEntry) {
    //   fileObject = fileEntry;
    //   $('#saveFile_btn').on('click', function() {
    //     saveFileContent();
    //   });
    // }
    //
    // function saveFileContent() {
    //   fileObject.createWriter(gotFileWriter, fail);
    // }
    //
    // function gotFileWriter(writer) {
    //   var myText = document.getElementById('my_text').value;
    //   writer.write(myText);
    //   writer.onwriteend = function(evt) {
    //     $('#message').html(
    //       '<p>File contents have been written.<br /><strong>File path:</strong> ' +
    //       fileObject.fullPath + '</p>');
    //     var reader = new FileReader();
    //     reader.readAsText(fileObject);
    //     reader.onload = function(evt) {
    //       $('#contents').html('<strong>File contents:</strong> <br />' +
    //         evt.target.result);
    //     };
    //   };
    // }
    //

    function fail(error) {
      alert(error.code);
    }
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    // var parentElement = document.getElementById(id);
    // var listeningElement = parentElement.querySelector('.listening');
    // var receivedElement = parentElement.querySelector('.received');
    //
    // listeningElement.setAttribute('style', 'display:none;');
    // receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  }
};
