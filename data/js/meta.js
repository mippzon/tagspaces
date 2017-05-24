/* Copyright (c) 2012-present The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define((require, exports, module) => {
  'use strict';

  const TSCORE = require("tscore");

  const maxTmbSize = 300;
  const supportedImageExtensions = ["jpg", "jpeg", "png", "gif"];
  
  class TSMeta {

    static _makeMetaPathByName(name) {
      return TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.metaFolder + name;
    }

    static getDirectoryMetaInformation() {
      let metaFolderPath = TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.metaFolder;
      console.log("getDirectoryMetaInformation: " + metaFolderPath);
      return TSCORE.IO.listDirectoryPromise(metaFolderPath, true);
    }

    static findMetaFilebyPath(filePath, metaFileExtension) {
      let metaFilePath;
      let metaFolderPath = TSCORE.TagUtils.extractParentDirectoryPath(filePath) + TSCORE.dirSeparator + TSCORE.metaFolder;
      filePath = metaFolderPath + TSCORE.dirSeparator + TSCORE.TagUtils.extractFileName(filePath) + metaFileExtension;
      TSCORE.metaFileList.every((element) => {
        if (filePath.indexOf(element.path) >= 0) {
          metaFilePath = element.path;
          return false;
        }
        return true;
      });
      return metaFilePath;
    }

    static findMetaObjectFromFileList(filePath) {
      let metaObj = null;
      TSCORE.fileList.every((element) => {
        if (element.path === filePath) {
          metaObj = element.meta;
          return false;
        }
        return true;
      });
      return metaObj;
    }

    static saveMetaData(filePath, metaData) {
      let metaFilePath = findMetaFilebyPath(filePath, TSCORE.metaFileExt);
      let currentVersion = TSCORE.Config.DefaultSettings.appVersion + "." + TSCORE.Config.DefaultSettings.appBuild;
      if (!metaFilePath) {
        let name = TSCORE.Utils.baseName(filePath) + TSCORE.metaFileExt;
        let parentFolder = TSCORE.TagUtils.extractParentDirectoryPath(filePath);
        metaFilePath = parentFolder + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + name;
        let entry = {
          "name": name,
          "isFile": true,
          "path": metaFilePath,
        };
        TSCORE.metaFileList.push(entry);
        metaData.appVersionCreated = currentVersion;
      }

      metaData.appName = TSCORE.Config.DefaultSettings.appName;
      metaData.appVersionUpdated = currentVersion;
      metaData.lastUpdated = new Date();

      let content = JSON.stringify(metaData);
      TSCORE.IO.saveTextFilePromise(metaFilePath, content, true);
    }

    static updateMetaData(sourceFilePath, targetFilePath) {
      if (!targetFilePath || !sourceFilePath) {
        return false;
      }

      if (TSCORE.IO.stopWatchingDirectories) {
        TSCORE.IO.stopWatchingDirectories();
      }

      let fileInMetaFileList = false;
      let sourceFileName = TSCORE.Utils.baseName(sourceFilePath);
      let pathSource = TSCORE.Utils.dirName(sourceFilePath);
      let pathTarget = TSCORE.Utils.dirName(targetFilePath);
      let metaIndexForRemove = [];
      TSCORE.metaFileList.forEach((metaElement, index) => {
        if (metaElement.name.indexOf(sourceFileName) === 0) {
          fileInMetaFileList = true;

          let targetMetaName = TSCORE.Utils.baseName(targetFilePath) + "." + TSCORE.TagUtils.extractFileExtension(metaElement.name);
          let targetMetaFolderPath = pathTarget + TSCORE.dirSeparator + TSCORE.metaFolder;
          let targetMetaFilePath = targetMetaFolderPath + TSCORE.dirSeparator + targetMetaName;
          let sourceMetaFilePath = pathSource + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + metaElement.name;

          if (pathSource === pathTarget) {
            metaElement.name = targetMetaName;
            metaElement.path = targetMetaFilePath;
          } else {
            metaIndexForRemove.push(index);
          }

          createMetaFolderPromise(pathTarget).then(() => {
            TSCORE.IO.renameFilePromise(sourceMetaFilePath, targetMetaFilePath).then(() => {
              console.log('Meta file moved/renamed successfully to ' + targetMetaFilePath);
            });
          });
        }
      });

      // file is probably from a search list
      if (!fileInMetaFileList) {
        let sourceMetaPathTemplate = pathSource + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.Utils.baseName(sourceFilePath);
        let targetMetaPathTemplate = pathTarget + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.Utils.baseName(targetFilePath);
        TSCORE.IO.renameFilePromise(sourceMetaPathTemplate + TSCORE.metaFileExt, targetMetaPathTemplate + TSCORE.metaFileExt);
        TSCORE.IO.renameFilePromise(sourceMetaPathTemplate + TSCORE.thumbFileExt, targetMetaPathTemplate + TSCORE.thumbFileExt);
        TSCORE.IO.renameFilePromise(sourceMetaPathTemplate + TSCORE.contentFileExt, targetMetaPathTemplate + TSCORE.contentFileExt);
      }

      // Cleaning up meteFileList
      if (metaIndexForRemove.length > 0) {
        TSCORE.metaFileList.forEach((metaElement, index) => {
          if (index in metaIndexForRemove) {
            TSCORE.metaFileList.splice(index, 1);
          }
        });
      }
    }

    // Deletes the meta data, the thumbs and the content file
    static deleteMetaData(sourceFileName) {
      if (!sourceFileName) {
        return false;
      }

      let name = TSCORE.Utils.baseName(sourceFileName);
      let fileInMetaFileList = false;
      TSCORE.metaFileList.forEach((element, index) => {
        if (element.name.indexOf(name) >= 0) {
          fileInMetaFileList = true;
          // Deleting meta.json, thumb.png and content.txt files
          TSCORE.IO.deleteFilePromise(element.path).then(() => {
            TSCORE.metaFileList.splice(index, 1);
          });
        }
      });
      if (!fileInMetaFileList) { // file is probably from a search list
        let sourcePathTemplate = TSCORE.Utils.dirName(sourceFileName) + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.Utils.baseName(sourceFileName);
        TSCORE.IO.deleteFilePromise(sourcePathTemplate + TSCORE.metaFileExt);
        TSCORE.IO.deleteFilePromise(sourcePathTemplate + TSCORE.thumbFileExt);
        TSCORE.IO.deleteFilePromise(sourcePathTemplate + TSCORE.contentFileExt);
      }
    }

    // Copy only the meta data without the thumbs and extracted text content
    static copyMetaData(sourceFileName, targetFileName) {
      if (!sourceFileName || !targetFileName) {
        return false;
      }

      let pathSource = TSCORE.Utils.dirName(sourceFileName);
      let pathTarget = TSCORE.Utils.dirName(targetFileName);

      if (pathTarget.lastIndexOf(TSCORE.dirSeparator) === 0) {
        pathSource = pathSource + TSCORE.dirSeparator;
      }

      if (pathSource !== pathTarget) {
        let sourceFilePath = pathSource + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.Utils.baseName(sourceFileName) + TSCORE.metaFileExt;
        let targetFilePath = pathTarget + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.Utils.baseName(targetFileName) + TSCORE.metaFileExt;
        createMetaFolderPromise(pathTarget).then(() => {
          TSCORE.IO.copyFilePromise(sourceFilePath, targetFilePath);
        });
      }
    }

    static loadThumbnailPromise(filePath) {
      return new Promise((resolve, reject) => {
        if (TSCORE.PRO && TSCORE.Config.getEnableMetaData() && TSCORE.Config.getUseGenerateThumbnails()) {
          TSCORE.PRO.getThumbnailURLPromise(filePath).then((dataURL) => {
            resolve(dataURL);
          }).catch((err) => {
            console.warn("Thumb generation failed for: " + filePath + " failed with: " + err);
            resolve(filePath);
          });
        } else {
          let thumbFilePath = getThumbFileLocation(filePath);
          if (thumbFilePath && isChrome) {
            thumbFilePath = "file://" + thumbFilePath;
          }
          TSCORE.IO.getPropertiesPromise(thumbFilePath).then((stats) => {
            if (!stats) { // Thumbnails does not exists
              let fileExt = TSCORE.TagUtils.extractFileExtension(filePath);
              if (supportedImageExtensions.indexOf(fileExt) >= 0) {
                if (isChrome) {
                  filePath = "file://" + filePath;
                }
                generateImageThumbnail(filePath).then((dataURL) => {
                  resolve(dataURL);
                }).catch(() => {
                  this._resolve();
                });
              } else {
                this._resolve();
              }
            } else { // Thumbnails exists
              resolve(thumbFilePath);
            }
          });
        }
      });
    }

    static _getThumbFileLocation(filePath) {
      let metaFolder = TSCORE.TagUtils.extractContainingDirectoryPath(filePath) + TSCORE.dirSeparator + TSCORE.metaFolder;
      return metaFolder + TSCORE.dirSeparator + TSCORE.TagUtils.extractFileName(filePath) + TSCORE.thumbFileExt;
    }

    // should be in sync with the function from the PRO version
    static _generateImageThumbnail(fileURL) {
      return new Promise((resolve, reject) => {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        let img = new Image();

        let errorHandler = (err) => {
          console.warn("Error while generating thumbnail for: " + fileURL + " - " + JSON.stringify(err));
          resolve("");
        };

        try {
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            if (img.width >= img.height) {
              canvas.width = maxTmbSize;
              canvas.height = (maxTmbSize * img.height) / img.width;
            } else {
              canvas.height = maxTmbSize;
              canvas.width = (maxTmbSize * img.width) / img.height;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
            img = null;
            canvas = null;
          };
          img.src = fileURL;
        } catch (err) {
          errorHandler(err);
        }
      });
    }

    static loadMetaFileJsonPromise(entry) {
      return new Promise((resolve, reject) => {
        let filePath = entry.path;
        let parentFolder = TSCORE.TagUtils.extractParentDirectoryPath(filePath);
        let metaFileJson = findMetaFilebyPath(filePath, TSCORE.metaFileExt);
        if (metaFileJson) { // file in the current directory
          TSCORE.IO.getFileContentPromise(metaFileJson, "text").then((result) => {
            let metaData = JSON.parse(result);
            entry.meta.metaData = metaData;
            resolve(filePath);
          }).catch((err) => {
            console.warn("Getting meta information failed for: " + filePath);
            resolve(filePath);
          });
        } else if (TSCORE.currentPath !== parentFolder) { // file in search results
          metaFileJson = parentFolder + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.Utils.baseName(filePath) + TSCORE.metaFileExt;
          TSCORE.IO.getFileContentPromise(metaFileJson, "text").then((result) => {
            let metaData = JSON.parse(result);
            entry.meta.metaData = metaData;
            resolve(filePath);
          }).catch((err) => {
            console.warn("Getting meta information failed for: " + filePath);
            resolve(filePath);
          });
        } else {
          console.log("No meta information found for: " + filePath);
          resolve(filePath);
        }
      });
    }

    static _loadMetaFileJsonPromiseOld(entry) {
      return new Promise((resolve, reject) => {
        let filePath = entry.path;
        let metaFileJson = findMetaFilebyPath(filePath, TSCORE.metaFileExt);
        if (metaFileJson) {
          TSCORE.IO.getFileContentPromise(metaFileJson, "text").then((result) => {
            let metaData = JSON.parse(result);
            entry.meta.metaData = metaData;
            resolve(filePath);
          }).catch((err) => {
            console.warn("Getting meta information failed for: " + filePath);
            resolve(filePath);
          });
        } else {
          console.log("No meta information found for: " + filePath);
          resolve(filePath);
        }
      });
    }

    static getTagsFromMetaFile(filePath) {
      let tags = [];
      let metaObj = findMetaObjectFromFileList(filePath);
      if (metaObj && metaObj.metaData && metaObj.metaData.tags) {
        metaObj.metaData.tags.forEach((elem) => {
          tags.push({
            tag: elem.title,
            filepath: filePath,
            style: elem.style
          });
        });
      }
      return tags;
    }

    static getDescriptionFromMetaFile(filePath) {
      let metaObj = findMetaObjectFromFileList(filePath);
      let description;
      if (metaObj && metaObj.metaData && metaObj.metaData.description) {
        description = metaObj.metaData.description;
        return description;
      }
    }

    static addMetaDescriptionToFile(filePath, description) {
      let metaObj = findMetaObjectFromFileList(filePath);
      if (!metaObj) {
        metaObj = {
          thumbnailPath: "",
          metaData: null,
        };
      }

      if (!metaObj.metaData) {
        metaObj.metaData = {
          description: description
        };
      }
      metaObj.metaData.description = description;
      saveMetaData(filePath, metaObj.metaData);
    }

    //meta tag utils
    static addMetaTags(filePath, tags) {
      let metaObj = findMetaObjectFromFileList(filePath);
      if (!metaObj) {
        metaObj = {
          thumbnailPath: "",
          metaData: null,
        };
      }

      if (!metaObj.metaData) {
        metaObj.metaData = {
          tags: [],
          description: ''
        };
      }

      if (!metaObj.metaData.tags) {
        metaObj.metaData.tags = [];
      }

      tags.forEach((element) => {
        let newTag = {
          "title": element,
          "type": "sidecar",
          "style": TSCORE.generateTagStyle(TSCORE.Config.findTag(element))
        };
        let isNewTag = true;
        metaObj.metaData.tags.forEach((oldTag) => {
          if (oldTag.title === element) {
            isNewTag = false;
          }
        });
        if (isNewTag) {
          metaObj.metaData.tags.push(newTag);
        }
      });

      saveMetaData(filePath, metaObj.metaData);
    }

    static renameMetaTag(filePath, oldTag, newTag) {
      let metaObj = findMetaObjectFromFileList(filePath);
      if (metaObj.metaData) {
        metaObj.metaData.tags.forEach((tag, index) => {
          if (tag.title === oldTag) {
            tag.title = newTag;
          }
        });
        saveMetaData(filePath, metaObj.metaData);
      }
    }

    static removeMetaTag(filePath, tagName) {
      let metaObj = findMetaObjectFromFileList(filePath);
      if (metaObj.metaData) {
        metaObj.metaData.tags.forEach((tag, index) => {
          if (tag.title === tagName) {
            metaObj.metaData.tags.splice(index, 1);
          }
        });
        let metaFileJson = findMetaFilebyPath(filePath, TSCORE.metaFileExt);
        if (metaFileJson) {
          let content = JSON.stringify(metaObj.metaData);
          TSCORE.IO.saveTextFilePromise(metaFileJson, content, true);
        }
      }
    }

    static loadFolderMetaDataPromise(path) {
      return new Promise((resolve, reject) => {
        let metadataPath = 'file://' + path + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.metaFolderFile;
        if (isWeb) {
          metadataPath = path + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.metaFolderFile;
        }

        TSCORE.IO.getFileContentPromise(metadataPath, "text").then((content) => {
          console.log('Location Metadata: ' + content);

          // Cleaning up
          let UTF8_BOM = "\ufeff";
          if (content.indexOf(UTF8_BOM) === 0) {
            content = content.substring(1, content.length);
          }
          let metadata = JSON.parse(content);
          resolve(metadata);
        }).catch((err) => {
          if (TSCORE.PRO && TSCORE.PRO.Directory.getFolderMetaTemplate) {
            resolve(TSCORE.PRO.Directory.getFolderMetaTemplate());
          } else {
            reject("loadFolderMetaDataPromise: Error reading " + metadataPath);
          }
        });
      });
    }

    static createMetaFolderPromise(dirPath) {
      return new Promise((resolve, reject) => {
        if (dirPath.lastIndexOf(TSCORE.metaFolder) >= dirPath.length - TSCORE.metaFolder.length) {
          console.log("Can not create meta folder in a meta folder");
          this._reject();
          return;
        }
        let metaDirPath = dirPath + TSCORE.dirSeparator + TSCORE.metaFolder;
        TSCORE.IO.createDirectoryPromise(metaDirPath).then(() => {
          console.log("Metafolder created: " + metaDirPath);
          resolve(metaDirPath);
        }).catch((error) => {
          resolve(metaDirPath);
          //reject("Creating metafolder failed, it was probably already created " + error);
        });
      });
    }
  }

  exports.TSMeta = TSMeta;
});
