/* Copyright (c) 2012-present The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, isFirefox  */

define((require, exports, module) => {
  'use strict';

  console.log('Loading settings.api.js..');

  const TSCORE = require('tscore');
  const defaultSettings = require('tssettingsdefault').defaultSettings;

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

  let firstRun = false;

  class TSSettings {

    constructor() {
      this.DefaultSettings = defaultSettings;
      this.Settings;
    }
  
    //////////////////// Settings upgrade methods ///////////////////
    upgradeSettings() {
      let oldBuildNumber = parseInt(this.Settings.appBuildID);
      // For compartibility reasons
      if (this.Settings.appBuildID === undefined) {
        oldBuildNumber = parseInt(this.Settings.appBuild);
        this.Settings.appBuildID = this.DefaultSettings.appBuildID;
        this.saveSettings();
      }
      let newBuildNumber = parseInt(this.DefaultSettings.appBuildID);
      // Workarround for settings update, please comment for production
      //oldBuildNumber = 1;
      //newBuildNumber = 2;
      if (oldBuildNumber < newBuildNumber) {
        console.log('Upgrading settings');
        this.Settings.appVersion = this.DefaultSettings.appVersion;
        this.Settings.appBuild = this.DefaultSettings.appBuild;
        this.Settings.appBuildID = this.DefaultSettings.appBuildID;
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
            this.Settings.tagGroups.forEach((value) => {
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

    addTagGroup(newTagGroup) { // TODO add parameters replace and merge
      let tagGroupExist = false;
      this.Settings.tagGroups.forEach((value) => {
        if (value.key === newTagGroup.key) {
          //this.Settings.tagGroups.splice($.inArray(value, this.Settings.tagGroups), 1);
          tagGroupExist = true;
        }
      });
      if (!tagGroupExist) {
        this.Settings.tagGroups.push(newTagGroup);
      }
      //this.Settings.tagGroups.push(newTagGroup);
    }

    _addFileType(newFileType) {
      let fileTypeExist = false;
      this.Settings.supportedFileTypes.forEach((value) => {
        if (value.type === newFileType.type) {
          fileTypeExist = true;
        }
      });
      if (!fileTypeExist) {
        this.Settings.supportedFileTypes.push(newFileType);
      }
    }

    _updateFileType(newFileType) {
      this.Settings.supportedFileTypes.forEach((value) => {
        if (value.type === newFileType.type) {
          value.viewer = newFileType.viewer;
          value.editor = newFileType.editor;
        }
      });
    }

    _addToSettingsArray(arrayLocation, value) {
      if (arrayLocation instanceof Array) {
        if ($.inArray(value, arrayLocation) < 0) {
          arrayLocation.push(value);
        }
      }
    }

    _removeFromSettingsArray(arrayLocation, value) {
      if (arrayLocation instanceof Array) {
        arrayLocation.splice($.inArray(value, arrayLocation), 1);
      }
    }

    _removeFromSettingsArrayById(arrayLocation, id) {
      if (arrayLocation instanceof Array) {
        arrayLocation.forEach((value, index) => {
          if (value.id === id) {
            arrayLocation.splice(index, 1);
          }
        });
      }
    }

    //////////////////// getter and setter methods ///////////////////

    getAppFullName() {
        let appFullName = "TagSpaces"; // TODO extend settings with app full name
        if (TSCORE.PRO) {
          appFullName = appFullName + " Pro";
        }
        return appFullName;
    }

    getPerspectiveExtensions() {
      let perspectives = [];
      this.getExtensions().forEach((extension) => {
        if (extension.type === "perspective") {
          perspectives.push({'id': extension.id, 'name': extension.name});
        }
      });
      return perspectives;
    }

    getViewerExtensions() {
      let viewers = [];
      this.getExtensions().forEach((extension) => {
        if (extension.type === "viewer" || extension.type === "editor") {
          viewers.push({'id': extension.id, 'name': extension.name});
        }
      });
      return viewers;
    }

    getEditorExtensions() {
      let editors = [];
      this.getExtensions().forEach((extension) => {
        if (extension.type === "editor") {
          editors.push({'id': extension.id, 'name': extension.name});
        }
      });
      return editors;
    }

    getActivatedPerspectives() {
      if (!this.Settings.perspectives) {
        this.Settings.perspectives = this.DefaultSettings.perspectives;
      }

      let matchedPerspectives = [];

      this.Settings.perspectives.forEach((activatedPerspective) => {
        this.getPerspectiveExtensions().forEach((perspective) => {
          if (activatedPerspective.id === perspective.id) {
            activatedPerspective.name = perspective.name;
            matchedPerspectives.push(activatedPerspective);
          }
        });
      });

      if (matchedPerspectives.length > 0) {
        this.Settings.perspectives = matchedPerspectives;
        this.saveSettings();
      }
      return this.Settings.perspectives;
    }

    setActivatedPerspectives(value) {

      this.Settings.perspectives = value;
    }

    isFirstRun() {
      if (this.Settings.firstRun === undefined || this.Settings.firstRun === true) {
        this.Settings.firstRun = false;
        this.saveSettings();
        return true;
      } else {
        return false;
      }
    }

    getExtensions() {
      if (!this.Settings.extensions || this.Settings.extensions.length < 1) {
        this.Settings.extensions = [];
        this.DefaultSettings.ootbPerspectives.forEach((extensionId) => {
          this.Settings.extensions.push({'id': extensionId, 'name': extensionId, 'type': 'perspective'});
        });
        this.DefaultSettings.ootbViewers.forEach((extensionId) => {
          this.Settings.extensions.push({'id': extensionId, 'name': extensionId, 'type': 'viewer'});
        });
        this.DefaultSettings.ootbEditors.forEach((extensionId) => {
          this.Settings.extensions.push({'id': extensionId, 'name': extensionId, 'type': 'editor'});
        });
      }
      return this.Settings.extensions;
    }

    setExtensions(extensions) {

      this.Settings.extensions = extensions;
    }

    getExtensionPath() {
      if (this.Settings.extensionsPath === undefined) {
        this.Settings.extensionsPath = this.DefaultSettings.extensionsPath;
      }
      return this.Settings.extensionsPath;
    }

    setExtensionPath(value) {

      this.Settings.extensionsPath = value;
    }

    getIsWindowMaximized() {
      if (this.Settings.isWindowMaximized === undefined) {
        this.Settings.isWindowMaximized = this.DefaultSettings.isWindowMaximized;
      }
      return this.Settings.isWindowMaximized;
    }

    setIsWindowMaximized(value) {

      this.Settings.isWindowMaximized = value;
    }

    getLastOpenedLocation() {
      if (this.Settings.lastOpenedLocation === undefined) {
        this.Settings.lastOpenedLocation = this.DefaultSettings.lastOpenedLocation;
      }
      return this.Settings.lastOpenedLocation;
    }

    setLastOpenedLocation(value) {

      this.Settings.lastOpenedLocation = value;
    }

    getDefaultLocation() {

      return this.Settings.defaultLocation || "";
    }

    setDefaultLocation(value) {

      this.Settings.defaultLocation = value;
    }

    getSupportedLanguages() {

      return this.DefaultSettings.supportedLanguages;
    }

    getAvailableThumbnailSizes() {

      return this.DefaultSettings.availableThumbnailSizes;
    }

    getAvailableThumbnailFormat() {

      return this.DefaultSettings.availableThumbnailFormat;
    }

    getCloseViewerKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.closeViewer === undefined) {
        this.Settings.keyBindings.closeViewer = this.DefaultSettings.keyBindings.closeViewer;
        this.saveSettings();
      }
      return this.Settings.keyBindings.closeViewer;
    }

    setCloseViewerKeyBinding(value) {

      this.Settings.keyBindings.closeViewer = value;
    }

    getEditDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.editDocument === undefined) {
        this.Settings.keyBindings.editDocument = this.DefaultSettings.keyBindings.editDocument;
        this.saveSettings();
      }
      return this.Settings.keyBindings.editDocument;
    }

    setEditDocumentKeyBinding(value) {

      this.Settings.keyBindings.editDocument = value;
    }

    getSaveDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.saveDocument === undefined) {
        this.Settings.keyBindings.saveDocument = this.DefaultSettings.keyBindings.saveDocument;
        this.saveSettings();
      }
      return this.Settings.keyBindings.saveDocument;
    }

    setSaveDocumentKeyBinding(value) {

      this.Settings.keyBindings.saveDocument = value;
    }

    getReloadApplicationKeyBinding() {
      //if (this.Settings.keyBindings === undefined) {
      //    this.Settings.keyBindings = this.DefaultSettings.keyBindings;
      //    saveSettings();
      //}
      //if (this.Settings.keyBindings.reloadApplication === undefined) {
      //    this.Settings.keyBindings.reloadApplication = this.DefaultSettings.keyBindings.reloadApplication;
      //    saveSettings();
      //}
      return this.DefaultSettings.keyBindings.reloadApplication;
    }

    setReloadApplicationKeyBinding(value) {

      consolo.log('Not supported command'); //this.Settings.keyBindings.reloadApplication = value;
    }

    getToggleFullScreenKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.toggleFullScreen === undefined) {
        this.Settings.keyBindings.toggleFullScreen = this.DefaultSettings.keyBindings.toggleFullScreen;
        this.saveSettings();
      }
      return this.Settings.keyBindings.toggleFullScreen;
    }

    setToggleFullScreenKeyBinding(value) {

      this.Settings.keyBindings.toggleFullScreen = value;
    }

    getAddRemoveTagsKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.addRemoveTags === undefined) {
        this.Settings.keyBindings.addRemoveTags = this.DefaultSettings.keyBindings.addRemoveTags;
        this.saveSettings();
      }
      return this.Settings.keyBindings.addRemoveTags;
    }

    setAddRemoveTagsKeyBinding(value) {

      this.Settings.keyBindings.addRemoveTags = value;
    }

    getReloadDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.reloadDocument === undefined) {
        this.Settings.keyBindings.reloadDocument = this.DefaultSettings.keyBindings.reloadDocument;
        this.saveSettings();
      }
      return this.Settings.keyBindings.reloadDocument;
    }

    setReloadDocumentKeyBinding(value) {

      this.Settings.keyBindings.reloadDocument = value;
    }

    setSelectAllKeyBinding(value) {

      this.Settings.keyBindings.selectAll = value;
    }

    getSelectAllKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.selectAll === undefined) {
        this.Settings.keyBindings.selectAll = this.DefaultSettings.keyBindings.selectAll;
        this.saveSettings();
      }
      return this.Settings.keyBindings.selectAll;
    }

    getRenamingFileKeyBinding() {
      this._updateKeyBindingsSetting;
      if (this.Settings.keyBindings.renameFile === undefined) {
        this.Settings.keyBindings.renameFile = this.DefaultSettings.keyBindings.renameFile;
        this.saveSettings();
      }
      return this.Settings.keyBindings.renameFile;
    }

    setRenamingFileKeyBinding(value) {
      this.Settings.keyBindings.renameFile = value;
    }

    getDeleteDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.deleteDocument === undefined) {
        this.Settings.keyBindings.deleteDocument = this.DefaultSettings.keyBindings.deleteDocument;
        this.saveSettings();
      }
      return this.Settings.keyBindings.deleteDocument;
    }

    setDeleteDocumentKeyBinding(value) {

      this.Settings.keyBindings.deleteDocument = value;
    }

    getOpenFileKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.openFile === undefined) {
        this.Settings.keyBindings.openFile = this.DefaultSettings.keyBindings.openFile;
        this.saveSettings();
      }
      return this.Settings.keyBindings.openFile;
    }

    setOpenFileKeyBinding(value) {

      this.Settings.keyBindings.openFile = value;
    }

    getOpenFileExternallyKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.openFileExternally === undefined) {
        this.Settings.keyBindings.openFileExternally = this.DefaultSettings.keyBindings.openFileExternally;
        this.saveSettings();
      }
      return this.Settings.keyBindings.openFileExternally;
    }

    setOpenFileExternallyKeyBinding(value) {

      this.Settings.keyBindings.openFileExternally = value;
    }

    getPropertiesDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.propertiesDocument === undefined) {
        this.Settings.keyBindings.propertiesDocument = this.DefaultSettings.keyBindings.propertiesDocument;
        this.saveSettings();
      }
      return this.Settings.keyBindings.propertiesDocument;
    }

    setPropertiesDocumentKeyBinding(value) {

      this.Settings.keyBindings.propertiesDocument = value;
    }

    getNextDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.nextDocument === undefined) {
        this.Settings.keyBindings.nextDocument = this.DefaultSettings.keyBindings.nextDocument;
        this.saveSettings();
      }
      return this.Settings.keyBindings.nextDocument;
    }

    setNextDocumentKeyBinding(value) {

      this.Settings.keyBindings.nextDocument = value;
    }

    getPrevDocumentKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.prevDocument === undefined) {
        this.Settings.keyBindings.prevDocument = this.DefaultSettings.keyBindings.prevDocument;
        this.saveSettings();
      }
      return this.Settings.keyBindings.prevDocument;
    }

    setShowTagLibraryKeyBinding(value) {

      this.Settings.keyBindings.showTagLibrary = value;
    }

    getShowTagLibraryKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.showTagLibrary === undefined) {
        this.Settings.keyBindings.showTagLibrary = this.DefaultSettings.keyBindings.showTagLibrary;
        this.saveSettings();
      }
      return this.Settings.keyBindings.showTagLibrary;
    }

    setShowFolderNavigatorKeyBinding(value) {

      this.Settings.keyBindings.showFolderNavigator = value;
    }

    getShowFolderNavigatorBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.showFolderNavigator === undefined) {
        this.Settings.keyBindings.showFolderNavigator = this.DefaultSettings.keyBindings.showFolderNavigator;
        this.saveSettings();
      }
      return this.Settings.keyBindings.showFolderNavigator;
    }

    setPrevDocumentKeyBinding(value) {

      this.Settings.keyBindings.prevDocument = value;
    }

    getOpenDevToolsScreenKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.openDevTools === undefined) {
        this.Settings.keyBindings.openDevTools = this.DefaultSettings.keyBindings.openDevTools;
        this.saveSettings();
      }
      return this.Settings.keyBindings.openDevTools;
    }

    setOpenDevToolsScreenKeyBinding(value) {

      this.Settings.keyBindings.openDevTools = value;
    }

    getSearchKeyBinding() {
      this._updateKeyBindingsSetting();
      if (this.Settings.keyBindings.openSearch === undefined) {
        this.Settings.keyBindings.openSearch = this.DefaultSettings.keyBindings.openSearch;
        this.saveSettings();
      }
      return this.Settings.keyBindings.openSearch;
    }

    setSearchKeyBinding(value) {

      this.Settings.keyBindings.openSearch = value;
    }

    getEnableGlobalKeyboardShortcuts() {
      if (this.Settings.enableGlobalKeyboardShortcuts === undefined) {
        this.Settings.enableGlobalKeyboardShortcuts = this.DefaultSettings.enableGlobalKeyboardShortcuts;
        this.saveSettings();
      }
      return this.Settings.enableGlobalKeyboardShortcuts;
    }

    setEnableGlobalKeyboardShortcuts(value) {

      this.Settings.enableGlobalKeyboardShortcuts = value;
    }

    getInterfaceLanguage() {
      if (this.Settings.interfaceLanguage === undefined) {
        this.Settings.interfaceLanguage = this.DefaultSettings.interfaceLanguage;
        this.saveSettings();
      }
      return this.Settings.interfaceLanguage;
    }

    setInterfaceLanguage(value) {

      this.Settings.interfaceLanguage = value;
    }

    getShowWarningRecursiveScan() {
      if (this.Settings.showWarningRecursiveScan === undefined) {
        this.Settings.showWarningRecursiveScan = this.DefaultSettings.showWarningRecursiveScan;
        this.saveSettings();
      }
      return this.Settings.showWarningRecursiveScan;
    }

    setShowWarningRecursiveScan(value) {
      this.Settings.showWarningRecursiveScan = value;
      this.saveSettings();
    }

    getShowMainMenu() {
      if (this.Settings.showMainMenu === undefined) {
        this.Settings.showMainMenu = this.DefaultSettings.showMainMenu;
      }
      return this.Settings.showMainMenu;
    }

    setShowMainMenu(value) {

      this.Settings.showMainMenu = value;
    }

    getWebDavPath() {
      if (this.Settings.webDavPath === undefined) {
        this.Settings.webDavPath = this.DefaultSettings.webDavPath;
      }
      return this.Settings.webDavPath;
    }

    setWebDavPath(value) {

      this.Settings.webDavPath = value;
    }

    getShowUnixHiddenEntries() {
      if (this.Settings.showUnixHiddenEntries === undefined) {
        this.Settings.showUnixHiddenEntries = this.DefaultSettings.showUnixHiddenEntries;
      }
      return this.Settings.showUnixHiddenEntries;
    }

    setShowUnixHiddenEntries(value) {

      this.Settings.showUnixHiddenEntries = value;
    }

    getCheckForUpdates() {
      if (this.Settings.checkForUpdates === undefined) {
        this.Settings.checkForUpdates = this.DefaultSettings.checkForUpdates;
      }
      return this.Settings.checkForUpdates;
    }

    setCheckForUpdates(value) {

      this.Settings.checkForUpdates = value;
    }

    getPrefixTagContainer() {
      if (this.Settings.prefixTagContainer === undefined) {
        this.Settings.prefixTagContainer = this.DefaultSettings.prefixTagContainer;
      }
      return this.Settings.prefixTagContainer;
    }

    setPrefixTagContainer(value) {

      this.Settings.prefixTagContainer = value;
    }

    getTagDelimiter() {
      if (this.Settings.tagDelimiter === undefined) {
        this.Settings.tagDelimiter = this.DefaultSettings.tagDelimiter;
      }
      return this.Settings.tagDelimiter;
    }

    setTagDelimiter(value) {

      this.Settings.tagDelimiter = value;
    }

    getCalculateTags() {
      if (this.Settings.calculateTags === undefined) {
        this.Settings.calculateTags = this.DefaultSettings.calculateTags;
      }
      return this.Settings.calculateTags;
    }

    setCalculateTags(value) {

      this.Settings.calculateTags = value;
    }

    getLoadLocationMeta() {
      if (this.Settings.loadLocationMeta === undefined) {
        this.Settings.loadLocationMeta = this.DefaultSettings.loadLocationMeta;
      }
      return this.Settings.loadLocationMeta;
    }

    setLoadLocationMeta(value) {

      this.Settings.loadLocationMeta = value;
    }

    getUseSearchInSubfolders() {
      if (this.Settings.useSearchInSubfolders === undefined) {
        this.Settings.useSearchInSubfolders = this.DefaultSettings.useSearchInSubfolders;
      }
      return this.Settings.useSearchInSubfolders;
    }

    setUseSearchInSubfolders(value) {
      this.Settings.useSearchInSubfolders = value;
    }

    getMaxSearchResultCount() {
      if (this.Settings.maxSearchResultCount === undefined) {
        this.Settings.maxSearchResultCount = this.DefaultSettings.maxSearchResultCount;
      }
      return this.Settings.maxSearchResultCount;
    }

    setMaxSearchResultCount(value) {
      if (isNaN(value) || value < 0) {
        value = this.DefaultSettings.maxSearchResultCount;
      } else if (value > 2000) {
        value = 2000;
      }
      this.Settings.maxSearchResultCount = value;
    }

    getDefaultThumbnailSize() {
      if (this.Settings.defaultThumbnailSize === undefined) {
        this.Settings.defaultThumbnailSize = this.DefaultSettings.defaultThumbnailSize;
      }
      return this.Settings.defaultThumbnailSize;
    }

    setDefaultThumbnailSize(value) {
      this.Settings.defaultThumbnailSize = value;
    }

    getDefaultThumbnailFormat() {
      if (this.Settings.defaultThumbnailFormat === undefined) {
        this.Settings.defaultThumbnailFormat = this.DefaultSettings.defaultThumbnailFormat;
      }
      return this.Settings.defaultThumbnailFormat;
    }

    setDefaultThumbnailFormat(value) {
      this.Settings.defaultThumbnailFormat = value;
    }

    getWatchCurrentDirectory() {
      if (this.Settings.watchCurrentDirectory === undefined) {
        this.Settings.watchCurrentDirectory = this.DefaultSettings.watchCurrentDirectory;
      }
      return this.Settings.watchCurrentDirectory;
    }

    setWatchCurrentDirectory(value) {
      this.Settings.watchCurrentDirectory = value;
    }

    getEnableMetaData() {
      if (this.Settings.enableMetaData === undefined) {
        this.Settings.enableMetaData = this.DefaultSettings.enableMetaData;
      }
      return this.Settings.enableMetaData;
    }

    setEnableMetaData(value) {

      this.Settings.enableMetaData = value;
    }

    getSupportedFileTypes() {
      if (this.Settings.supportedFileTypes === undefined) {
        this.Settings.supportedFileTypes = this.DefaultSettings.supportedFileTypes;
      }
      return this.Settings.supportedFileTypes;
    }

    setSupportedFileTypes(value) {

      this.Settings.supportedFileTypes = value;
    }

    getNewTextFileContent() {

      return this.DefaultSettings.newTextFileContent;
    }

    getNewHTMLFileContent() {

      return this.DefaultSettings.newHTMLFileContent;
    }

    getNewMDFileContent() {

      return this.DefaultSettings.newMDFileContent;
    }

    getUseTrashCan() {
      if (this.Settings.useTrashCan === undefined) {
        this.Settings.useTrashCan = this.DefaultSettings.useTrashCan;
      }
      return this.Settings.useTrashCan;
    }

    setUseTrashCan(value) {

      this.Settings.useTrashCan = value;
    }

    getUseOCR() {
      if (this.Settings.useOCR === undefined) {
        this.Settings.useOCR = this.DefaultSettings.useOCR;
      }
      return this.Settings.useOCR;
    }

    setUseOCR(value) {

      this.Settings.useOCR = value;
    }

    getUseTextExtraction() {
      if (this.Settings.useTextExtraction === undefined) {
        this.Settings.useTextExtraction = this.DefaultSettings.useTextExtraction;
      }
      return this.Settings.useTextExtraction;
    }

    setUseTextExtraction(value) {

      this.Settings.useTextExtraction = value;
    }

    getUseGenerateThumbnails() {
      if (this.Settings.useGenerateThumbnails === undefined) {
        this.Settings.useGenerateThumbnails = this.DefaultSettings.useGenerateThumbnails;
      }
      return this.Settings.useGenerateThumbnails;
    }

    setUseGenerateThumbnails(value) {

      this.Settings.useGenerateThumbnails = value;
    }

    getWriteMetaToSidecarFile() {
      if (this.Settings.writeMetaToSidecarFile === undefined) {
        this.Settings.writeMetaToSidecarFile = this.DefaultSettings.writeMetaToSidecarFile;
        this.saveSettings();
      }
      return this.Settings.writeMetaToSidecarFile;
    }

    setWriteMetaToSidecarFile(value) {

      this.Settings.writeMetaToSidecarFile = value;
    }

    getUseDefaultLocation() {
      if (this.Settings.useDefaultLocation === undefined) {
        this.Settings.useDefaultLocation = this.DefaultSettings.useDefaultLocation;
        this.saveSettings();
      }
      return this.Settings.useDefaultLocation;
    }

    setUseDefaultLocation(value) {

      this.Settings.useDefaultLocation = value;
    }

    getColoredFileExtensionsEnabled() {
      if (this.Settings.coloredFileExtensionsEnabled === undefined) {
        this.Settings.coloredFileExtensionsEnabled = this.DefaultSettings.coloredFileExtensionsEnabled;
        this.saveSettings();
      }
      return this.Settings.coloredFileExtensionsEnabled;
    }

    setColoredFileExtensionsEnabled(value) {

      this.Settings.coloredFileExtensionsEnabled = value;
    }

    getShowTagAreaOnStartup() {
      if (this.Settings.showTagAreaOnStartup === undefined) {
        this.Settings.showTagAreaOnStartup = this.DefaultSettings.showTagAreaOnStartup;
        this.saveSettings();
      }
      return this.Settings.showTagAreaOnStartup;
    }

    setShowTagAreaOnStartup(value) {

      this.Settings.showTagAreaOnStartup = value;
    }

    getDefaultTagColor() {
      if (this.Settings.defaultTagColor === undefined) {
        this.Settings.defaultTagColor = this.DefaultSettings.defaultTagColor;
        this.saveSettings();
      }
      return this.Settings.defaultTagColor;
    }

    setDefaultTagColor(value) {
      this.Settings.defaultTagColor = value;
    }

    getDefaultTagTextColor() {
      if (this.Settings.defaultTagTextColor === undefined) {
        this.Settings.defaultTagTextColor = this.DefaultSettings.defaultTagTextColor;
        this.saveSettings();
      }
      return this.Settings.defaultTagTextColor;
    }

    setDefaultTagTextColor(value) {
      this.Settings.defaultTagTextColor = value;
    }

    //////////////////// API methods ///////////////////
    getFileTypeEditor(fileTypeExt) {
      for (let i = 0; i < this.Settings.supportedFileTypes.length; i++) {
        if (this.Settings.supportedFileTypes[i].type === fileTypeExt) {
          return this.Settings.supportedFileTypes[i].editor;
        }
      }
      return false;
    }

    getFileTypeViewer(fileTypeExt) {
      for (let i = 0; i < this.Settings.supportedFileTypes.length; i++) {
        if (this.Settings.supportedFileTypes[i].type === fileTypeExt) {
          return this.Settings.supportedFileTypes[i].viewer;
        }
      }
      return false;
    }

    // Returns the tag information from the setting for a given tag
    findTag(tagName) {
      for (let i = 0; i < this.Settings.tagGroups.length; i++) {
        for (let j = 0; j < this.Settings.tagGroups[i].children.length; j++) {
          // console.log("Current tagname "+this.Settings.tagGroups[i].children[j].title);
          if (this.Settings.tagGroups[i].children[j].title === tagName) {
            return this.Settings.tagGroups[i].children[j];
          }
        }
      }
      return false;
    }

    getAllTags() {
      let allTags = [];
      for (let i = 0; i < this.Settings.tagGroups.length; i++) {
        // console.log("Current taggroup "+this.Settings.tagGroups[i].key);
        for (let j = 0; j < this.Settings.tagGroups[i].children.length; j++) {
          // console.log("Current tagname "+this.Settings.tagGroups[i].children[j].title);
          if (this.Settings.tagGroups[i].children[j].type === 'plain') {
            allTags.push(this.Settings.tagGroups[i].children[j].title);
          }
        }
      }
      return allTags;
    }

    getTagData(tagTitle, tagGroupKey) {
      for (let i = 0; i < this.Settings.tagGroups.length; i++) {
        if (this.Settings.tagGroups[i].key === tagGroupKey) {
          for (let j = 0; j < this.Settings.tagGroups[i].children.length; j++) {
            if (this.Settings.tagGroups[i].children[j].title === tagTitle) {
              return this.Settings.tagGroups[i].children[j];
            }
          }
        }
      }
    }

    getTagGroupData(tagGroupKey) {
      for (let i = 0; i < this.Settings.tagGroups.length; i++) {
        if (this.Settings.tagGroups[i].key === tagGroupKey) {
          return this.Settings.tagGroups[i];
        }
      }
    }

    getAllTagGroupData() {
      if (this.Settings.tagGroups.length > 0) {
        return this.Settings.tagGroups;
      }
    }

    deleteTagGroup(tagData) {
      for (let i = 0; i < this.Settings.tagGroups.length; i++) {
        if (this.Settings.tagGroups[i].key === tagData.key) {
          console.log('Deleting taggroup ' + this.Settings.tagGroups[i].key);
          this.Settings.tagGroups.splice(i, 1);
          break;
        }
      }
      this.saveSettings();
    }

    editTag(tagData, newTagName, newColor, newTextColor, newKeyBinding) {
      for (let i = 0; i < this.Settings.tagGroups.length; i++) {
        if (this.Settings.tagGroups[i].key === tagData.parentKey) {
          for (let j = 0; j < this.Settings.tagGroups[i].children.length; j++) {
            if (this.Settings.tagGroups[i].children[j].title === tagData.title) {
              this.Settings.tagGroups[i].children[j].title = newTagName;
              this.Settings.tagGroups[i].children[j].color = newColor;
              this.Settings.tagGroups[i].children[j].textcolor = newTextColor;
              this.Settings.tagGroups[i].children[j].keyBinding = newKeyBinding;
              break;
            }
          }
        }
      }
      this.saveSettings();
    }

    deleteTag(tagData) {
      for (let i = 0; i < this.Settings.tagGroups.length; i++) {
        if (this.Settings.tagGroups[i].key === tagData.parentKey) {
          for (let j = 0; j < this.Settings.tagGroups[i].children.length; j++) {
            if (this.Settings.tagGroups[i].children[j].title === tagData.title) {
              this.Settings.tagGroups[i].children.splice(j, 1);
              break;
            }
          }
        }
      }
      exports.saveSettings();
    }

    moveTag(tagData, targetTagGroupKey) {
      let targetTagGroupData = getTagGroupData(targetTagGroupKey);
      if (createTag(targetTagGroupData, tagData.title, tagData.color, tagData.textcolor)) {
        deleteTag(tagData);
        this.saveSettings();
      }
    }

    createTag(tagData, newTagName, newTagColor, newTagTextColor) {
      this.Settings.tagGroups.forEach((value) => {
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

    editTagGroup(tagData, tagGroupName, tagGroupColor, tagGroupTextColor, propagateColorToTags) {
      for (let i = 0; i < this.Settings.tagGroups.length; i++) {
        if (this.Settings.tagGroups[i].key === tagData.key) {
          this.Settings.tagGroups[i].title = tagGroupName;
          this.Settings.tagGroups[i].color = tagGroupColor;
          this.Settings.tagGroups[i].textcolor = tagGroupTextColor;
          if (propagateColorToTags) {
            for (let j = 0; j < this.Settings.tagGroups[i].children.length; j++) {
              this.Settings.tagGroups[i].children[j].color = tagGroupColor;
              this.Settings.tagGroups[i].children[j].textcolor = tagGroupTextColor;
            }
          }
          break;
        }
      }
      this.saveSettings();
    }

    duplicateTagGroup(tagData, tagGroupName, tagGroupKey) {
      let newTagGroupModel;
      for (let i = 0; i < this.Settings.tagGroups.length; i++) {
        if (this.Settings.tagGroups[i].key === tagData.key) {
          newTagGroupModel = JSON.parse(JSON.stringify(this.Settings.tagGroups[i]));
          break;
        }
      }
      newTagGroupModel.title = tagGroupName;
      newTagGroupModel.key = tagGroupKey;
      console.log('Creating taggroup: ' + JSON.stringify(newTagGroupModel) + ' with key: ' + tagGroupKey);
      this.Settings.tagGroups.push(newTagGroupModel);
      this.saveSettings();
    }

    sortTagGroup(tagData) {
      for (let i = 0; i < this.Settings.tagGroups.length; i++) {
        if (this.Settings.tagGroups[i].key === tagData.key) {
          this.Settings.tagGroups[i].children.sort((a, b) => {
            return a.title.localeCompare(b.title);
          });
          break;
        }
      }
      this.saveSettings();
    }

    createTagGroup(tagData, tagGroupName, tagGroupColor, tagGroupTextColor) {
      let newTagGroupModel = JSON.parse(JSON.stringify(tagGroupTemplate));
      newTagGroupModel.title = tagGroupName;
      newTagGroupModel.color = tagGroupColor;
      newTagGroupModel.textcolor = tagGroupTextColor;
      //newTagGroupModel.children = [];
      newTagGroupModel.key = '' + TSCORE.Utils.getRandomInt(10000, 99999);
      console.log('Creating taggroup: ' + JSON.stringify(newTagGroupModel) + ' with key: ' + newTagGroupModel.key);
      this.Settings.tagGroups.push(newTagGroupModel);
      this.saveSettings();
    }

    moveTagGroup(tagData, direction) {
      let targetPosition;
      let currentPosition;
      this.Settings.tagGroups.forEach((value, index) => {
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
      if (targetPosition < 0 || targetPosition >= this.Settings.tagGroups.length || targetPosition === currentPosition) {
        return false;
      }
      let tmpTagGroup = this.Settings.tagGroups[currentPosition];
      this.Settings.tagGroups[currentPosition] = this.Settings.tagGroups[targetPosition];
      this.Settings.tagGroups[targetPosition] = tmpTagGroup;
      this.saveSettings();
    }

    createLocation(name, location, perspectiveId) {
      let newLocationModel = JSON.parse(JSON.stringify(locationTemplate));
      name = name.replace('\\', '\\\\');
      name = name.replace('\\\\\\', '\\\\');
      name = name.replace('\\\\\\\\', '\\\\');
      newLocationModel.name = name;
      newLocationModel.path = location;
      newLocationModel.perspective = perspectiveId;
      let createLoc = true;
      this.Settings.tagspacesList.forEach((value) => {
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
        this.Settings.tagspacesList.push(newLocationModel);
        this.saveSettings();
      }
    }

    editLocation(oldName, newName, newLocation, perspectiveId) {
      //        name = name.replace("\\", "\\\\");
      //        name = name.replace("\\\\\\", "\\\\");
      //        name = name.replace("\\\\\\\\", "\\\\");
      console.log('Old Name: ' + oldName + ' New Name: ' + newName + ' New Loc: ' + newLocation);
      let editLoc = true;
      this.Settings.tagspacesList.forEach((value) => {
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
        this.Settings.tagspacesList.forEach((value) => {
          if (value.name === oldName) {
            value.name = newName;
            value.path = newLocation;
            value.perspective = perspectiveId;
          }
        });
        this.saveSettings();
      }
    }

    getLocation(path) {
      let location;
      this.Settings.tagspacesList.forEach((value) => {
        if (value.path === path) {
          location = value;
        }
      });
      return location;
    }

    deleteLocation(name) {
      for (let i = 0; i < this.Settings.tagspacesList.length; i++) {
        console.log('Traversing connections ' + this.Settings.tagspacesList[i].name + ' searching for ' + name);
        if (this.Settings.tagspacesList[i].name === name) {
          console.log('Deleting connections ' + this.Settings.tagspacesList[i].name);
          this.Settings.tagspacesList.splice(i, 1);
          break;
        }
      }
      this.saveSettings();
    }

    updateSettingMozillaPreferences(settings) {
      let tmpSettings = JSON.parse(settings);
      if (tmpSettings !== null) {
        this.Settings = tmpSettings;
        console.log('Settings loaded from firefox preferences: ' + tmpSettings);
      } else {
        this.Settings = this.DefaultSettings;
        console.log('Default settings loaded(Firefox)!');
      }
      this.saveSettings();
    }

    loadDefaultSettings() {
      this.Settings = this.DefaultSettings;
      this.saveSettings();
      TSCORE.reloadUI();
      console.log('Default settings loaded.');
    }

    restoreDefaultTagGroups() {
      this.DefaultSettings.tagGroups.forEach((value, index) => {
        this.Settings.tagGroups.push(this.DefaultSettings.tagGroups[index]);
        this.Settings.tagGroups[index].key = TSCORE.Utils.guid();
      });
      this.saveSettings();
      TSCORE.generateTagGroups();
      TSCORE.showSuccessDialog($.i18n.t('ns.dialogs:recreateDefaultSuccessMessage'));
    }

    loadSettingsLocalStorage() {
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
          this.Settings = tmpSettings;
        } else {
          // If no settings found in the local storage,
          // the application runs for the first time.
          firstRun = true;
        }
        console.log('Loaded settings from local storage: '); //+ JSON.stringify(this.Settings));
      } catch (ex) {
        console.log('Loading settings from local storage failed due exception: ' + ex);
      }
    }

    // Save setting
    saveSettings() {
      // TODO Make a file based json backup
      // Making a backup of the last settings
      localStorage.setItem('tagSpacesSettingsBackup1', localStorage.getItem('tagSpacesSettings'));
      // Storing setting in the local storage of mozilla and chorme
      localStorage.setItem('tagSpacesSettings', JSON.stringify(this.Settings));
      // Storing settings in firefox native preferences
      if (isFirefox || isChrome || isCordova) {
        TSCORE.IO.saveSettings(JSON.stringify(this.Settings));
        if (isCordova) {
          TSCORE.IO.saveSettingsTags(JSON.stringify(this.Settings.tagGroups));
        }
      }
      console.log('Tagspace Settings Saved!');
    }

    _updateKeyBindingsSetting() {
      if (this.Settings.keyBindings === undefined) {
        this.Settings.keyBindings = this.DefaultSettings.keyBindings;
        this.saveSettings();
      }
    }

    exportTagGroups() {
      let jsonFormat = '{ "appName": "' + this.DefaultSettings.appName +
        '", "appVersion": "' + this.DefaultSettings.appVersion +
        '", "appBuild": "' + this.DefaultSettings.appBuild +
        '", "settingsVersion": ' + this.DefaultSettings.settingsVersion +
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
