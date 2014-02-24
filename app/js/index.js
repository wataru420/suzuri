/**
 * Created by jweber on 01.10.13.
 */
var marked = require('marked');
var gui = require("nw.gui");
var fs = require("fs");
var path = require("path");

var cm;
var vm;

onload = function() {

  cm = CodeMirror.fromTextArea(
      document.getElementById("markdown_code"),
      {
        mode: "markdown",
        lineNumbers: true
      });

    cm.on("change", function(cm, change) {
      cm.save();
      vm.selectedFile.data = ko.observable($("#markdown_code").val());
      $("#markdown_content").html(marked($("#markdown_code").val()));
    });


  initContextMenu();
  newFile();

  $("#saveFile").change(function(evt) {
    onChosenFileToSave($(this).val());
  });
  $("#openFile").change(function(evt) {
    onChosenFileToOpen($(this).val());
  });


  vm = new AppViewModel();
  ko.applyBindings(vm);

};

function FileViewModel(name,path,data) {
  var self = this;
  self.path = ko.observable(path);
  self.name = ko.observable(name);
  self.data = ko.observable(data);
}

function AppViewModel() {
  var self = this;

  self.selectedFile = ko.observable(null);
  self.filelist = ko.observableArray([]);

  self.addFile = function() {
      handleOpenButton()
  };

  self.removeFile = function() {
      self.filelist.remove(this);
  }

  self.selectFile = function() {
      self.selectedFile = this;
      cm.setValue(self.selectedFile.data());
  }
}


function newFile() {
  fileEntry = null;
  hasWriteAccess = false;
}

function setFile(theFileEntry, isWritable) {
  fileEntry = theFileEntry;
  hasWriteAccess = isWritable;
}

function readFileIntoEditor(theFileEntry) {
  fs.readFile(theFileEntry, function (err, data) {
    if (err) {
      console.log("Read failed: " + err);
    }

    var name = path.basename(theFileEntry);
    var fvm = new FileViewModel(name,theFileEntry,String(data));

    vm.filelist.push(fvm);
    vm.selectedFile = fvm;
    cm.setValue(String(data));
console.log(theFileEntry);
console.log(vm.selectedFile.name());
  });
}

function writeEditorToFile(theFileEntry) {
  var str = cm.getValue();
  fs.writeFile(theFileEntry, cm.getValue(), function (err) {
    if (err) {
      console.log("Write failed: " + err);
      return;
    }

    console.log("Write completed.");
  });
}

var onChosenFileToOpen = function(theFileEntry) {
  setFile(theFileEntry, false);
  readFileIntoEditor(theFileEntry);
};

var onChosenFileToSave = function(theFileEntry) {
  setFile(theFileEntry, true);
  writeEditorToFile(theFileEntry);
};

function handleNewButton() {
  if (true) {
    newFile();
    cm.setValue("");
  } else {
    var x = window.screenX + 10;
    var y = window.screenY + 10;
    window.open('main.html', '_blank', 'screenX=' + x + ',screenY=' + y);
  }
}

function handleOpenButton() {
  $("#openFile").trigger("click");
}

function handleSaveButton() {
  if (fileEntry && hasWriteAccess) {
    writeEditorToFile(fileEntry);
  } else {
    $("#saveFile").trigger("click");
  }
}


function initContextMenu() {
var menubar = new gui.Menu({ type: 'menubar' });

var subMenu = new gui.Menu();

var subMenuItem1 = new gui.MenuItem({
	label: 'NewFile',
    click: function() {
      handleNewButton();
    }
});
var subMenuItem2 = new gui.MenuItem({
	label: 'Open',
    click: function() {
      handleOpenButton()
    }
});
var subMenuItem3 = new gui.MenuItem({
	label: 'Save',
    click: function() {
      handleSaveButton()
    }
});
subMenu.append(subMenuItem1);
subMenu.append(subMenuItem2);
subMenu.append(subMenuItem3);

menubar.append(new gui.MenuItem({
	label: 'File',
	submenu: subMenu
}));

gui.Window.get().menu = menubar;
}
