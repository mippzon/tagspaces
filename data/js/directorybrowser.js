/* Copyright (c) 2012-present The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
define((require, exports, module) => {
  'use strict';
  console.log('Loading directorybrowser.js ...');
  const TSCORE = require('tscore');

  class TSDirectoryBrowser {

    static initUI() {
      $('#gotoParentDirButton').click(() => {
        let parent = TSCORE.TagUtils.extractParentDirectoryPath($('#directoryPath').val());
        TSCORE.IOUtils.listSubDirectories(parent);
      });
      if (isWin) {
        $('#driveSelectorForm').show();
        let driveSelector = $('#driveSelector');
        driveSelector.change(() => {
          $('#subdirectoriesArea').empty();
          $('#directoryPath').val(driveSelector.val());
          TSCORE.IOUtils.listSubDirectories(driveSelector.val());
        });
      }
      $('#selectDirectoryButton').click(() => {
        let dirPath = $('#directoryPath').val();
        if (!TSCORE.TagUtils.stringEndsWith(dirPath, TSCORE.dirSeparator)) {
          dirPath = dirPath + TSCORE.dirSeparator;
        }
        let dirName = TSCORE.TagUtils.extractContainingDirectoryName(dirPath);
        $('#connectionName').val(dirName);
        $('#folderLocation').val(dirPath);
        $('#folderLocation2').val(dirPath);
        $('#folderLocation').blur();
        $('#folderLocation2').blur();
        $('#moveCopyDirectoryPath').val(dirPath);

        $('#driveSelector').prop('selectedIndex', 0);
      });
    }

    static reInitUI(dirPath) {
      $('#directoryPath').val(dirPath);
      let subfolders = $('#subdirectoriesArea').empty();
      if (TSCORE.subfoldersDirBrowser === undefined || TSCORE.subfoldersDirBrowser.length <= 0) {
        subfolders.append('<div class=\'alert alert-warning\'>No subfolders found</div>');
      } else {
        for (let j = 0; j < TSCORE.subfoldersDirBrowser.length; j++) {
          if (TSCORE.Config.getShowUnixHiddenEntries() || !TSCORE.Config.getShowUnixHiddenEntries() && TSCORE.subfoldersDirBrowser[j].name.indexOf('.') !== 0) {
            subfolders.append($('<button>', {
              'class': 'btn btn-sm dirButton',
              'path': TSCORE.subfoldersDirBrowser[j].path,
              'title': TSCORE.subfoldersDirBrowser[j].path,
              'style': 'margin: 1px;',
              'text': ' ' + TSCORE.subfoldersDirBrowser[j].name
            }).prepend('<i class=\'fa fa-folder-o\'></i>').click(() => {
              TSCORE.IOUtils.listSubDirectories($(this).attr('path'));
            })); // jshint ignore:line
          }
        }
      }
      $('#directoryBrowserDialog').on('hidden.bs.modal', () => {
        TSCORE.hideLoadingAnimation();
      });
      $('#directoryBrowserDialog').modal({
        backdrop: 'static',
        show: true
      });
      $('#directoryBrowserDialog').draggable({
        handle: ".modal-header"
      });
    }
  }
  
  // Public Methods
  exports.TSDirectoryBrowser = TSDirectoryBrowser;
});
