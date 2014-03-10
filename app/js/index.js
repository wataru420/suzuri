/*jslint browser: true */
/*global $:false,ko:false,CodeMirror:false */

'use strict';

/**
 * Created by jweber on 01.10.13.
 */
var marked = require('marked');
var gui = require('nw.gui');
var fs = require('fs');
var path = require('path');

var cm;
var vm;

function FileViewModel(name, path, data) {
    var self = this;
    self.path = ko.observable(path);
    self.name = ko.observable(name);
    self.data = ko.observable(data);
}

function writeEditorToFile(theFileEntry) {
    fs.writeFile(theFileEntry, cm.getValue(), function (err) {
        if (err) {
            console.log('Write failed: ' + err);
            return;
        }
    });
    console.log('Write file complete:' + theFileEntry);

    var name = path.basename(theFileEntry);
    vm.selectedFile.name(name);
    vm.selectedFile.path(theFileEntry);
    $('#file_path').text(theFileEntry);
}

function handleNewButton() {
    if (true) {
        var fvm = new FileViewModel('NewFile', null, '');
        vm.filelist.push(fvm);
        vm.selectedFile = fvm;
        cm.setValue('');
        $('#file_path').text('');
    } else {
        var x = window.screenX + 10;
        var y = window.screenY + 10;
        window.open('main.html', '_blank', 'screenX=' + x + ',screenY=' + y);
    }
}

function handleOpenButton() {
    $('#openFile').remove();
    $('#fileTags').append($('<input style="display:none;" id="openFile" type="file" />').click());
}

function handleSaveButton() {
    if (vm.selectedFile.path()) {
        writeEditorToFile(vm.selectedFile.path());
    } else {
        $('#saveFile').remove();
        $('#fileTags').append($('<input style="display:none;" id="saveFile" type="file" nwsaveas />').click());
    }
}

function AppViewModel() {
    var self = this;

    self.selectedFile = ko.observable(null);
    self.filelist = ko.observableArray([]);

    self.newFile = function () {
        handleNewButton();
    };

    self.addFile = function () {
        handleOpenButton();
    };

    self.saveFile = function () {
        handleSaveButton();
    };

    self.removeFile = function () {
        self.filelist.remove(this);
        if (self.filelist().length > 0) {
            self.selectedFile = self.filelist()[0];
            cm.setValue(self.selectedFile.data());
            $('#file_path').text(self.selectedFile.path());
        } else {
            handleNewButton();
        }
    };

    self.selectFile = function () {
        self.selectedFile = this;
        cm.setValue(self.selectedFile.data());
        $('#file_path').text(self.selectedFile.path());
    };
}


function readFileIntoEditor(theFileEntry) {
    fs.readFile(theFileEntry, function (err, data) {
        if (err) {
            console.log('Read failed: ' + err);
            return;
        }

        var name = path.basename(theFileEntry);
        var fvm = new FileViewModel(name, theFileEntry, String(data));

        vm.filelist.push(fvm);
        vm.selectedFile = fvm;
        cm.setValue(String(data));
    });
    $('#file_path').text(theFileEntry);
}

var onChosenFileToOpen = function (theFileEntry) {
    readFileIntoEditor(theFileEntry);
};

var onChosenFileToSave = function (theFileEntry) {
    writeEditorToFile(theFileEntry);
};

function initContextMenu() {
    var menubar = new gui.Menu({ type: 'menubar' });

    var subMenu = new gui.Menu();

    var subMenuItem1 = new gui.MenuItem({
        label: 'NewFile',
        click: function () {
            handleNewButton();
        }
    });
    var subMenuItem2 = new gui.MenuItem({
        label: 'Open',
        click: function () {
            handleOpenButton();
        }
    });
    var subMenuItem3 = new gui.MenuItem({
        label: 'Save',
        click: function () {
            handleSaveButton();
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

$(function () {
    cm = CodeMirror.fromTextArea(
       document.getElementById('markdown_code'),
       {
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'lesser-dark'
    });

    cm.on('change', function (cm) {
        cm.save();
        vm.selectedFile.data = ko.observable($('#markdown_code').val());
        $('#markdown_content').html(marked($('#markdown_code').val()));
        $('#word_count').text('Words:' + $('#markdown_content').text().length);
    });

    initContextMenu();

    $('#saveFile').change(function () {
        onChosenFileToSave($(this).val());
    });
    $('body').on('change', '#openFile', function () {
        onChosenFileToOpen($(this).val());
    });

    vm = new AppViewModel();
    ko.applyBindings(vm);

    handleNewButton();
});
