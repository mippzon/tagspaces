/* Copyright (c) 2012-present The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define  */
define((require, exports, module) => {
  'use strict';
  console.log('Loading tagutils.js ...');
  const TSCORE = require('tscore');
  let BEGIN_TAG_CONTAINER = '[';
  let END_TAG_CONTAINER = ']';
  
  class TSTagUtils {

    static extractFileName(filePath) {
      return filePath.substring(filePath.lastIndexOf(TSCORE.dirSeparator) + 1, filePath.length);
    }

    static cleanTrailingDirSeparator(dirPath) {
      if (dirPath !== undefined) {
        if (dirPath.lastIndexOf('\\') === dirPath.length - 1) {
          return dirPath.substring(0, dirPath.length - 1);
        } else if (dirPath.lastIndexOf('/') === dirPath.length - 1) {
          return dirPath.substring(0, dirPath.length - 1);
        } else {
          return dirPath;
        }
      } else {
        console.error('Directory Path ' + dirPath + ' undefined');
      }
    }

    static extractFileNameWithoutExt(filePath) {
      let fileName = extractFileName(filePath);
      let indexOfDot = fileName.lastIndexOf('.');
      let lastIndexBeginTagContainer = fileName.lastIndexOf(BEGIN_TAG_CONTAINER);
      let lastIndexEndTagContainer = fileName.lastIndexOf(END_TAG_CONTAINER);
      if (lastIndexBeginTagContainer === 0 && lastIndexEndTagContainer + 1 === fileName.length) {
        // case: "[tag1 tag.2]"
        return '';
      } else if (indexOfDot > 0) {
        // case: regular
        return fileName.substring(0, indexOfDot);
      } else if (indexOfDot === 0) {
        // case ".txt"
        return '';
      } else {
        return fileName;
      }
    }

    static stringEndsWith(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    static extractContainingDirectoryPath(filePath) {
      return filePath.substring(0, filePath.lastIndexOf(TSCORE.dirSeparator));
    }

    static extractParentDirectoryPath(dirPath) {
      if (stringEndsWith(dirPath, TSCORE.dirSeparator)) {
        dirPath = dirPath.substring(0, dirPath.lastIndexOf(TSCORE.dirSeparator));
      }
      return dirPath.substring(0, dirPath.lastIndexOf(TSCORE.dirSeparator));
    }

    static extractDirectoryName(dirPath) {
      if (stringEndsWith(dirPath, TSCORE.dirSeparator)) {
        dirPath = dirPath.substring(0, dirPath.lastIndexOf(TSCORE.dirSeparator));
      }
      return dirPath.substring(dirPath.lastIndexOf(TSCORE.dirSeparator) + 1, dirPath.length);
    }

    static extractContainingDirectoryName(filePath) {
      let tmpStr = filePath.substring(0, filePath.lastIndexOf(TSCORE.dirSeparator));
      return tmpStr.substring(tmpStr.lastIndexOf(TSCORE.dirSeparator) + 1, tmpStr.length);
    }

    static extractFileExtension(filePath) {
      let lastindexDirSeparator = filePath.lastIndexOf(TSCORE.dirSeparator);
      let lastIndexEndTagContainer = filePath.lastIndexOf(END_TAG_CONTAINER);
      let lastindexDot = filePath.lastIndexOf('.');
      if (lastindexDot < 0) {
        return '';
      } else if (lastindexDot < lastindexDirSeparator) {
        // case: "../remote.php/webdav/somefilename"
        return '';
      } else if (lastindexDot < lastIndexEndTagContainer) {
        // case: "[20120125 89.4kg 19.5% 60.5% 39.8% 2.6kg]"
        return '';
      } else {
        return filePath.substring(lastindexDot + 1, filePath.length).toLowerCase().trim();
      }
    }

    static extractTitle(filePath) {
      //console.log('Extracting title from: ' + filePath);
      let fileName = extractFileNameWithoutExt(filePath);
      let beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
      let endTagContainer = fileName.lastIndexOf(END_TAG_CONTAINER);
      /* cases like "", "t", "[" 
          if( fileName.length <= 1) {
          // cases like "asd ] asd ["
          else if (beginTagContainer > endTagContainer) {
          // case: [ not found in the filename
          else if ( beginTagContainer < 0 ) 
          else if ( endTagContainer < 0 ) */
      if (beginTagContainer >= 0 && beginTagContainer < endTagContainer) {
        if (beginTagContainer === 0 && endTagContainer === fileName.trim().length) {
          // case: "[tag1, tag2]"
          return '';
        } else if (endTagContainer === fileName.trim().length) {
          // case: "asd[tag1, tag2]"
          return fileName.slice(0, beginTagContainer);
        } else {
          // case: "title1 [tag1 tag2] title2"
          return fileName.slice(0, beginTagContainer) + fileName.slice(endTagContainer + 1, fileName.length);
        }
      } else {
        return fileName;
      }
    }

    static formatFileSize(sizeInBytes, siSystem) {
      let threshold = siSystem ? 1000 : 1024;
      if (!sizeInBytes) {
        return "";
      }
      if (sizeInBytes < threshold) {
        return sizeInBytes + ' B';
      }
      let units = siSystem ? [
        'kB',
        'MB',
        'GB',
        'TB',
        'PB',
        'EB'
      ] : [
        'KiB',
        'MiB',
        'GiB',
        'TiB',
        'PiB',
        'EiB'
      ];
      let cUnit = -1;
      do {
        sizeInBytes /= threshold;
        ++cUnit;
      } while (sizeInBytes >= threshold);
      return sizeInBytes.toFixed(1) + ' ' + units[cUnit];
    }

    static formatDateTime(date, includeTime) {
      if (date === undefined || date === '') {
        return '';
      }
      let d = new Date(date);
      let cDate = d.getDate();
      cDate = cDate + '';
      if (cDate.length === 1) {
        cDate = '0' + cDate;
      }
      let cMonth = d.getMonth();
      cMonth++;
      cMonth = cMonth + '';
      if (cMonth.length === 1) {
        cMonth = '0' + cMonth;
      }
      let cYear = d.getFullYear();
      let cHour = d.getHours();
      cHour = cHour + '';
      if (cHour.length === 1) {
        cHour = '0' + cHour;
      }
      let cMinute = d.getMinutes();
      cMinute = cMinute + '';
      if (cMinute.length === 1) {
        cMinute = '0' + cMinute;
      }
      let cSecond = d.getSeconds();
      cSecond = cSecond + '';
      if (cSecond.length === 1) {
        cSecond = '0' + cSecond;
      }
      let time = '';
      if (includeTime) {
        time = ' - ' + cHour + ':' + cMinute + ':' + cSecond;
      }
      return cYear + '.' + cMonth + '.' + cDate + time;
    }

    static formatDateTime4Tag(date, includeTime, includeMS) {
      if (date === undefined || date === '') {
        return '';
      }
      let d = new Date(date);
      let cDate = d.getDate();
      cDate = cDate + '';
      if (cDate.length === 1) {
        cDate = '0' + cDate;
      }
      let cMonth = d.getMonth();
      cMonth++;
      cMonth = cMonth + '';
      if (cMonth.length === 1) {
        cMonth = '0' + cMonth;
      }
      let cYear = d.getFullYear();

      let time = '';
      if (includeTime) {
        let cHour = d.getHours();
        cHour = cHour + '';
        if (cHour.length === 1) {
          cHour = '0' + cHour;
        }
        let cMinute = d.getMinutes();
        cMinute = cMinute + '';
        if (cMinute.length === 1) {
          cMinute = '0' + cMinute;
        }
        let cSecond = d.getSeconds();
        cSecond = cSecond + '';
        if (cSecond.length === 1) {
          cSecond = '0' + cSecond;
        }
        time = '~' + cHour + '' + cMinute + '' + cSecond;
      }

      let milliseconds = '';
      if (includeMS) {
        milliseconds = '~' + d.getMilliseconds();
      }
      return cYear + '' + cMonth + '' + cDate + time + milliseconds;
    }

    static convertStringToDate(dateString) {
      if (dateString === undefined || dateString === '') {
        return false;
      }
      if (dateString.length === 8) {
        return new Date(dateString.substring(0, 4) + '-' + dateString.substring(4, 6) + '-' + dateString.substring(6, 8));
      } else {
        return false;
      }
    }

    static extractTags(filePath) {
      //console.log('Extracting tags from: ' + filePath);
      let fileName = extractFileName(filePath);
      // WithoutExt
      let tags = [];
      let beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
      let endTagContainer = fileName.indexOf(END_TAG_CONTAINER);
      if (beginTagContainer < 0 || endTagContainer < 0 || beginTagContainer >= endTagContainer) {
        //console.log('Filename does not contains tags. Aborting extraction.');
        return tags;
      }
      let cleanedTags = [];
      let tagContainer = fileName.slice(beginTagContainer + 1, endTagContainer).trim();
      tags = tagContainer.split(TSCORE.Config.getTagDelimiter());
      for (let i = 0; i < tags.length; i++) {
        // Min tag length set to 1 character
        if (tags[i].trim().length > 0) {
          cleanedTags.push(tags[i]);
        }
      }
      return cleanedTags;
    }

    static suggestTags(filePath) {
      console.log('Suggesting tags for: ' + filePath);
      let fileName = extractFileName(filePath);
      let tags;
      let tagContainer;
      let beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
      if (beginTagContainer < 0) {
        tagContainer = fileName.slice(0, fileName.lastIndexOf('.')).trim();
      } else {
        tagContainer = fileName.slice(0, beginTagContainer).trim();
      }
      // Splitting filename with space, comma, plus, underscore and score delimiters    
      tags = tagContainer.split(/[\s,.+_-]+/);
      let cleanedTags = [];
      // Extracting tags from the name of the containing directory
      let tagsFromDirName = extractContainingDirectoryName(filePath).trim().split(/[\s,+_-]+/);
      for (let i = 0; i < tagsFromDirName.length; i++) {
        if (tagsFromDirName[i].trim().length > 1) {
          cleanedTags.push(tagsFromDirName[i]);
        }
      }
      // Cleaning the tags from filename        
      for (let j = 0; j < tags.length; j++) {
        if (tags[j].trim().length > 1) {
          cleanedTags.push(tags[j]);
        }
      }
      return cleanedTags;
    }

    // Internal
    static _generateFileName(fileName, tags) {
      let tagsString = '';
      let tagDelimiter = TSCORE.Config.getTagDelimiter() || " ";
      let prefixTagContainer = TSCORE.Config.getPrefixTagContainer() || "";

      // Creating the string will all the tags by more that 0 tags
      if (tags && tags.length > 0) {
        tagsString = BEGIN_TAG_CONTAINER;
        for (let i = 0; i < tags.length; i++) {
          if (i === tags.length - 1) {
            tagsString = tagsString + tags[i].trim();
          } else {
            tagsString = tagsString + tags[i].trim() + tagDelimiter;
          }
        }
        tagsString = tagsString.trim() + END_TAG_CONTAINER;
      }
      console.log('The tags string: ' + tagsString);
      let fileExt = extractFileExtension(fileName);
      console.log('Filename: ' + fileName + ' file extenstion: ' + fileExt);
      // Assembling the new filename with the tags    
      let newFileName = '';
      let beginTagContainer = fileName.indexOf(BEGIN_TAG_CONTAINER);
      let endTagContainer = fileName.indexOf(END_TAG_CONTAINER);
      let lastDotPosition = fileName.lastIndexOf('.');
      if (beginTagContainer < 0 || endTagContainer < 0 || beginTagContainer >= endTagContainer) {
        // Filename does not contains tags.        
        if (lastDotPosition < 0) {
          // File does not have an extension
          newFileName = fileName.trim() + tagsString;
        } else {
          // File has an extension
          newFileName = fileName.substring(0, lastDotPosition).trim() + prefixTagContainer + tagsString + '.' + fileExt;
        }
      } else {
        // File does not have an extension
        newFileName = fileName.substring(0, beginTagContainer).trim() + prefixTagContainer + tagsString + fileName.substring(endTagContainer + 1, fileName.length).trim();
      }
      if (newFileName.length < 1) {
        throw 'Generated filename is invalid';
      }
      // Removing double prefix
      newFileName = newFileName.split(prefixTagContainer + "" + prefixTagContainer).join(prefixTagContainer);
      return newFileName;
    }

    static _renameFile(filePath, newFilePath) {
      console.log("tagutils.renameFile " + filePath);
      TSCORE.IO.renameFilePromise(filePath, newFilePath).then((success) => {
        TSCORE.hideWaitingDialog();
        TSCORE.IOUtils.renameFileSuccess(filePath, newFilePath);
      }, (err) => {
        TSCORE.hideWaitingDialog();
        TSCORE.showAlertDialog(err);
      });
    }

    static writeTagsToFile(filePath, tags) {
      console.log('Add the tags for: ' + filePath);

      if (TSCORE.PRO && TSCORE.Config.getWriteMetaToSidecarFile()) {
        TSCORE.Meta.addMetaTags(filePath, tags);
        TSCORE.PerspectiveManager.updateFileUI(filePath, filePath);
      } else {
        let fileName = extractFileName(filePath);
        let containingDirectoryPath = extractContainingDirectoryPath(filePath);
        let extractedTags = extractTags(filePath);
        for (let i = 0; i < tags.length; i++) {
          // check if tag is already in the tag array
          if (extractedTags.indexOf(tags[i].trim()) < 0) {
            // Adding the new tag
            extractedTags.push(tags[i].trim());
          }
        }
        let newFileName = _generateFileName(fileName, extractedTags);
        _renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName);
      }

      this._collectRecentTags(tags);
    }

    static _removeTagsFromFile(filePath, tags) {
      console.log('Remove the tags from: ' + filePath);
      let extractedTags = extractTags(filePath);

      if (TSCORE.PRO && TSCORE.Config.getWriteMetaToSidecarFile()) {
        let tagsInFileName;
        tags.forEach((tag) => {
          if (extractedTags.indexOf(tag) >= 0) {
            tagsInFileName = true;
          } else {
            TSCORE.Meta.removeMetaTag(filePath, tag);
          }
        });
        if(tagsInFileName) {
          TSCORE.UI.showAlertDialog("Some of the tags are part from the file name and cannot be removed, try to rename the file manually.", $.i18n.t("ns.common:warning"));
        }
        TSCORE.PerspectiveManager.updateFileUI(filePath, filePath);
      } else {
        let fileName = extractFileName(filePath);
        let containingDirectoryPath = extractContainingDirectoryPath(filePath);
        for (let i = 0; i < tags.length; i++) {
          if (extractedTags.indexOf(tags[i].trim()) < 0) {
            TSCORE.UI.showAlertDialog("The tag cannot be removed because it is not part of the file name.", $.i18n.t("ns.common:warning"));
          }
          // check if tag is already in the tag array
          let tagLoc = extractedTags.indexOf(tags[i].trim());
          if (tagLoc >= 0) {
            // Remove the new tag
            extractedTags.splice(tagLoc, 1);
          }
        }
        let newFileName = _generateFileName(fileName, extractedTags);
        _renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName);
      }
    }

    static _cleanFileFromTags(filePath) {
      console.log('Cleaning file from tags: ' + filePath);
      let extractedTags = extractTags(filePath);
      if (TSCORE.PRO && TSCORE.Config.getWriteMetaToSidecarFile()) {
        let tags = TSCORE.Meta.getTagsFromMetaFile(filePath);
        tags.forEach((tag) => {
          TSCORE.Meta.removeMetaTag(filePath, tag.tag);
        });
        if(extractedTags.length > 0) {
          TSCORE.UI.showAlertDialog("Some of the tags are part from the file name and cannot be removed, try to rename the file manually.", $.i18n.t("ns.common:warning"));
        }
        TSCORE.PerspectiveManager.updateFileUI(filePath, filePath);
      } else {
        let fileTitle = extractTitle(filePath);
        let fileExt = extractFileExtension(filePath);
        let containingDirectoryPath = extractContainingDirectoryPath(filePath);
        if (fileExt.length > 0) {
          fileExt = '.' + fileExt;
        }
        this._renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + fileTitle + fileExt);
      }
    }

    static cleanFilesFromTags(filePathArray) {
      console.log('Cleaning file from tags');
      for (let i = 0; i < filePathArray.length; i++) {
        this._cleanFileFromTags(filePathArray[i]);
      }
    }

    static addTag(filePathArray, tagArray) {
      console.log('Adding tags to files');
      tagArray.forEach((value, index) => {
        if (value === 'geo-tag') {
          tagArray.splice(index, 1);
          if (TSCORE.PRO) {
            //TSCORE.selectedTag = value;
            //TSCORE.UI.showTagEditDialog();
          } else {
            TSCORE.showAlertDialog($.i18n.t("ns.common:needProVersion"), $.i18n.t("ns.common:geoTaggingNotPossible"));
          }
        }
      });
      if (tagArray.length < 1) {
        return;
      }
      for (let i = 0; i < filePathArray.length; i++) {
        writeTagsToFile(filePathArray[i], tagArray);
      }
    }

    static removeTags(filePathArray, tagArray) {
      console.log('Remove tags from files');
      for (let i = 0; i < filePathArray.length; i++) {
        removeTagsFromFile(filePathArray[i], tagArray);
      }
    }

    // Moves the location of tag in the file name possible directions should be next, prev, last, first
    static moveTagLocation(filePath, tagName, direction) {
      console.log('Moves the location of tag in the file name: ' + filePath);
      let fileName = extractFileName(filePath);
      let containingDirectoryPath = extractContainingDirectoryPath(filePath);
      let extractedTags = extractTags(filePath);
      if (extractedTags.indexOf(tagName) < 0) {
        TSCORE.UI.showAlertDialog("The tag you are trying to move is not part of the file name and that's why it cannot be moved.", $.i18n.t("ns.common:warning"));
        return;
      }
      let tmpTag;
      for (let i = 0; i < extractedTags.length; i++) {
        // check if tag is already in the tag array
        if (extractedTags[i] === tagName) {
          if (direction === 'prev' && i > 0) {
            tmpTag = extractedTags[i - 1];
            extractedTags[i - 1] = extractedTags[i];
            extractedTags[i] = tmpTag;
            break;
          } else if (direction === 'next' && i < extractedTags.length - 1) {
            tmpTag = extractedTags[i];
            extractedTags[i] = extractedTags[i + 1];
            extractedTags[i + 1] = tmpTag;
            break;
          } else if (direction === 'first' && i > 0) {
            tmpTag = extractedTags[i];
            extractedTags[i] = extractedTags[0];
            extractedTags[0] = tmpTag;
            break;
          }
        }
      }
      let newFileName = _generateFileName(fileName, extractedTags);
      _renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName);
    }

    // Replaces a tag with a new one
    static renameTag(filePath, oldTag, newTag) {
      console.log('Rename tag for file: ' + filePath);
      let extractedTags = extractTags(filePath);
      if (TSCORE.PRO && TSCORE.Config.getWriteMetaToSidecarFile()) {
        if (extractedTags.indexOf(oldTag) >= 0) {
          TSCORE.UI.showAlertDialog("The tag cannot be renamed because it is part of the file name, try to rename the file manually.", $.i18n.t("ns.common:warning"));
        } else {
          TSCORE.Meta.renameMetaTag(filePath, oldTag, newTag);
          TSCORE.PerspectiveManager.updateFileUI(filePath, filePath);
        }
      } else {
        if (extractedTags.indexOf(oldTag) < 0) {
          TSCORE.UI.showAlertDialog("This tag cannot be renamed because it is not part of the file name.", $.i18n.t("ns.common:warning"));
          return;
        }
        let fileName = extractFileName(filePath);
        let containingDirectoryPath = extractContainingDirectoryPath(filePath);
        for (let i = 0; i < extractedTags.length; i++) {
          // check if tag is already in the tag array
          if (extractedTags[i] === oldTag) {
            extractedTags[i] = newTag.trim();
          }
        }
        let newFileName = _generateFileName(fileName, extractedTags);
        if (newFileName !== fileName) {
          _renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName);
        }
      }

      this._collectRecentTags([newTag]);
    }

    static changeTitle(filePath, newTitle) {
      console.log('Changing title for file: ' + filePath);
      let containingDirectoryPath = extractContainingDirectoryPath(filePath);
      let extractedTags = extractTags(filePath);
      let fileExt = extractFileExtension(filePath);
      if (fileExt.length > 0) {
        fileExt = '.' + fileExt;
      }
      // TODO generalize _generateFileName to support fileTitle & fileExtension
      let newFileName = _generateFileName(newTitle, extractedTags);
      _renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName + fileExt);
      return true;
    }

    // Removing a tag from a filename
    static removeTag(filePath, tagName) {
      console.log('Removing tag: ' + tagName + ' from ' + filePath);
      let extractedTags = extractTags(filePath);
      if (TSCORE.PRO && TSCORE.Config.getWriteMetaToSidecarFile()) {
        if (extractedTags.indexOf(tagName) >= 0) {
          TSCORE.UI.showAlertDialog("The tag cannot be removed because it is part of the file name, try to rename the file manually.", $.i18n.t("ns.common:warning"));
        } else {
          TSCORE.Meta.removeMetaTag(filePath, tagName);
          TSCORE.PerspectiveManager.updateFileUI(filePath, filePath);
        }
      } else {
        if (extractedTags.indexOf(tagName) < 0) {
          TSCORE.UI.showAlertDialog("This tag cannot be removed because it is not part of the file name.", $.i18n.t("ns.common:warning"));
          return;
        }
        let fileName = extractFileName(filePath);
        let containingDirectoryPath = extractContainingDirectoryPath(filePath);

        let newTags = [];
        for (let i = 0; i < extractedTags.length; i++) {
          if (extractedTags[i] !== tagName) {
            newTags.push(extractedTags[i]);
          }
        }
        let newFileName = _generateFileName(fileName, newTags);
        if (newFileName !== fileName) {
          this._renameFile(filePath, containingDirectoryPath + TSCORE.dirSeparator + newFileName);
        }
      }
    }

    //Collect recent tags in a custom tag-group
    static _collectRecentTags(newTags) {
      let collectGroupKey = 'COL';
      let collectGroup = TSCORE.Config.getTagGroupData(collectGroupKey);
      if (!collectGroup) {

        let collectGroupTemplate = {
          'title': $.i18n.t('ns.common:collectedTagsTagGroupTitle'),
          'key': collectGroupKey,
          'expanded': true,
          'children': []
        };

        TSCORE.Config.addTagGroup(collectGroupTemplate);
        TSCORE.Config.saveSettings();
        collectGroup = collectGroupTemplate;
      }

      newTags.forEach((newTagName) => {
        if (!TSCORE.Config.findTag(newTagName)) {
          TSCORE.Config.createTag(collectGroup, newTagName);
          TSCORE.generateTagGroups();
        }
      });
    }
  } 

  // Public API definitions
  exports.TSTagUtils = TSTagUtils;
});
