/* Copyright (c) 2012-present The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, isFirefox  */

define((require, exports, module) => {
  'use strict';

  console.log('Loading settings.api.js..');

  const TSCORE = require('tscore');
  exports.DefaultSettings = require('tssettingsdefault').defaultSettings;
  exports.Settings = undefined;

  let tagTemplate = {
    'title': undefined,
    'type': 'plain'
    /*
     "pattern":"yyyymmddhhmmss-yyyymmddhhmmss",
     "example":"20120114123456-20120823231235",
     "regex":"",
     "maxlength":17,
     "chainedTags":[
     "isbn","autor"
     ],
     "url": "http://example.com",
     "action":"showDatePicker",
     "prefixes":[
     "EUR", "USD", "BGN"
     ]
     */
  };

  let locationTemplate = {
    'name': undefined,
    'path': undefined,
    'perspective': undefined
  };

  let tagGroupTemplate = {
    'title': undefined,
    'key': undefined,
    'expanded': true,
    'children': []
  };

  const firstRun = false;

  class TSSettings {

    //////////////////// Settings upgrade methods ///////////////////
    static upgradeSettings() {
      let oldBuildNumber = parseInt(exports.Settings.appBuildID);
      // For compartibility reasons
      if (exports.Settings.appBuildID === undefined) {
        oldBuildNumber = parseInt(exports.Settings.appBuild);
        exports.Settings.appBuildID = exports.DefaultSettings.appBuildID;
        this.saveSettings();
      }
      let newBuildNumber = parseInt(exports.DefaultSettings.appBuildID);
      // Workarround for settings update, please comment for production
      //oldBuildNumber = 1;
      //newBuildNumber = 2;
      if (oldBuildNumber < newBuildNumber) {
        console.log('Upgrading settings');
        exports.Settings.appVersion = exports.DefaultSettings.appVersion;
        exports.Settings.appBuild = exports.DefaultSettings.appBuild;
        exports.Settings.appBuildID = exports.DefaultSettings.appBuildID;
        this.getPerspectiveExtensions();
        this.getExtensionPath();
        this.getShowUnixHiddenEntries();
        this.getCheckForUpdates();
        if (oldBuildNumber <= 1700) {
          setPrefixTagContainer('');
          setTagDelimiter(' ');
          setCalculateTags(false);
        }
        if (oldBuildNumber <= 20140307000000) {
          addFileType({
            'type': 'odt',
            'viewer': 'editorODF',
            'editor': 'false'
          });
          addFileType({
            'type': 'ods',
            'viewer': 'editorODF',
            'editor': 'false'
          });
          addFileType({
            'type': 'odp',
            'viewer': 'editorODF',
            'editor': 'false'
          });
          addFileType({
            'type': 'odg',
            'viewer': 'editorODF',
            'editor': 'false'
          });
        }
        if (oldBuildNumber <= 20141002000000) {
          updateFileType({
            'type': 'json',
            'viewer': 'editorJSON',
            'editor': 'editorJSON'
          });
          updateFileType({
            'type': 'html',
            'viewer': 'viewerHTML',
            'editor': 'editorHTML'
          });
          updateFileType({
            'type': 'htm',
            'viewer': 'viewerHTML',
            'editor': 'editorHTML'
          });
        }
        if (oldBuildNumber <= 20141123000000) {
          updateFileType({
            'type': 'mhtml',
            'viewer': 'viewerMHTML',
            'editor': 'false'
          });
          updateFileType({
            'type': 'mht',
            'viewer': 'viewerMHTML',
            'editor': 'false'
          });
        }
        if (oldBuildNumber <= 20150727000000) {
          updateFileType({
            'type': 'ogg',
            'viewer': 'viewerAudioVideo',
            'editor': 'false'
          });
          updateFileType({
            'type': 'oga',
            'viewer': 'viewerAudioVideo',
            'editor': 'false'
          });
          updateFileType({
            'type': 'ogv',
            'viewer': 'viewerAudioVideo',
            'editor': 'false'
          });
          updateFileType({
            'type': 'ogx',
            'viewer': 'viewerAudioVideo',
            'editor': 'false'
          });
          updateFileType({
            'type': 'webm',
            'viewer': 'viewerAudioVideo',
            'editor': 'false'
          });
          updateFileType({
            'type': 'mp3',
            'viewer': 'viewerAudioVideo',
            'editor': 'false'
          });
          updateFileType({
            'type': 'mp4',
            'viewer': 'viewerAudioVideo',
            'editor': 'false'
          });
          addFileType({
            'type': 'epub',
            'viewer': 'viewerEPUB',
            'editor': 'false'
          });
          addFileType({
            'type': 'zip',
            'viewer': 'viewerZIP',
            'editor': 'false'
          });
        }
        if (oldBuildNumber <= 20160905130746) {
          addFileType({
            'type': 'eml',
            'viewer': 'viewerMHTML',
            'editor': 'false'
          });
          if (TSCORE.PRO) {
            exports.Settings.tagGroups.forEach((value) => {
              if (value.key === 'SMR') {
                value.children.push({
                  "type": "smart",
                  "title": "geo-tag",
                  "functionality": "geoTagging",
                  "desciption": "Add geo coordinates as a tag",
                  "color": "#4986e7",
                  "textcolor": "#ffffff"
                });
              }
            });
          }
        }
        if (oldBuildNumber <= 20170203223208) {
          addFileType({
            'type': 'rtf',
            'viewer': 'viewerRTF',
            'editor': 'false'
          });
        }
        if (oldBuildNumber <= 20170414113700) {
          addFileType({
            'type': 'flac',
            'viewer': 'viewerAudioVideo',
            'editor': 'false'
          });
          addFileType({
            'type': 'mp3',
            'viewer': 'viewerAudioVideo',
            'editor': 'false'
          });
        }

        this.saveSettings();
      }
    }

    static addTagGroup(newTagGroup) { // TODO add parameters replace and merge
      let tagGroupExist = false;
      exports.Settings.tagGroups.forEach((value) => {
        if (value.key === newTagGroup.key) {
          //exports.Settings.tagGroups.splice($.inArray(value, exports.Settings.tagGroups), 1);
          tagGroupExist = true;
        }
      });
      if (!tagGroupExist) {
        exports.Settings.tagGroups.push(newTagGroup);
      }
      //exports.Settings.tagGroups.push(newTagGroup);
    }

    static _addFileType(newFileType) {
      let fileTypeExist = false;
      exports.Settings.supportedFileTypes.forEach((value) => {
        if (value.type === newFileType.type) {
          fileTypeExist = true;
        }
      });
      if (!fileTypeExist) {
        exports.Settings.supportedFileTypes.push(newFileType);
      }
    }

    static _updateFileType(newFileType) {
      exports.Settings.supportedFileTypes.forEach((value) => {
        if (value.type === newFileType.type) {
          value.viewer = newFileType.viewer;
          value.editor = newFileType.editor;
        }
      });
    }

    static _addToSettingsArray(arrayLocation, value) {
      if (arrayLocation instanceof Array) {
        if ($.inArray(value, arrayLocation) < 0) {
          arrayLocation.push(value);
        }
      }
    }

    static _removeFromSettingsArray(arrayLocation, value) {
      if (arrayLocation instanceof Array) {
        arrayLocation.splice($.inArray(value, arrayLocation), 1);
      }
    }

    static _removeFromSettingsArrayById(arrayLocation, id) {
      if (arrayLocation instanceof Array) {
        arrayLocation.forEach((value, index) => {
          if (value.id === id) {
            arrayLocation.splice(index, 1);
          }
        });
      }
    }

    //////////////////// getter and setter methods ///////////////////

    static getAppFullName() {
        let appFullName = "TagSpaces"; // TODO extend settings with app full name
        if (TSCORE.PRO) {
          appFullName = appFullName + " Pro";
        }
        return appFullName;
    }

    static getPerspectiveExtensions() {
      let perspectives = [];
      getExtensions().forEach((extension) => {
        if (extension.type === "perspective") {
          perspectives.push({'id': extension.id, 'name': extension.name});
        }
      });
      return perspectives;
    }

    static getViewerExtensions() {
      let viewers = [];
      getExtensions().forEach((extension) => {
        if (extension.type === "viewer" || extension.type === "editor") {
          viewers.push({'id': extension.id, 'name': extension.name});
        }
      });
      return viewers;
    }

    static getEditorExtensions() {
      let editors = [];
      getExtensions().forEach((extension) => {
        if (extension.type === "editor") {
          editors.push({'id': extension.id, 'name': extension.name});
        }
      });
      return editors;
    }

    static getActivatedPerspectives() {
      if (!exports.Settings.perspectives) {
        exports.Settings.perspectives = exports.DefaultSettings.perspectives;
      }

      let matchedPerspectives = [];

      exports.Settings.perspectives.forEach((activatedPerspective) => {
        getPerspectiveExtensions().forEach((perspective) => {
          if (activatedPerspective.id === perspective.id) {
            activatedPerspective.name = perspective.name;
            matchedPerspectives.push(activatedPerspective);
          }
        });
      });

      if (matchedPerspectives.length > 0) {
        exports.Settings.perspectives = matchedPerspectives;
        this.saveSettings();
      }
      return exports.Settings.perspectives;
    }

    static setActivatedPerspectives(value) {

      exports.Settings.perspectives = value;
    }

    static isFirstRun() {
      if (exports.Settings.firstRun === undefined || exports.Settings.firstRun === true) {
        exports.Settings.firstRun = false;
        this.saveSettings();
        return true;
      } else {
        return false;
      }
    }

    static getExtensions() {
      if (!exports.Settings.extensions || exports.Settings.extensions.length < 1) {
        exports.Settings.extensions = [];
        exports.DefaultSettings.ootbPerspectives.forEach((extensionId) => {
          exports.Settings.extensions.push({'id': extensionId, 'name': extensionId, 'type': 'perspective'});
        });
        exports.DefaultSettings.ootbViewers.forEach((extensionId) => {
          exports.Settings.extensions.push({'id': extensionId, 'name': extensionId, 'type': 'viewer'});
        });
        exports.DefaultSettings.ootbEditors.forEach((extensionId) => {
          exports.Settings.extensions.push({'id': extensionId, 'name': extensionId, 'type': 'editor'});
        });
      }
      return exports.Settings.extensions;
    }

    static setExtensions(extensions) {

      exports.Settings.extensions = extensions;
    }

    static getExtensionPath() {
      if (exports.Settings.extensionsPath === undefined) {
        exports.Settings.extensionsPath = exports.DefaultSettings.extensionsPath;
      }
      return exports.Settings.extensionsPath;
    }

    static setExtensionPath(value) {

      exports.Settings.extensionsPath = value;
    }

    static getIsWindowMaximized() {
      if (exports.Settings.isWindowMaximized === undefined) {
        exports.Settings.isWindowMaximized = exports.DefaultSettings.isWindowMaximized;
      }
      return exports.Settings.isWindowMaximized;
    }

    static setIsWindowMaximized(value) {

      exports.Settings.isWindowMaximized = value;
    }

    static getLastOpenedLocation() {
      if (exports.Settings.lastOpenedLocation === undefined) {
        exports.Settings.lastOpenedLocation = exports.DefaultSettings.lastOpenedLocation;
      }
      return exports.Settings.lastOpenedLocation;
    }

    static setLastOpenedLocation(value) {

      exports.Settings.lastOpenedLocation = value;
    }

    static getDefaultLocation() {

      return exports.Settings.defaultLocation || "";
    }

    static setDefaultLocation(value) {

      exports.Settings.defaultLocation = value;
    }

    static getSupportedLanguages() {

      return exports.DefaultSettings.supportedLanguages;
    }

    static getAvailableThumbnailSizes() {

      return exports.DefaultSettings.availableThumbnailSizes;
    }

    static getAvailableThumbnailFormat() {

      return exports.DefaultSettings.availableThumbnailFormat;
    }

    static getCloseViewerKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.closeViewer === undefined) {
        exports.Settings.keyBindings.closeViewer = exports.DefaultSettings.keyBindings.closeViewer;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.closeViewer;
    }

    static setCloseViewerKeyBinding(value) {

      exports.Settings.keyBindings.closeViewer = value;
    }

    static getEditDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.editDocument === undefined) {
        exports.Settings.keyBindings.editDocument = exports.DefaultSettings.keyBindings.editDocument;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.editDocument;
    }

    static setEditDocumentKeyBinding(value) {

      exports.Settings.keyBindings.editDocument = value;
    }

    static getSaveDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.saveDocument === undefined) {
        exports.Settings.keyBindings.saveDocument = exports.DefaultSettings.keyBindings.saveDocument;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.saveDocument;
    }

    static setSaveDocumentKeyBinding(value) {

      exports.Settings.keyBindings.saveDocument = value;
    }

    static getReloadApplicationKeyBinding() {
      //if (exports.Settings.keyBindings === undefined) {
      //    exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
      //    saveSettings();
      //}
      //if (exports.Settings.keyBindings.reloadApplication === undefined) {
      //    exports.Settings.keyBindings.reloadApplication = exports.DefaultSettings.keyBindings.reloadApplication;
      //    saveSettings();
      //}
      return exports.DefaultSettings.keyBindings.reloadApplication;
    }

    static setReloadApplicationKeyBinding(value) {

      consolo.log('Not supported command'); //exports.Settings.keyBindings.reloadApplication = value;
    }

    static getToggleFullScreenKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.toggleFullScreen === undefined) {
        exports.Settings.keyBindings.toggleFullScreen = exports.DefaultSettings.keyBindings.toggleFullScreen;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.toggleFullScreen;
    }

    static setToggleFullScreenKeyBinding(value) {

      exports.Settings.keyBindings.toggleFullScreen = value;
    }

    static getAddRemoveTagsKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.addRemoveTags === undefined) {
        exports.Settings.keyBindings.addRemoveTags = exports.DefaultSettings.keyBindings.addRemoveTags;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.addRemoveTags;
    }

    static setAddRemoveTagsKeyBinding(value) {

      exports.Settings.keyBindings.addRemoveTags = value;
    }

    static getReloadDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.reloadDocument === undefined) {
        exports.Settings.keyBindings.reloadDocument = exports.DefaultSettings.keyBindings.reloadDocument;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.reloadDocument;
    }

    static setReloadDocumentKeyBinding(value) {

      exports.Settings.keyBindings.reloadDocument = value;
    }

    static setSelectAllKeyBinding(value) {

      exports.Settings.keyBindings.selectAll = value;
    }

    static getSelectAllKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.selectAll === undefined) {
        exports.Settings.keyBindings.selectAll = exports.DefaultSettings.keyBindings.selectAll;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.selectAll;
    }

    static getRenamingFileKeyBinding() {
      _updateKeyBindingsSetting;
      if (exports.Settings.keyBindings.renameFile === undefined) {
        exports.Settings.keyBindings.renameFile = exports.DefaultSettings.keyBindings.renameFile;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.renameFile;
    }

    static setRenamingFileKeyBinding(value) {
      exports.Settings.keyBindings.renameFile = value;
    }

    static getDeleteDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.deleteDocument === undefined) {
        exports.Settings.keyBindings.deleteDocument = exports.DefaultSettings.keyBindings.deleteDocument;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.deleteDocument;
    }

    static setDeleteDocumentKeyBinding(value) {

      exports.Settings.keyBindings.deleteDocument = value;
    }

    static getOpenFileKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.openFile === undefined) {
        exports.Settings.keyBindings.openFile = exports.DefaultSettings.keyBindings.openFile;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.openFile;
    }

    static setOpenFileKeyBinding(value) {

      exports.Settings.keyBindings.openFile = value;
    }

    static getOpenFileExternallyKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.openFileExternally === undefined) {
        exports.Settings.keyBindings.openFileExternally = exports.DefaultSettings.keyBindings.openFileExternally;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.openFileExternally;
    }

    static setOpenFileExternallyKeyBinding(value) {

      exports.Settings.keyBindings.openFileExternally = value;
    }

    static getPropertiesDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.propertiesDocument === undefined) {
        exports.Settings.keyBindings.propertiesDocument = exports.DefaultSettings.keyBindings.propertiesDocument;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.propertiesDocument;
    }

    static setPropertiesDocumentKeyBinding(value) {

      exports.Settings.keyBindings.propertiesDocument = value;
    }

    static getNextDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.nextDocument === undefined) {
        exports.Settings.keyBindings.nextDocument = exports.DefaultSettings.keyBindings.nextDocument;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.nextDocument;
    }

    static setNextDocumentKeyBinding(value) {

      exports.Settings.keyBindings.nextDocument = value;
    }

    static getPrevDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.prevDocument === undefined) {
        exports.Settings.keyBindings.prevDocument = exports.DefaultSettings.keyBindings.prevDocument;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.prevDocument;
    }

    static setShowTagLibraryKeyBinding(value) {

      exports.Settings.keyBindings.showTagLibrary = value;
    }

    static getShowTagLibraryKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.showTagLibrary === undefined) {
        exports.Settings.keyBindings.showTagLibrary = exports.DefaultSettings.keyBindings.showTagLibrary;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.showTagLibrary;
    }

    static setShowFolderNavigatorKeyBinding(value) {

      exports.Settings.keyBindings.showFolderNavigator = value;
    }

    static getShowFolderNavigatorBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.showFolderNavigator === undefined) {
        exports.Settings.keyBindings.showFolderNavigator = exports.DefaultSettings.keyBindings.showFolderNavigator;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.showFolderNavigator;
    }

    static setPrevDocumentKeyBinding(value) {

      exports.Settings.keyBindings.prevDocument = value;
    }

    static getOpenDevToolsScreenKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.openDevTools === undefined) {
        exports.Settings.keyBindings.openDevTools = exports.DefaultSettings.keyBindings.openDevTools;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.openDevTools;
    }

    static setOpenDevToolsScreenKeyBinding(value) {

      exports.Settings.keyBindings.openDevTools = value;
    }

    static getSearchKeyBinding() {
      this._updateKeyBindingsSetting();
      if (exports.Settings.keyBindings.openSearch === undefined) {
        exports.Settings.keyBindings.openSearch = exports.DefaultSettings.keyBindings.openSearch;
        this.saveSettings();
      }
      return exports.Settings.keyBindings.openSearch;
    }

    static setSearchKeyBinding(value) {

      exports.Settings.keyBindings.openSearch = value;
    }

    static getEnableGlobalKeyboardShortcuts() {
      if (exports.Settings.enableGlobalKeyboardShortcuts === undefined) {
        exports.Settings.enableGlobalKeyboardShortcuts = exports.DefaultSettings.enableGlobalKeyboardShortcuts;
        this.saveSettings();
      }
      return exports.Settings.enableGlobalKeyboardShortcuts;
    }

    static setEnableGlobalKeyboardShortcuts(value) {

      exports.Settings.enableGlobalKeyboardShortcuts = value;
    }

    static getInterfaceLanguage() {
      if (exports.Settings.interfaceLanguage === undefined) {
        exports.Settings.interfaceLanguage = exports.DefaultSettings.interfaceLanguage;
        this.saveSettings();
      }
      return exports.Settings.interfaceLanguage;
    }

    static setInterfaceLanguage(value) {

      exports.Settings.interfaceLanguage = value;
    }

    static getShowWarningRecursiveScan() {
      if (exports.Settings.showWarningRecursiveScan === undefined) {
        exports.Settings.showWarningRecursiveScan = exports.DefaultSettings.showWarningRecursiveScan;
        this.saveSettings();
      }
      return exports.Settings.showWarningRecursiveScan;
    }

    static setShowWarningRecursiveScan(value) {
      exports.Settings.showWarningRecursiveScan = value;
      this.saveSettings();
    }

    static getShowMainMenu() {
      if (exports.Settings.showMainMenu === undefined) {
        exports.Settings.showMainMenu = exports.DefaultSettings.showMainMenu;
      }
      return exports.Settings.showMainMenu;
    }

    static setShowMainMenu(value) {

      exports.Settings.showMainMenu = value;
    }

    static getWebDavPath() {
      if (exports.Settings.webDavPath === undefined) {
        exports.Settings.webDavPath = exports.DefaultSettings.webDavPath;
      }
      return exports.Settings.webDavPath;
    }

    static setWebDavPath(value) {

      exports.Settings.webDavPath = value;
    }

    static getShowUnixHiddenEntries() {
      if (exports.Settings.showUnixHiddenEntries === undefined) {
        exports.Settings.showUnixHiddenEntries = exports.DefaultSettings.showUnixHiddenEntries;
      }
      return exports.Settings.showUnixHiddenEntries;
    }

    static setShowUnixHiddenEntries(value) {

      exports.Settings.showUnixHiddenEntries = value;
    }

    static getCheckForUpdates() {
      if (exports.Settings.checkForUpdates === undefined) {
        exports.Settings.checkForUpdates = exports.DefaultSettings.checkForUpdates;
      }
      return exports.Settings.checkForUpdates;
    }

    static setCheckForUpdates(value) {

      exports.Settings.checkForUpdates = value;
    }

    static getPrefixTagContainer() {
      if (exports.Settings.prefixTagContainer === undefined) {
        exports.Settings.prefixTagContainer = exports.DefaultSettings.prefixTagContainer;
      }
      return exports.Settings.prefixTagContainer;
    }

    static setPrefixTagContainer(value) {

      exports.Settings.prefixTagContainer = value;
    }

    static getTagDelimiter() {
      if (exports.Settings.tagDelimiter === undefined) {
        exports.Settings.tagDelimiter = exports.DefaultSettings.tagDelimiter;
      }
      return exports.Settings.tagDelimiter;
    }

    static setTagDelimiter(value) {

      exports.Settings.tagDelimiter = value;
    }

    static getCalculateTags() {
      if (exports.Settings.calculateTags === undefined) {
        exports.Settings.calculateTags = exports.DefaultSettings.calculateTags;
      }
      return exports.Settings.calculateTags;
    }

    static setCalculateTags(value) {

      exports.Settings.calculateTags = value;
    }

    static getLoadLocationMeta() {
      if (exports.Settings.loadLocationMeta === undefined) {
        exports.Settings.loadLocationMeta = exports.DefaultSettings.loadLocationMeta;
      }
      return exports.Settings.loadLocationMeta;
    }

    static setLoadLocationMeta(value) {

      exports.Settings.loadLocationMeta = value;
    }

    static getUseSearchInSubfolders() {
      if (exports.Settings.useSearchInSubfolders === undefined) {
        exports.Settings.useSearchInSubfolders = exports.DefaultSettings.useSearchInSubfolders;
      }
      return exports.Settings.useSearchInSubfolders;
    }

    static setUseSearchInSubfolders(value) {
      exports.Settings.useSearchInSubfolders = value;
    }

    static getMaxSearchResultCount() {
      if (exports.Settings.maxSearchResultCount === undefined) {
        exports.Settings.maxSearchResultCount = exports.DefaultSettings.maxSearchResultCount;
      }
      return exports.Settings.maxSearchResultCount;
    }

    static setMaxSearchResultCount(value) {
      if (isNaN(value) || value < 0) {
        value = exports.DefaultSettings.maxSearchResultCount;
      } else if (value > 2000) {
        value = 2000;
      }
      exports.Settings.maxSearchResultCount = value;
    }

    static getDefaultThumbnailSize() {
      if (exports.Settings.defaultThumbnailSize === undefined) {
        exports.Settings.defaultThumbnailSize = exports.DefaultSettings.defaultThumbnailSize;
      }
      return exports.Settings.defaultThumbnailSize;
    }

    static setDefaultThumbnailSize(value) {
      exports.Settings.defaultThumbnailSize = value;
    }

    static getDefaultThumbnailFormat() {
      if (exports.Settings.defaultThumbnailFormat === undefined) {
        exports.Settings.defaultThumbnailFormat = exports.DefaultSettings.defaultThumbnailFormat;
      }
      return exports.Settings.defaultThumbnailFormat;
    }

    static setDefaultThumbnailFormat(value) {
      exports.Settings.defaultThumbnailFormat = value;
    }

    static getWatchCurrentDirectory() {
      if (exports.Settings.watchCurrentDirectory === undefined) {
        exports.Settings.watchCurrentDirectory = exports.DefaultSettings.watchCurrentDirectory;
      }
      return exports.Settings.watchCurrentDirectory;
    }

    static setWatchCurrentDirectory(value) {
      exports.Settings.watchCurrentDirectory = value;
    }

    static getEnableMetaData() {
      if (exports.Settings.enableMetaData === undefined) {
        exports.Settings.enableMetaData = exports.DefaultSettings.enableMetaData;
      }
      return exports.Settings.enableMetaData;
    }

    static setEnableMetaData(value) {

      exports.Settings.enableMetaData = value;
    }

    static getSupportedFileTypes() {
      if (exports.Settings.supportedFileTypes === undefined) {
        exports.Settings.supportedFileTypes = exports.DefaultSettings.supportedFileTypes;
      }
      return exports.Settings.supportedFileTypes;
    }

    static setSupportedFileTypes(value) {

      exports.Settings.supportedFileTypes = value;
    }

    static getNewTextFileContent() {

      return exports.DefaultSettings.newTextFileContent;
    }

    static getNewHTMLFileContent() {

      return exports.DefaultSettings.newHTMLFileContent;
    }

    static getNewMDFileContent() {

      return exports.DefaultSettings.newMDFileContent;
    }

    static getUseTrashCan() {
      if (exports.Settings.useTrashCan === undefined) {
        exports.Settings.useTrashCan = exports.DefaultSettings.useTrashCan;
      }
      return exports.Settings.useTrashCan;
    }

    static setUseTrashCan(value) {

      exports.Settings.useTrashCan = value;
    }

    static getUseOCR() {
      if (exports.Settings.useOCR === undefined) {
        exports.Settings.useOCR = exports.DefaultSettings.useOCR;
      }
      return exports.Settings.useOCR;
    }

    static setUseOCR(value) {

      exports.Settings.useOCR = value;
    }

    static getUseTextExtraction() {
      if (exports.Settings.useTextExtraction === undefined) {
        exports.Settings.useTextExtraction = exports.DefaultSettings.useTextExtraction;
      }
      return exports.Settings.useTextExtraction;
    }

    static setUseTextExtraction(value) {

      exports.Settings.useTextExtraction = value;
    }

    static getUseGenerateThumbnails() {
      if (exports.Settings.useGenerateThumbnails === undefined) {
        exports.Settings.useGenerateThumbnails = exports.DefaultSettings.useGenerateThumbnails;
      }
      return exports.Settings.useGenerateThumbnails;
    }

    static setUseGenerateThumbnails(value) {

      exports.Settings.useGenerateThumbnails = value;
    }

    static getWriteMetaToSidecarFile() {
      if (exports.Settings.writeMetaToSidecarFile === undefined) {
        exports.Settings.writeMetaToSidecarFile = exports.DefaultSettings.writeMetaToSidecarFile;
        this.saveSettings();
      }
      return exports.Settings.writeMetaToSidecarFile;
    }

    static setWriteMetaToSidecarFile(value) {

      exports.Settings.writeMetaToSidecarFile = value;
    }

    static getUseDefaultLocation() {
      if (exports.Settings.useDefaultLocation === undefined) {
        exports.Settings.useDefaultLocation = exports.DefaultSettings.useDefaultLocation;
        this.saveSettings();
      }
      return exports.Settings.useDefaultLocation;
    }

    static setUseDefaultLocation(value) {

      exports.Settings.useDefaultLocation = value;
    }

    static getColoredFileExtensionsEnabled() {
      if (exports.Settings.coloredFileExtensionsEnabled === undefined) {
        exports.Settings.coloredFileExtensionsEnabled = exports.DefaultSettings.coloredFileExtensionsEnabled;
        this.saveSettings();
      }
      return exports.Settings.coloredFileExtensionsEnabled;
    }

    static setColoredFileExtensionsEnabled(value) {

      exports.Settings.coloredFileExtensionsEnabled = value;
    }

    static getShowTagAreaOnStartup() {
      if (exports.Settings.showTagAreaOnStartup === undefined) {
        exports.Settings.showTagAreaOnStartup = exports.DefaultSettings.showTagAreaOnStartup;
        this.saveSettings();
      }
      return exports.Settings.showTagAreaOnStartup;
    }

    static setShowTagAreaOnStartup(value) {

      exports.Settings.showTagAreaOnStartup = value;
    }

    static getDefaultTagColor() {
      if (exports.Settings.defaultTagColor === undefined) {
        exports.Settings.defaultTagColor = exports.DefaultSettings.defaultTagColor;
        this.saveSettings();
      }
      return exports.Settings.defaultTagColor;
    }

    static setDefaultTagColor(value) {
      exports.Settings.defaultTagColor = value;
    }

    static getDefaultTagTextColor() {
      if (exports.Settings.defaultTagTextColor === undefined) {
        exports.Settings.defaultTagTextColor = exports.DefaultSettings.defaultTagTextColor;
        this.saveSettings();
      }
      return exports.Settings.defaultTagTextColor;
    }

    static setDefaultTagTextColor(value) {
      exports.Settings.defaultTagTextColor = value;
    }

    //////////////////// API methods ///////////////////
    static getFileTypeEditor(fileTypeExt) {
      for (let i = 0; i < exports.Settings.supportedFileTypes.length; i++) {
        if (exports.Settings.supportedFileTypes[i].type === fileTypeExt) {
          return exports.Settings.supportedFileTypes[i].editor;
        }
      }
      return false;
    }

    static getFileTypeViewer(fileTypeExt) {
      for (let i = 0; i < exports.Settings.supportedFileTypes.length; i++) {
        if (exports.Settings.supportedFileTypes[i].type === fileTypeExt) {
          return exports.Settings.supportedFileTypes[i].viewer;
        }
      }
      return false;
    }

    // Returns the tag information from the setting for a given tag
    static findTag(tagName) {
      for (let i = 0; i < exports.Settings.tagGroups.length; i++) {
        for (let j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
          // console.log("Current tagname "+exports.Settings.tagGroups[i].children[j].title);
          if (exports.Settings.tagGroups[i].children[j].title === tagName) {
            return exports.Settings.tagGroups[i].children[j];
          }
        }
      }
      return false;
    }

    static getAllTags() {
      let allTags = [];
      for (let i = 0; i < exports.Settings.tagGroups.length; i++) {
        // console.log("Current taggroup "+exports.Settings.tagGroups[i].key);
        for (let j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
          // console.log("Current tagname "+exports.Settings.tagGroups[i].children[j].title);
          if (exports.Settings.tagGroups[i].children[j].type === 'plain') {
            allTags.push(exports.Settings.tagGroups[i].children[j].title);
          }
        }
      }
      return allTags;
    }

    static getTagData(tagTitle, tagGroupKey) {
      for (let i = 0; i < exports.Settings.tagGroups.length; i++) {
        if (exports.Settings.tagGroups[i].key === tagGroupKey) {
          for (let j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
            if (exports.Settings.tagGroups[i].children[j].title === tagTitle) {
              return exports.Settings.tagGroups[i].children[j];
            }
          }
        }
      }
    }

    static getTagGroupData(tagGroupKey) {
      for (let i = 0; i < exports.Settings.tagGroups.length; i++) {
        if (exports.Settings.tagGroups[i].key === tagGroupKey) {
          return exports.Settings.tagGroups[i];
        }
      }
    }

    static getAllTagGroupData() {
      if (exports.Settings.tagGroups.length > 0) {
        return exports.Settings.tagGroups;
      }
    }

    static deleteTagGroup(tagData) {
      for (let i = 0; i < exports.Settings.tagGroups.length; i++) {
        if (exports.Settings.tagGroups[i].key === tagData.key) {
          console.log('Deleting taggroup ' + exports.Settings.tagGroups[i].key);
          exports.Settings.tagGroups.splice(i, 1);
          break;
        }
      }
      this.saveSettings();
    }

    static editTag(tagData, newTagName, newColor, newTextColor, newKeyBinding) {
      for (let i = 0; i < exports.Settings.tagGroups.length; i++) {
        if (exports.Settings.tagGroups[i].key === tagData.parentKey) {
          for (let j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
            if (exports.Settings.tagGroups[i].children[j].title === tagData.title) {
              exports.Settings.tagGroups[i].children[j].title = newTagName;
              exports.Settings.tagGroups[i].children[j].color = newColor;
              exports.Settings.tagGroups[i].children[j].textcolor = newTextColor;
              exports.Settings.tagGroups[i].children[j].keyBinding = newKeyBinding;
              break;
            }
          }
        }
      }
      this.saveSettings();
    }

    static deleteTag(tagData) {
      for (let i = 0; i < exports.Settings.tagGroups.length; i++) {
        if (exports.Settings.tagGroups[i].key === tagData.parentKey) {
          for (let j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
            if (exports.Settings.tagGroups[i].children[j].title === tagData.title) {
              exports.Settings.tagGroups[i].children.splice(j, 1);
              break;
            }
          }
        }
      }
      exports.saveSettings();
    }

    static moveTag(tagData, targetTagGroupKey) {
      let targetTagGroupData = getTagGroupData(targetTagGroupKey);
      if (createTag(targetTagGroupData, tagData.title, tagData.color, tagData.textcolor)) {
        deleteTag(tagData);
        this.saveSettings();
      }
    }

    static createTag(tagData, newTagName, newTagColor, newTagTextColor) {
      exports.Settings.tagGroups.forEach((value) => {
        if (value.key === tagData.key) {
          //console.log("Creating tag: "+newTagName+" with parent: "+tagData.key);
          let tagExistsInGroup = false;
          value.children.forEach((child) => {
            if (child.title === newTagName) {
              tagExistsInGroup = true;
            }
          });
          // Create tag if it is not existing in the current group
          if (!tagExistsInGroup && newTagName.length >= 1) {
            let newTagModel = JSON.parse(JSON.stringify(tagTemplate));
            newTagModel.title = newTagName;
            if (newTagColor !== undefined || newTagTextColor !== undefined) {
              newTagModel.color = newTagColor;
              newTagModel.textcolor = newTagTextColor;
            } else {
              newTagModel.color = value.color !== undefined ? value.color : getDefaultTagColor();
              newTagModel.textcolor = value.textcolor !== undefined ? value.textcolor : getDefaultTagTextColor();
            }
            value.children.push(newTagModel);
          } else {
            console.log('Tag with the same name already exist in this group or tag length is not correct');
          }
        }
      });
      this.saveSettings();
      return true;
    }

    static editTagGroup(tagData, tagGroupName, tagGroupColor, tagGroupTextColor, propagateColorToTags) {
      for (let i = 0; i < exports.Settings.tagGroups.length; i++) {
        if (exports.Settings.tagGroups[i].key === tagData.key) {
          exports.Settings.tagGroups[i].title = tagGroupName;
          exports.Settings.tagGroups[i].color = tagGroupColor;
          exports.Settings.tagGroups[i].textcolor = tagGroupTextColor;
          if (propagateColorToTags) {
            for (let j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
              exports.Settings.tagGroups[i].children[j].color = tagGroupColor;
              exports.Settings.tagGroups[i].children[j].textcolor = tagGroupTextColor;
            }
          }
          break;
        }
      }
      this.saveSettings();
    }

    static duplicateTagGroup(tagData, tagGroupName, tagGroupKey) {
      let newTagGroupModel;
      for (let i = 0; i < exports.Settings.tagGroups.length; i++) {
        if (exports.Settings.tagGroups[i].key === tagData.key) {
          newTagGroupModel = JSON.parse(JSON.stringify(exports.Settings.tagGroups[i]));
          break;
        }
      }
      newTagGroupModel.title = tagGroupName;
      newTagGroupModel.key = tagGroupKey;
      console.log('Creating taggroup: ' + JSON.stringify(newTagGroupModel) + ' with key: ' + tagGroupKey);
      exports.Settings.tagGroups.push(newTagGroupModel);
      this.saveSettings();
    }

    static sortTagGroup(tagData) {
      for (let i = 0; i < exports.Settings.tagGroups.length; i++) {
        if (exports.Settings.tagGroups[i].key === tagData.key) {
          exports.Settings.tagGroups[i].children.sort((a, b) => {
            return a.title.localeCompare(b.title);
          });
          break;
        }
      }
      this.saveSettings();
    }

    static createTagGroup(tagData, tagGroupName, tagGroupColor, tagGroupTextColor) {
      let newTagGroupModel = JSON.parse(JSON.stringify(tagGroupTemplate));
      newTagGroupModel.title = tagGroupName;
      newTagGroupModel.color = tagGroupColor;
      newTagGroupModel.textcolor = tagGroupTextColor;
      //newTagGroupModel.children = [];
      newTagGroupModel.key = '' + TSCORE.Utils.getRandomInt(10000, 99999);
      console.log('Creating taggroup: ' + JSON.stringify(newTagGroupModel) + ' with key: ' + newTagGroupModel.key);
      exports.Settings.tagGroups.push(newTagGroupModel);
      this.saveSettings();
    }

    static moveTagGroup(tagData, direction) {
      let targetPosition;
      let currentPosition;
      exports.Settings.tagGroups.forEach((value, index) => {
        if (value.key === tagData.key) {
          currentPosition = index;
        }
      });
      if (direction === 'up') {
        targetPosition = currentPosition - 1;
      }
      if (direction === 'down') {
        targetPosition = currentPosition + 1;
      }
      // Check if target position is within the taggroups array range
      if (targetPosition < 0 || targetPosition >= exports.Settings.tagGroups.length || targetPosition === currentPosition) {
        return false;
      }
      let tmpTagGroup = exports.Settings.tagGroups[currentPosition];
      exports.Settings.tagGroups[currentPosition] = exports.Settings.tagGroups[targetPosition];
      exports.Settings.tagGroups[targetPosition] = tmpTagGroup;
      this.saveSettings();
    }

    static createLocation(name, location, perspectiveId) {
      let newLocationModel = JSON.parse(JSON.stringify(locationTemplate));
      name = name.replace('\\', '\\\\');
      name = name.replace('\\\\\\', '\\\\');
      name = name.replace('\\\\\\\\', '\\\\');
      newLocationModel.name = name;
      newLocationModel.path = location;
      newLocationModel.perspective = perspectiveId;
      let createLoc = true;
      exports.Settings.tagspacesList.forEach((value) => {
        if (value.path === newLocationModel.path) {
          TSCORE.showAlertDialog($.i18n.t('ns.dialogs:selectedPathExistContentAlert'), $.i18n.t('ns.dialogs:selectedPathExistTitleAlert'));
          createLoc = false;
        }
        if (value.name === newLocationModel.name) {
          TSCORE.showAlertDialog($.i18n.t('ns.dialogs:selectedLocationNameExistContentAlert'), $.i18n.t('ns.dialogs:selectedLocationNameExistTitleAlert'));
          createLoc = false;
        }
      });
      if (createLoc) {
        exports.Settings.tagspacesList.push(newLocationModel);
        this.saveSettings();
      }
    }

    static editLocation(oldName, newName, newLocation, perspectiveId) {
      //        name = name.replace("\\", "\\\\");
      //        name = name.replace("\\\\\\", "\\\\");
      //        name = name.replace("\\\\\\\\", "\\\\");   
      console.log('Old Name: ' + oldName + ' New Name: ' + newName + ' New Loc: ' + newLocation);
      let editLoc = true;
      exports.Settings.tagspacesList.forEach((value) => {
        /* if(value.path == newLocation) {
        TSCORE.showAlertDialog("Selected path is already used by a location!","Duplicated Location Path");
        editLocation = false;
        }  */
        if (value.name === newName && value.name !== oldName) {
          TSCORE.showAlertDialog($.i18n.t('ns.dialogs:selectedLocationNameExistContentAlert'), $.i18n.t('ns.dialogs:selectedLocationNameExistTitleAlert'));
          editLoc = false;
        }
      });
      if (editLoc) {
        exports.Settings.tagspacesList.forEach((value) => {
          if (value.name === oldName) {
            value.name = newName;
            value.path = newLocation;
            value.perspective = perspectiveId;
          }
        });
        this.saveSettings();
      }
    }

    static getLocation(path) {
      let location;
      exports.Settings.tagspacesList.forEach((value) => {
        if (value.path === path) {
          location = value;
        }
      });
      return location;
    }

    static deleteLocation(name) {
      for (let i = 0; i < exports.Settings.tagspacesList.length; i++) {
        console.log('Traversing connections ' + exports.Settings.tagspacesList[i].name + ' searching for ' + name);
        if (exports.Settings.tagspacesList[i].name === name) {
          console.log('Deleting connections ' + exports.Settings.tagspacesList[i].name);
          exports.Settings.tagspacesList.splice(i, 1);
          break;
        }
      }
      this.saveSettings();
    }

    static updateSettingMozillaPreferences(settings) {
      let tmpSettings = JSON.parse(settings);
      if (tmpSettings !== null) {
        exports.Settings = tmpSettings;
        console.log('Settings loaded from firefox preferences: ' + tmpSettings);
      } else {
        exports.Settings = exports.DefaultSettings;
        console.log('Default settings loaded(Firefox)!');
      }
      this.saveSettings();
    }

    static loadDefaultSettings() {
      exports.Settings = exports.DefaultSettings;
      this.saveSettings();
      TSCORE.reloadUI();
      console.log('Default settings loaded.');
    }

    static restoreDefaultTagGroups() {
      exports.DefaultSettings.tagGroups.forEach((value, index) => {
        exports.Settings.tagGroups.push(exports.DefaultSettings.tagGroups[index]);
        exports.Settings.tagGroups[index].key = TSCORE.Utils.guid();
      });
      this.saveSettings();
      TSCORE.generateTagGroups();
      TSCORE.showSuccessDialog($.i18n.t('ns.dialogs:recreateDefaultSuccessMessage'));
    }

    static loadSettingsLocalStorage() {
      try {
        let tmpSettings = JSON.parse(localStorage.getItem('tagSpacesSettings'));
        //Cordova try to load saved setting in app storage
        if (isCordova) {
          let appStorageSettings = JSON.parse(TSCORE.IO.loadSettings());
          let appStorageTagGroups = JSON.parse(TSCORE.IO.loadSettingsTags());
          if (appStorageSettings) {
            tmpSettings = appStorageSettings;
          }
          if (appStorageTagGroups) {
            tmpSettings.tagGroups = appStorageTagGroups.tagGroups;
          }
        }
        //console.log("Settings: "+JSON.stringify(tmpSettings));        
        if (tmpSettings !== null) {
          exports.Settings = tmpSettings;
        } else {
          // If no settings found in the local storage,
          // the application runs for the first time.
          firstRun = true;
        }
        console.log('Loaded settings from local storage: '); //+ JSON.stringify(exports.Settings));
      } catch (ex) {
        console.log('Loading settings from local storage failed due exception: ' + ex);
      }
    }

    // Save setting
    static saveSettings() {
      // TODO Make a file based json backup
      // Making a backup of the last settings
      localStorage.setItem('tagSpacesSettingsBackup1', localStorage.getItem('tagSpacesSettings'));
      // Storing setting in the local storage of mozilla and chorme
      localStorage.setItem('tagSpacesSettings', JSON.stringify(exports.Settings));
      // Storing settings in firefox native preferences
      if (isFirefox || isChrome || isCordova) {
        TSCORE.IO.saveSettings(JSON.stringify(exports.Settings));
        if (isCordova) {
          TSCORE.IO.saveSettingsTags(JSON.stringify(exports.Settings.tagGroups));
        }
      }
      console.log('Tagspace Settings Saved!');
    }

    static _updateKeyBindingsSetting() {
      if (exports.Settings.keyBindings === undefined) {
        exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
        this.saveSettings();
      }
    }

    static exportTagGroups() {
      let jsonFormat = '{ "appName": "' + TSCORE.Config.DefaultSettings.appName +
        '", "appVersion": "' + TSCORE.Config.DefaultSettings.appVersion +
        '", "appBuild": "' + TSCORE.Config.DefaultSettings.appBuild +
        '", "settingsVersion": ' + TSCORE.Config.DefaultSettings.settingsVersion +
        ', "tagGroups": ';

      let getAllTags = [];
      getAllTagGroupData().forEach((value, index) => {
        getAllTags.push(value);
        getAllTags[index].key = TSCORE.Utils.guid();
      });

      let blob = new Blob([jsonFormat + JSON.stringify(getAllTags) + '}'], {
        type: 'application/json'
      });
      let dateTimeTag = TSCORE.TagUtils.formatDateTime4Tag(new Date(), true);
      TSCORE.Utils.saveAsTextFile(blob, 'tsm[' + dateTimeTag + '].json');
      console.log('TagGroup Data Exported...');
    }
  } 

  // Public API definition
  exports.TSSettings = TSSettings;
});
