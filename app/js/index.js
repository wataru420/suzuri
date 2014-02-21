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


function AppViewModel() {
    var self = this;

    self.filelist = ko.observableArray([]);

    self.addFile = function() {
        handleOpenButton()
    };

    self.removeFile = function() {
        self.filelist.remove(this);
    }

    self.selectFile = function() {
        cm.setValue(this.content);
    }
}

vm = new AppViewModel();
ko.applyBindings(vm);

};

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

    cm.setValue(String(data));
    vm.filelist.push({
        name: path.basename(theFileEntry),
        path: theFileEntry,
        content: String(data)
    });

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

gui.Window.get().menu = menubar;}


