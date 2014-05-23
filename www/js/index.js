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
	    this.viewControl = { "scanMode": "QR", "checkAnswerMode": "Auto" };
		
		this.viewControlFilename = "tipple-store/fdi-control.json";
		this.fileSystem = null;
		
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
	
		// For explanation of $.proxy() see:
		//    http://code.tutsplus.com/tutorials/quick-tip-learning-jquery-14s-proxy--net-9629
		// By using $.proxy() here we ensure onDeviceReady is called with *our* object context
		// (allowing us to use 'this') not the object context of the DOM.  Without using $.proxy()
		// we would have to use 'app' instead of 'this'.
		
		if (window.cordova) {
			document.addEventListener('deviceready', $.proxy(this.onDeviceReady,this), false);
		}
		else {
			console.log("Using 'load' event for testing with a desktop browser");
			window.addEventListener('load', $.proxy(this.onDeviceReady,this), false);
		}
    },
	//
    // deviceready Event Handler
    onDeviceReady: function() {
		var self = this;
		console.log('Received Event: device-ready');
		
		$('#scanModeForm input:radio').click(function() { var $radioInput = $(this); self.changeScanMode($radioInput.val())} );
		$('#checkAnswerModeForm input:radio').click(function() { var $radioInput = $(this); self.changeCheckAnswerMode($radioInput.val())} );		
			
		// Note: The file system has been prefixed as of Google Chrome 12:
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024, 
								 $.proxy(this.onFileSystemSuccess, this), 
								 $.proxy(this.failGeneral, this));

    },
	
	failGeneral: function(error) {
                console.error("Fieldays Innovation Controller failure: code='" + error.code + "', message=" + error.message);
    },

	onFileSystemSuccess: function(fileSystem) {
		// Record this so we can use it again in later functions
		this.fileSystem = fileSystem;
		
        console.log("File-system name = " + fileSystem.name);
        console.log("File-system root name = " + fileSystem.root.fullPath);
	
		// The line initiates the following sequence:
		// 1. Look to see if a JSON file storing the view controlling settings exists
		// 2. if it does, read it in, parse it with $.parseJson() and have it override 'this.viewControl' 
		
		fileSystem.root.getFile(this.viewControlFilename, null, 
								$.proxy(this.gotControlFileEntry, this), 
								$.proxy(this.noControlFileEntry, this) );
    },

	noControlFileEntry: function(error) {
		console.log("No previously saved control data -- using default settings");
		// no control file yet. Create the control file and initialise it with the default settings
		this.saveViewControl();
		this.setRadioButtons();
	},
	
	gotControlFileEntry: function(fileEntry) {
		var self = this;
		fileEntry.file($.proxy(this.readControlFile,this), $.proxy(this.failGeneral,this));
	},
	
	setRadioButtons: function() {
		// tick the default radio button - http://stackoverflow.com/questions/5665915/how-to-check-a-radio-button-with-jquery
		$("#scanMode" + this.viewControl.scanMode).attr('checked', 'checked');
		$("#checkAnswerMode" + this.viewControl.checkAnswerMode).attr('checked', 'checked');
	},
	
    readControlFile: function(file){
		var self = this;
		var reader = new FileReader();
        reader.onloadend = function(evt) {
			
			// don't test for "== null", use either the test "obj === null" or the test "!obj"
			// http://saladwithsteve.com/2008/02/javascript-undefined-vs-null.html
			if(!evt.target.result) {
				console.log("Control file empty, using default values");				
			} else {				
				self.viewControl = jQuery.parseJSON(evt.target.result);
				
			}
			
		    self.setRadioButtons();
  
			if (!reader.result) {
				self.saveViewControl();
			}
		};
		
        reader.readAsText(file);			
    },

	saveViewControl: function() {
		this.fileSystem.root.getFile(this.viewControlFilename, {create: true, exclusive: false}, 
									$.proxy(this.controlFileEntryWritable,this), 
									$.proxy(this.failGeneral,this));
	},
	
	
    controlFileEntryWritable: function(fileEntry) {
        fileEntry.createWriter(
			$.proxy(this.writeControlFile,this), 
			$.proxy(this.failGeneral,this) );
    },
	
	writeControlFile: function(writer) {
		var self = this;
		writer.onwrite = function(evt) {
			console.log("app.writeControlFile(): successfully saved " + self.viewControlFilename);
			console.log("app.writeControlFile(): Have written out " + JSON.stringify(self.viewControl));
		};
		
		writer.write(JSON.stringify(self.viewControl) + "\n");
	},
		
	recDirectoryDump: function(entries) {
		
		var file_output_str = "";
		var i;
		for (i = 0; i < entries.length; i++) {
			if (entries[i].isFile == true) {
				file_output_str += "file = " + entries[i].fullPath + ", ";
			}
			if (entries[i].isDirectory == true) {
				file_output_str += "directory = " + entries[i].fullPath + ": ";
				var directoryReader = entries[i].createReader();
				directoryReader.readEntries($.proxy(this.recDirectoryDump,this), $.proxy(this.failGeneral,this));
			}
		}
		
		console.log(file_output_str);
	},
	
	changeScanMode: function(mode) {
		this.viewControl.scanMode = mode;
		this.saveViewControl();
	},

	changeCheckAnswerMode: function(mode) {
		this.viewControl.checkAnswerMode = mode;
		this.saveViewControl();
	}
		
};
