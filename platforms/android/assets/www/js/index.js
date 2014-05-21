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
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
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
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
		
		
		// Note: The file system has been prefixed as of Google Chrome 12:
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024, app.onFileSystemSuccess, app.failGeneral);

    },
	
	failGeneral: function(error) {
                console.error("Fieldays Innovation Controller failure: code='" + error.code + "', message=" + error.message);
    },

	onFileSystemSuccess: function(fileSystem) {
        console.log("File-system name = " + fileSystem.name);
        console.log("File-system root name = " + fileSystem.root.fullPath);
		
		fileSystem.root.getFile("readme.txt", {create: true, exclusive: false}, app.gotFileEntry, app.failGeneral);
		
		//var output_filename = fileSystem.root.fullPath + "tipple-store/fdi-control.json";
		//app.writeFile(output_filename, "afkj fadkjafdjakdjfds");
		
		// create directory reader
		//var directoryReader = fileSystem.root.createReader()
		// get a list of all entries in the directory
		//directoryReader.readEntries(app.recDirectoryDump,app.failGeneral);

    },

    gotFileEntry: function(fileEntry) {
        fileEntry.createWriter(app.gotFileWriter, app.failGeneral);
    },
	
	gotFileWriter: function(writer) {
		writer.onwrite = function(evt) {
			console.log("write success");
		};
		writer.write("some sample text\n");
		//writer.write("some MORE sample text\n");
	},
		
	recDirectoryDump: function(entries) {
		//console.log(entries);
		
		var file_output_str = "";
		var i;
		for (i = 0; i < entries.length; i++) {
			if (entries[i].isFile == true) {
				file_output_str += "file = " + entries[i].fullPath + "\n";
			}
			if (entries[i].isDirectory == true) {
				file_output_str += "directory = " + entries[i].fullPath + "\n";
				var directoryReader = entries[i].createReader();
				directoryReader.readEntries(app.recDirectoryDump, app.failGeneral);
			}
		}
		
		console.log(file_output_str);
	},

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
