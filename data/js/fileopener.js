/* Copyright (c) 2012-present The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* undef: true, unused: false */
/* global define, Mousetrap, Handlebars  */
define((require, exports, module) => {
  'use strict';

  console.log('Loading fileopener...');

  const TSCORE = require('tscore');
  const moment = require('moment');

  let _openedFilePath;
  let _openedFileProperties;
  const _isFileOpened = false;
  const _isFileChanged = false;
  let _tsEditor;
  let generatedTagButtons;
  const filePropertiesOpened = false;

  $.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit"><i class="fa fa-check fa-lg"></i></button><button type="button" class="btn btn-sm editable-cancel"><i class="fa fa-times fa-lg"></i></button>';
  $.fn.editableform.template = '' +
    '<form class="form-inline editableform flexMaxWidth">' +
    '  <div class="control-group flexLayout flexMaxWidth">' +
    '    <div class="flexLayout flexMaxWidth">' +
    '      <div class="editable-input flexMaxWidth"></div>' +
    '      <div class="editable-buttons"></div>' +
    '    </div>' +
    '    <div class="editable-error-block"></div>' +
    '  </div> ' +
    '</form>';
  let exitFullscreenButton = '<button id="exitFullScreen" class="btn btn-link" title="Exit fullscreen mode (ESC)"><span class="fa fa-remove"></span></button>';
  const _isEditMode = false; // If a file is currently opened for editing, this var should be true

  window.onbeforeunload = () => {
    if (_isFileChanged) {
      return "Confirm close";
    }
  };
  
  class TSFileOpener {

    static _isFullScreen() {
      // ToDo method eventually unreliable on linux/ubuntu
      return (window.innerHeight === screen.height);
    }

    static _leaveFullScreen() {
      $("#exitFullScreen").hide();
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      return false;
    }

    static _switchToFullScreen() {
      if ($('#exitFullScreen').length < 1) {
        $('#viewer').append(exitFullscreenButton);
      }
      $("#exitFullScreen").show().on("click", leaveFullScreen);

      let docElm = $('#viewer')[0];
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      }
    }

     static initUI() {
      $('#editDocument').on("click", () => {
        editFile(_openedFilePath);
      });

      $('#saveDocument').on("click", saveFile);

      $('#closeFile').on("click", () => {
        closeFile(false);
      });

      $('#closeOpenedFile').on("click", () => {
        closeFile(false);
      });

      $('#nextFileButton').on("click", () => {
        TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(_openedFilePath));
      });

      $('#prevFileButton').on("click", () => {
        TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getPrevFile(_openedFilePath));
      });

      $('#reloadFile').on("click", () => {
        TSCORE.FileOpener.openFile(_openedFilePath);
      });

      $('#sendFile').on("click", () => {
        TSCORE.IO.sendFile(_openedFilePath);
      });

      $('#toggleFullWidthButton').on("click", TSCORE.toggleFullWidth);

      $('#fullscreenFile').on("click", switchToFullScreen);

      //$('#openProperties').on("click", showFilePropertiesDialog);

      $('#deleteFile').on("click", () => {
        TSCORE.showFileDeleteDialog(_openedFilePath);
      });

      $('#openNatively').on("click", () => {
        TSCORE.IO.openFile(_openedFilePath);
      });

      $('#openDirectory').on("click", () => {
        TSCORE.IO.openDirectory(TSCORE.TagUtils.extractParentDirectoryPath(_openedFilePath));
      });

      $('#renameFile').on("click", () => {
        if (_isFileChanged) {
          TSCORE.showAlertDialog($.i18n.t('ns.dialogs:operationNotPermittedInEditModeAlert'));
        } else {
          TSCORE.showFileRenameDialog(_openedFilePath);
        }
      });

      $('#duplicateFile').on("click", () => {
        let currentDateTime = TSCORE.TagUtils.formatDateTime4Tag(new Date(), true);
        let fileNameWithOutExt = TSCORE.TagUtils.extractFileNameWithoutExt(_openedFilePath);
        let fileExt = TSCORE.TagUtils.extractFileExtension(_openedFilePath);
        let newFilePath = TSCORE.currentPath + TSCORE.dirSeparator + fileNameWithOutExt + '_' + currentDateTime + '.' + fileExt;
        TSCORE.IO.copyFilePromise(_openedFilePath, newFilePath).then((success) => {
          TSCORE.hideWaitingDialog();
          TSCORE.showSuccessDialog("File copied successfully.");
          let targetDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(newFilePath);
          if (targetDirectory === TSCORE.currentPath) {
            TSCORE.navigateToDirectory(TSCORE.currentPath);
            TSCORE.PerspectiveManager.clearSelectedFiles();
          }
        }, (err) => {
          TSCORE.hideWaitingDialog();
          TSCORE.showAlertDialog(err);
        });
      });

      $('#openFileInNewWindow').on("click", () => {
        if (isWeb) {
          if (location.port === '') {
            window.open(location.protocol + '//' + location.hostname + _openedFilePath);
          } else {
            window.open(location.protocol + '//' + location.hostname + ':' + location.port + _openedFilePath);
          }
        } else {
          window.open('file:///' + _openedFilePath);
        }
      });

      $('#tagFile').on("click", tagFile);

      $('#editFileDescriptionButton').on('click', editFileDescription);

      $('#cancelEditFileDescriptionButton').on('click', cancelEditFileDescription);

      $('#saveFileDescriptionButton').on('click', saveFileDescription);

      $('#addTagsFileDescriptionButton').on('click', tagFile);

      $('#toggleFileProperitesButton').on('click', toggleFileProperties);
    }

    // TODO handle the case: changing to next file/close while in edit mode
    static _editFileDescription() {
      if (TSCORE.PRO) {
        if (TSCORE.Config.getEnableMetaData() && TSCORE.Config.getWriteMetaToSidecarFile()) {
          $('#fileDescriptionProperty').show();
          $('#fileDescriptionProperty').css("height", "200px");
          $('#fileDescriptionProperty').focus();
          $('#fileDescriptionPropertyRendered').hide();
          $('#editFileDescriptionButton').hide();
          $('#cancelEditFileDescriptionButton').show();
          $('#saveFileDescriptionButton').show();
        } else {
          TSCORE.UI.showAlertDialog("In order to add or edit a description, you have to enable the use of hidden folders in the settings.");
        }
      } else {
        TSCORE.UI.showAlertDialog("Editing the file description is possible with the TagSpaces PRO");
      }
    }

    static _cancelEditFileDescription() {
      $('#fileDescriptionProperty').hide();
      $('#fileDescriptionPropertyRendered').show();
      $('#editFileDescriptionButton').show();
      $('#cancelEditFileDescriptionButton').hide();
      $('#saveFileDescriptionButton').hide();
    }

    static _saveFileDescription() {
      let fileDescription = $('#fileDescriptionProperty').val();
      TSCORE.Utils.setMarkDownContent($('#fileDescriptionPropertyRendered'), fileDescription);
      $('#fileDescriptionPropertyRendered').css("height", "200px");
      TSCORE.Meta.addMetaDescriptionToFile(_openedFileProperties.path, fileDescription);
      this._cancelEditFileDescription();
    }

    static setFileProperties(fileProperties) {
      this._cancelEditFileDescription();
      _openedFileProperties = fileProperties;
      $('#fileNameProperty').val(TSCORE.TagUtils.extractFileName(_openedFileProperties.path));
      $('#filePathProperty').val(TSCORE.TagUtils.extractContainingDirectoryPath(_openedFileProperties.path));
      $('#fileSizeProperty').val(TSCORE.TagUtils.formatFileSize(_openedFileProperties.size, true) + " / " + _openedFileProperties.size + " " + $.i18n.t('ns.common:sizeInBytes'));

      $('#timeFileChangedFromNow').text(moment(_openedFileProperties.lmdt).fromNow());
      $('#fileLMDTProperty').val(moment(_openedFileProperties.lmdt).format('YYYY-MM-DD hh:mm:ss'));
      //$('#fileLMDTProperty').val(new Date(_openedFileProperties.lmdt).toISOString().substring(0, 19).split('T').join(' '));
      $('#fileLMDTProperty').attr("title", new Date(_openedFileProperties.lmdt));

      let fileDescription = TSCORE.Meta.getDescriptionFromMetaFile(_openedFileProperties.path);

      $('#fileDescriptionPropertyRendered').empty();
      $('#fileDescriptionProperty').val("");
      if (fileDescription && fileDescription.length > 0) {
        $('#fileDescriptionPropertyRendered').css("height", "200px");
        $('#fileDescriptionPropertyRendered').css("padding", "4px");
        TSCORE.Utils.setMarkDownContent($('#fileDescriptionPropertyRendered'), fileDescription);
        $('#fileDescriptionProperty').val(fileDescription);
      } else {
        $('#fileDescriptionPropertyRendered').css("height", "0");
        $('#fileDescriptionPropertyRendered').css("padding", "0");
      }
    }

    static _tagFile() {
      if (_isFileChanged) {
        TSCORE.showAlertDialog($.i18n.t('ns.dialogs:operationNotPermittedInEditModeAlert'));
      } else {
        TSCORE.PerspectiveManager.clearSelectedFiles();
        TSCORE.selectedFiles.push(_openedFilePath);
        TSCORE.showAddTagsDialog();
      }
    }

    static _toggleFileProperties() {
      if (filePropertiesOpened) {
        $('#filePropertiesArea').hide();
        $('#toggleFileProperitesButton').removeClass('buttonToggled');
      } else {
        $('#filePropertiesArea').show();
        $('#toggleFileProperitesButton').addClass('buttonToggled');
      }
      filePropertiesOpened = !filePropertiesOpened;
    }

    static isFileChanged() {
      return _isFileChanged;
    }

    static setFileChanged(value) {
      let $fileExt = $('#fileExtText');
      let $fileTitle = $('#fileTitle');
      if (value && !_isFileChanged) {
        $fileExt.text($fileExt.text() + '*');
        $fileTitle.editable('disable');
        $('#fileTags').find('button').prop('disabled', true);
      }
      if (!value) {
        $fileExt.text(TSCORE.TagUtils.extractFileExtension(_openedFilePath));
        $fileTitle.editable('enable');
        $('#fileTags').find('button').prop('disabled', false);
      }
      _isFileChanged = value;
    }

    static isFileEdited() {
      return _isEditMode;
    }

    static isFileOpened() {
      return _isFileOpened;
    }

    static getOpenedFilePath() {
      return _openedFilePath;
    }

    static closeFile(forceClose) {
      if (isFileChanged()) {
        if (forceClose) {
          this._cleanViewer();
        } else {
          TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:closingEditedFileTitleConfirm'), $.i18n.t('ns.dialogs:closingEditedFileContentConfirm'), () => {
            this._cleanViewer();
          });
        }
      } else {
        this._cleanViewer();
      }
    }

    static _cleanViewer() {
      this._leaveFullScreen();
      TSCORE.closeFileViewer();
      //TSCORE.PerspectiveManager.clearSelectedFiles();

      if (isWeb) {
        window.history.pushState("", "TagSpaces", location.pathname);
      }

      // Cleaning the viewer/editor
      $('#viewer').find('*').off().unbind();
      $('#viewer').find('iframe').remove();
      $('#viewer').find('*').children().remove();
      _isFileOpened = false;
      _isEditMode = false;
      _isFileChanged = false;
      _openedFilePath = undefined;

      Mousetrap.unbind(TSCORE.Config.getEditDocumentKeyBinding());
      Mousetrap.unbind(TSCORE.Config.getSaveDocumentKeyBinding());
      Mousetrap.unbind(TSCORE.Config.getCloseViewerKeyBinding());
      Mousetrap.unbind(TSCORE.Config.getReloadDocumentKeyBinding());
      Mousetrap.unbind(TSCORE.Config.getDeleteDocumentKeyBinding());
      Mousetrap.unbind(TSCORE.Config.getPropertiesDocumentKeyBinding());
      //Mousetrap.unbind(TSCORE.Config.getPrevDocumentKeyBinding());
      //Mousetrap.unbind(TSCORE.Config.getNextDocumentKeyBinding());
    }

    static openFileOnStartup(filePath) {
      console.log("Opening file from command line: " + filePath);

      // quick and dirty solution, should use flag later
      TSCORE.toggleFullWidth();
      TSCORE.FileOpener.openFile(filePath);
    }

    static openFile(filePath, editMode) {
      console.log('Opening file: ' + filePath);
      if (filePath === undefined) {
        return false;
      }
      if (TSCORE.FileOpener.isFileChanged()) {
        // TODO use closeFile method
        if (confirm($.i18n.t('ns.dialogs:closingEditedFileConfirm'))) {
          $('#saveDocument').hide();
          _isEditMode = false;
        } else {
          return false;
        }
      }

      $('#fileTags').find('button').prop('disabled', false);

      _isEditMode = false;
      _isFileChanged = false;
      _openedFilePath = filePath;
      //$("#selectedFilePath").val(_openedFilePath.replace("\\\\","\\"));
      if (isWeb) {
        let startupParameter = "";
        if (filePath) {
          startupParameter = "?open=" + encodeURIComponent(filePath);
          window.history.pushState("", "TagSpaces", location.pathname + startupParameter);
        }
        console.log("Link to file for sharing: " + window.location.href);
        let downloadLink;
        if (location.port === '') {
          downloadLink = location.protocol + '//' + location.hostname + _openedFilePath;
        } else {
          downloadLink = location.protocol + '//' + location.hostname + ':' + location.port + _openedFilePath;
        }
        $('#downloadFile').attr('href', downloadLink).attr('download', TSCORE.TagUtils.extractFileName(_openedFilePath));
      } else {
        $('#downloadFile').attr('href', 'file:///' + _openedFilePath).attr('download', TSCORE.TagUtils.extractFileName(_openedFilePath));
      }
      let fileExt = TSCORE.TagUtils.extractFileExtension(filePath);
      // Getting the viewer for the file extension/type
      let viewerExt = TSCORE.Config.getFileTypeViewer(fileExt);
      let editorExt = TSCORE.Config.getFileTypeEditor(fileExt);
      console.log('File Viewer: ' + viewerExt + ' File Editor: ' + editorExt);

      // Handling colored file extensions in the file opener
      if (TSCORE.Config.getColoredFileExtensionsEnabled()) {
        $('#fileMenuButton').addClass('fileExtColor');
      } else {
        $('#fileMenuButton').removeClass('fileExtColor');
      }

      // Handling the edit button depending on existense of an editor
      if (editorExt === false || editorExt === 'false' || editorExt === '') {
        $('#editDocument').hide();
      } else {
        $('#editDocument').show();
      }
      let $viewer = $('#viewer');
      $viewer.find('*').off();
      $viewer.find('*').unbind();
      $viewer.find('*').remove();
      TSCORE.IO.checkAccessFileURLAllowed ? TSCORE.IO.checkAccessFileURLAllowed() : true;
      TSCORE.IO.getPropertiesPromise(filePath).then((fileProperties) => {
        if (fileProperties) {
          TSCORE.FileOpener.setFileProperties(fileProperties);
        }
      }).catch((error) => {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Error getting properties for " + filePath);
      });

      this._updateUI();
      if (editMode) {
        // opening file for editing
        editFile(filePath);
      } else {
        // opening file for viewing
        if (!viewerExt) {
          require([TSCORE.Config.getExtensionPath() + '/viewerText/extension.js'], (viewer) => {
            _tsEditor = viewer;
            _tsEditor.init(filePath, 'viewer', true);
          });
        } else {
          require([TSCORE.Config.getExtensionPath() + '/' + viewerExt + '/extension.js'], (viewer) => {
            _tsEditor = viewer;
            _tsEditor.init(filePath, 'viewer', true);
          });
        }
      }

      // Clearing file selection on file load and adding the current file path to the selection
      TSCORE.PerspectiveManager.clearSelectedFiles();
      TSCORE.PerspectiveManager.selectFile(TSCORE.FileOpener.getOpenedFilePath());

      TSCORE.selectedFiles.push(filePath);
      _isFileOpened = true;
      TSCORE.openFileViewer();
      // Handling the keybindings
      Mousetrap.unbind(TSCORE.Config.getSaveDocumentKeyBinding());
      Mousetrap.bindGlobal(TSCORE.Config.getSaveDocumentKeyBinding(), () => {
        this._saveFile();
        return false;
      });
      Mousetrap.unbind(TSCORE.Config.getCloseViewerKeyBinding());
      Mousetrap.bindGlobal(TSCORE.Config.getCloseViewerKeyBinding(), () => {
        this._closeFile();
        return false;
      });
      Mousetrap.unbind(TSCORE.Config.getReloadDocumentKeyBinding());
      Mousetrap.bindGlobal(TSCORE.Config.getReloadDocumentKeyBinding(), () => {
        this._reloadFile();
        return false;
      });
      Mousetrap.unbind(TSCORE.Config.getPropertiesDocumentKeyBinding());
      Mousetrap.bindGlobal(TSCORE.Config.getPropertiesDocumentKeyBinding(), () => {
        this._toggleFileProperties();
        return false;
      });
      Mousetrap.unbind(TSCORE.Config.getEditDocumentKeyBinding());
      Mousetrap.bindGlobal(TSCORE.Config.getEditDocumentKeyBinding(), () => {
        editFile(_openedFilePath);
        return false;
      });

      Mousetrap.bindGlobal("esc", leaveFullScreen);
    }

    static updateEditorContent(fileContent) {
      console.log('Updating editor');
      _tsEditor.setContent(fileContent);
    }

    // Should return false if no editor found
    static _getFileEditor(filePath) {
      let fileExt = TSCORE.TagUtils.extractFileExtension(filePath);
      // Getting the editor for the file extension/type
      let editorExt = TSCORE.Config.getFileTypeEditor(fileExt);
      console.log('File Editor: ' + editorExt);
      return editorExt;
    }

    static _editFile(filePath) {
      console.log('Editing file: ' + filePath);
      $('#viewer').children().remove();
      let editorExt = getFileEditor(filePath);
      try {
        require([TSCORE.Config.getExtensionPath() + '/' + editorExt + '/extension.js'], (editr) => {
          _tsEditor = editr;
          _tsEditor.init(filePath, 'viewer', false);
        });
        _isEditMode = true;
        $('#editDocument').hide();
        $('#saveDocument').show();
      } catch (ex) {
        console.error('Loading editing extension failed: ' + ex);
      }
    }

    static _reloadFile() {
      console.log('Reloading current file.');
      TSCORE.FileOpener.openFile(_openedFilePath);
    }

    static saveFile() {
      console.log('Save current file: ' + _openedFilePath);
      let content = _tsEditor.getContent();
      TSCORE.IO.saveTextFilePromise(_openedFilePath, content, true).then((isNewFile) => {
        //TSCORE.PerspectiveManager.refreshFileListContainer();
        TSCORE.showSuccessDialog("File saved successfully."); // TODO translate
        TSCORE.FileOpener.setFileChanged(false);
      }, (error) => {
        TSCORE.hideLoadingAnimation();
        console.error("Save to file " + _openedFilePath + " failed " + error);
        TSCORE.showAlertDialog("Saving " + _openedFilePath + " failed.");
      });
    }

    static _updateUI() {
      $('#saveDocument').hide();
      // Initialize File Extension
      let fileExtension = TSCORE.TagUtils.extractFileExtension(_openedFilePath);
      $('#fileExtText').text(fileExtension);
      $('#fileMenuButton').attr('data-ext', fileExtension);
      // Initialize File Title Editor
      let title = TSCORE.TagUtils.extractTitle(_openedFilePath);
      let $fileTitle = $('#fileTitle');
      $fileTitle.editable('destroy');
      $fileTitle.text(title);
      $fileTitle.attr("title", title);
      if (!isChrome) {
        $fileTitle.editable({
          type: 'text',
          title: 'Enter Title',
          mode: 'inline',
          clear: false,
          success: function(response, newValue) {
            $('#closeOpenedFile').show();
            TSCORE.TagUtils.changeTitle(_openedFilePath, newValue);
          },
          error: (response, newValue) => {
            $('#closeOpenedFile').show();
          }
        });
        $fileTitle.on('shown', (e, editable) => {
          $('#closeOpenedFile').hide();
        });
        $fileTitle.on('hidden', (e, editable) => {
          $('#closeOpenedFile').show();
        });
      }
      // Generate tag & ext buttons
      // Appending tag buttons
      let tags = TSCORE.TagUtils.extractTags(_openedFilePath);
      let tagString = '';
      tags.forEach((value, index) => {
        if (index === 0) {
          tagString = value;
        } else {
          tagString = tagString + ',' + value;
        }
      });
      generatedTagButtons = TSCORE.generateTagButtons(tagString, _openedFilePath);
      let $fileTags = $('#fileTags');
      $fileTags.children().remove();
      $fileTags.append(generatedTagButtons);
      $('#tagsContainer').droppable({
        greedy: 'true',
        accept: '.tagButton',
        hoverClass: 'activeRow',
        drop: (event, ui) => {
          if (_isFileChanged) {
            TSCORE.showAlertDialog($.i18n.t('ns.dialogs:operationNotPermittedInEditModeAlert'));
          } else {
            console.log('Tagging file: ' + TSCORE.selectedTag + ' to ' + _openedFilePath);
            TSCORE.TagUtils.addTag([_openedFilePath], [TSCORE.selectedTag]); //$(ui.helper).remove();
          }
        }
      });
      // Init Tag Context Menus
      $fileTags.on('contextmenu click', '.tagButton', () => {
        TSCORE.hideAllDropDownMenus();
        TSCORE.openTagMenu(this, $(this).attr('tag'), $(this).attr('filepath'));
        TSCORE.showContextMenu('#tagMenu', $(this));
        return false;
      });
    }

    // TODO refactor or remove, move add / remove tags dialog
    /*
    function initTagSuggestionMenu(filePath) {
      var tags = TSCORE.TagUtils.extractTags(filePath);
      var suggTags = TSCORE.TagUtils.suggestTags(filePath);
      var tsMenu = $('#tagSuggestionsMenu');
      tsMenu.children().remove();
      tsMenu.attr('style', 'overflow-y: auto; max-height: 500px;');
      tsMenu.append($('<li>', {
        class: 'dropdown-header',
        text: $.i18n.t('ns.common:tagOperations')
      }).append('<button type="button" class="close">\xD7</button>'));
      tsMenu.append($('<li>').append($('<a>', {
        title: $.i18n.t('ns.common:addRemoveTagsTooltip'),
        filepath: filePath,
        text: ' ' + $.i18n.t('ns.common:addRemoveTags')
      }).prepend('<i class=\'fa fa-tag\'></i>').click(function() {
        TSCORE.PerspectiveManager.clearSelectedFiles();
        TSCORE.selectedFiles.push(filePath);
        TSCORE.showAddTagsDialog();
      })));
      tsMenu.append($('<li>', {
        class: 'dropdown-header',
        text: $.i18n.t('ns.common:suggestedTags')
      }));
      // Add tag suggestion based on the last modified date
      if (_openedFileProperties !== undefined && _openedFileProperties.lmdt !== undefined) {
        suggTags.push(TSCORE.TagUtils.formatDateTime4Tag(_openedFileProperties.lmdt));
        suggTags.push(TSCORE.TagUtils.formatDateTime4Tag(_openedFileProperties.lmdt, true));
      }
      // Adding context menu entries for creating tags according to the suggested tags
      for (var i = 0; i < suggTags.length; i++) {
        // Ignoring the tags already assigned to a file
        if (tags.indexOf(suggTags[i]) < 0) {
          tsMenu.append($('<li>', {
            name: suggTags[i]
          }).append($('<a>', {}).append($('<button>', {
            title: $.i18n.t('ns.common:tagWithTooltip', {
              tagName: suggTags[i]
            }),
            'class': 'btn btn-sm btn-success tagButton',
            filepath: filePath,
            tagname: suggTags[i],
            text: suggTags[i]
          }).click(function() {
            var tagName = $(this).attr('tagname');
            var filePath = $(this).attr('filepath');
            console.log('Tag suggestion clicked: ' + tagName);
            TSCORE.TagUtils.writeTagsToFile(filePath, [tagName]);
            return false;
          })))); // jshint ignore:line
        }
      }
    } */
  }

  // Public API definition
  exports.TSFileOpener = TSFileOpener;
});
