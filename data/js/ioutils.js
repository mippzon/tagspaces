/* Copyright (c) 2012-present The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define  */

/**
 * Description
 * @class IOAPI
 */
define((require, exports, module) => {
  'use strict';
  console.log('Loading ioutils.js ...');

  const TSCORE = require('tscore');
  const TSPOSTIO = require('tspostioapi');
  const stopDirectoryWalking = false;

  class TSIoUtils {

    static walkDirectory(path, options, fileCallback, dirCallback) {
      return TSCORE.IO.listDirectoryPromise(path, true).then((entries) => {
        return Promise.all(entries.map((entry) => {
          if (!options) {
            options = {};
            options.recursive = false;
          }
          if (entry.isFile) {
            if (fileCallback) {
              return fileCallback(entry);
            } else {
              return entry;
            }
          } else {
            if (dirCallback) {
              return dirCallback(entry);
            }
            if (options.recursive) { //  && !stopDirectoryWalking &&
              return walkDirectory(entry.path, options, fileCallback, dirCallback);
            } else {
              return entry;
            }
          }
        }));
      }).catch((err) => {
        console.warn("Error walking directory " + err);
        return null;
      });
    }

    static listSubDirectories(dirPath) {
      console.log("Listing sub directories: " + dirPath);
      TSCORE.showLoadingAnimation();
      TSCORE.IO.listDirectoryPromise(dirPath).then((entries) => {
        let anotatedDirList = [];
        let firstEntry = 0;
        // skiping the first entry pointing to the parent directory
        if (isChrome) {
          firstEntry = 1;
        }
        for (let i = firstEntry; i < entries.length; i++) {
          if (!entries[i].isFile) {
            anotatedDirList.push({
              "name": entries[i].name,
              "path": entries[i].path
            });
          }
        }
        TSPOSTIO.listSubDirectories(anotatedDirList, dirPath);
      }).catch((error) => {
        TSPOSTIO.errorOpeningPath(dirPath);
        TSCORE.hideLoadingAnimation();
        console.error("Error listDirectory " + dirPath + " error: " + error);
      });
    }

    static createDirectoryIndex(dirPath) {
      TSCORE.showWaitingDialog($.i18n.t("ns.common:waitDialogDiectoryIndexing"));

      let directoryIndex = [];
      TSCORE.IOUtils.walkDirectory(dirPath, {recursive: true}, (fileEntry) => {
        directoryIndex.push(fileEntry);
      }).then((entries) => {
        TSCORE.hideWaitingDialog();
        TSCORE.PerspectiveManager.updateFileBrowserData(directoryIndex);
      }).catch((err) => {
        console.warn("Error creating index: " + err);
        TSCORE.hideWaitingDialog();
      });
    }

    static _createDirectoryTree(dirPath) {
      TSCORE.showWaitingDialog($.i18n.t("ns.common:waitDialogDiectoryIndexing"));
      // TODO user promiseAll
      let directoryTree = {};
      /*TSCORE.IOUtils.walkDirectory(dirPath, {recursive: true}, function(fileEntry) {
        directoryIndex.push(fileEntry);
      }).then(function(entries) {
        TSCORE.hideWaitingDialog();
        TSCORE.PerspectiveManager.updateFileBrowserData(directoryIndex);
      }).catch(function(err) {
        console.warn("Error creating index: " + err);
        TSCORE.hideWaitingDialog();
      });*/
    }

    static deleteFiles(filePathList) {
      TSCORE.showLoadingAnimation();
      let fileDeletionPromises = [];
      filePathList.forEach((filePath) => {
        fileDeletionPromises.push(TSCORE.IO.deleteFilePromise(filePath));
      });

      Promise.all(fileDeletionPromises).then((fList) => {
        fList.forEach((filePath) => {
          TSCORE.Meta.deleteMetaData(filePath);
          TSCORE.PerspectiveManager.removeFileUI(filePath);
          if (filePath === TSCORE.FileOpener.getOpenedFilePath()) {
            TSCORE.FileOpener.closeFile(true);
          }
        });
        TSCORE.hideLoadingAnimation();
        TSCORE.showSuccessDialog("Files deleted successfully.");
      }, (error) => {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Deleting file " + filePath + " failed.");
        console.error("Deleting file " + filePath + " failed " + error);
      });
    } 
  }

  exports.TSIoUtils = TSIoUtils;
  //TODO exports.createTree = createTree;
  //TODO exports.copyFiles = copyFiles;
  //TODO exports.moveFiles = moveFiles;
});
