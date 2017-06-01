/* Copyright (c) 2012-present The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars, isCordova  */
define((require, exports, module) => {
  'use strict';

  console.log('Loading directories.ui.js ...');

  const TSCORE = require('tscore');
  const tsExtManager = require('tsextmanager');

  const homeFolderTitle = 'Home';
  let directoryHistory = [];
  let metaTagGroupsHistory = null;
  let dir4ContextMenu = null;
  let folderPropertiesOpened = false;

  let alternativeDirectoryNavigatorTmpl = Handlebars.compile(
    '{{#each dirHistory}}' +
    '<div class="btn-group">' +
    '  <button class="btn btn-link dropdown-toggle" data-path="{{path}}"  data-menu="{{@index}}">' +
    '    <div class="altNavFolderTitle">' +
    '      <span style="{{#if @last}} padding-right: 0 !important; color: black; {{/if}} padding-right: 5px; padding-left: 1px;">{{name}}</span>' +
    '      <i {{#if @last}} style="display: none;" {{/if}} class="fa fa-caret-right"></i>' +
    '    </div>' +
    '  </button>' +
    '  <div class="dropdown clearfix dirAltNavMenu" id="dirMenu{{@index}}" data-path="{{path}}">' +
    '    <ul role="menu" class="dropdown-menu">' +
    '      <li class="dropdown-header"><button class="close">&times;</button><span data-i18n="ns.common:actionsForDirectory2"></span>&nbsp;"{{name}}"</li>' +
    '      <li><a class="btn btn-link reloadCurrentDirectory" data-path="{{path}}" style="text-align: left"><i class="fa fa-refresh fa-fw fa-lg"></i><span data-i18n="ns.common:reloadCurrentDirectory"></span></a></li>' +
    '      <li><a class="btn btn-link createSubdirectory" data-path="{{path}}" style="text-align: left"><i class="fa fa-folder-o fa-fw fa-lg"></i><span data-i18n="ns.common:createSubdirectory"></span></a></li>' +
    '      <li><a class="btn btn-link renameDirectory" data-path="{{path}}" style="text-align: left"><i class="fa fa-paragraph fa-fw fa-lg"></i><span data-i18n="ns.common:renameDirectory"></span></a></li>' +
    '      <li class="divider" style="width: 100%"></li>' +
    '      <li class="dropdown-header"><span data-i18n="ns.common:subfodersOfDirectory2"></span>&nbsp;"{{name}}"</li>' +
    '      <div class="dirButtonContainer">' +
    '{{#if children}}' +
    '{{#each children}}' +
    '        <button class="btn dirButton" data-path="{{path}}" title="{{path}}"><i class="fa fa-folder-o"></i>&nbsp;{{name}}</button>' +
    '{{/each}}' +
    '{{else}}' +
    '        <div>&nbsp;&nbsp;&nbsp;<span data-i18n="ns.common:noSubfoldersFound"></span></div>' +
    '{{/if}}' +
    '      </div>' +
    '     </ul>' +
    '   </div>' +
    '</div>' +
    '{{/each}}' +
    '<button class="btn btn-link" data-i18n="[title]ns.common:folderPropertiesTooltip" id="toggleFolderProperitesButton"><i class="fa fa-info fa-lg"></i></button>' +
    ''
  );

  let mainDirectoryNavigatorTmpl = Handlebars.compile(
    '<div>{{#each dirHistory}}' +
    '  <div class="accordion-group disableTextSelection">' +
    '    <div class="accordion-heading btn-group flexLayout" data-path="{{path}}">' +
    '      <button class="btn btn-link btn-lg directoryIcon" data-toggle="collapse" data-target="#dirButtons{{@index}}" data-path="{{path}}" title="{{../toggleDirectory}}">' +
    '        <i class="fa fa-folder fa-fw"></i>' +
    '      </button>' +
    '      <button class="btn btn-link directoryTitle ui-droppable flexMaxWidth" data-path="{{path}}" title="{{path}}">{{name}}</button>' +
    '      <button class="btn btn-link btn-lg directoryActions" data-path="{{path}}" title="{{../directoryOperations}}">' +
    '        <b class="fa fa-ellipsis-v"></b>' +
    '      </button>' +
    '    </div>' +
    '    <div class="accordion-body collapse in" id="dirButtons{{@index}}">' +
    '      <div class="accordion-inner" id="dirButtonsContent{{@index}}" style="padding: 4px; padding-top: 0;">' +
    '        <div class="dirButtonContainer">' +
    '          <button class="btn btn-sm btn-default dirButton parentDirectoryButton" data-path="{{path}}/.." title="Go to parent folder">' +
    '            <i class="fa fa-level-up"></i>' +
    '          </button>' +
    '      {{#if children}}' +
    '        {{#each children}}' +
    '          <button class="btn btn-sm btn-default dirButton ui-droppable" data-path="{{path}}" title="{{path}}">' +
    '            <div><i class="fa fa-folder-o"></i>&nbsp;{{name}}</div>' +
    '          </button>' +
    '        {{/each}}' +
    '      {{else}}' +
    '          <div>&nbsp;&nbsp;&nbsp;{{../../noSubfoldersFound}}</div>' +
    '      {{/if}}' +
    '        </div>' +
    '        <div class="directoryTagsArea" data-path="{{path}}" style="padding: 4px; padding-left: 0; "></div>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '{{/each}}</div>'
  );

  let locationChooserTmpl = Handlebars.compile(
    '<li class="dropdown-header"><button class="close">&times;</button></li>' +
    '<li class="flexLayout">' +
    '  <button style="text-align: left;" class="btn btn-link flexMaxWidth" id="createNewLocation">' +
    '    <i class="fa fa-plus"></i>&nbsp;<span data-i18n="[title]ns.common:connectNewLocationTooltip;ns.common:connectNewLocationTooltip">{{connectLocation}}</span>' +
    '  </button>' +
    '</li>' +
    '<li class="divider"></li>' +
    '<li class="dropdown-header" data-i18n="ns.common:yourLocations">{{yourLocations}}</li>' +
    '{{#each locations}}' +
    '<li class="flexLayout">' +
    '  <button title="{{path}}" path="{{path}}" name="{{name}}" class="btn btn-link openLocation">' +
    '{{#if isDefault}}' +
    '    <i style="color: darkred" class="fa fa-bookmark" data-i18n="[title]ns.dialogs:startupLocation"></i>' +
    '{{else}}' +
    '    <i class="fa fa-bookmark"></i>' +
    '{{/if}}' +
    '  <span class="locationName">{{name}}</span></button>' +
    '  <button type="button" data-i18n="[title]ns.common:editLocation" title="{{editLocationTitle}}" location="{{name}}" path="{{path}}" class="btn btn-link pull-right editLocation">' +
    '    <i class="fa fa-pencil fa-lg"></i>' +
    '  </button>' +
    '</li>' +
    '{{/each}}'
  );

  class TSDirectoriesUI {

    static openLocation(path) {
      let originalPath = path;
      console.log('Opening location in : ' + path);

      TSCORE.currentLocationObject = TSCORE.Config.getLocation(path);

      // Add current application path to the relative path of the location in portable desktop mode
      if (isElectron && __dirname && path.indexOf(".") === 0) {
        if (path.indexOf("..") === 0) {
          path = pathUtils.normalize(pathUtils.dirname(pathUtils.dirname(__dirname)) + TSCORE.dirSeparator + path);
        } else {
          path = pathUtils.normalize(pathUtils.dirname(pathUtils.dirname(__dirname)) + path.substring(1, path.length));
        }
      }

      if (TSCORE.currentLocationObject !== undefined) {
        document.title = TSCORE.currentLocationObject.name + ' | ' + TSCORE.Config.getAppFullName();
        $('#locationName').removeAttr("data-i18n");
        $('#locationName').text(TSCORE.currentLocationObject.name).attr('title', path);
        // Handle open default perspective for a location
        let defaultPerspective = TSCORE.currentLocationObject.perspective;
        let activatedPerspectives = TSCORE.Config.getActivatedPerspectives();

        // Checking if specified perspective available
        let perspectiveFound;
        activatedPerspectives.forEach((perspective) => {
          if (perspective.id === defaultPerspective) {
            perspectiveFound = true;
          }
        });

        if (perspectiveFound) {
          TSCORE.PerspectiveManager.changePerspective(defaultPerspective);
        } else if (activatedPerspectives.length > 0) {
          TSCORE.PerspectiveManager.changePerspective(activatedPerspectives[0].id);
        }

        // Saving the last opened location path in the settings
        TSCORE.Config.setLastOpenedLocation(originalPath);

        if ($('#defaultLocation').prop('checked') === true || $('#defaultLocationEdit').prop('checked') === true) {
          // console.log("set default path " + path);
          TSCORE.Config.setDefaultLocation(path);
          $('#defaultLocation').prop('checked', false);
          $('#defaultLocationEdit').prop('checked', false);
        }

        TSCORE.Config.saveSettings();
      }
      // Clear search query
      TSCORE.clearSearchFilter();
      // Clears the directory history
      directoryHistory = [];
      this.navigateToDirectory(path);
      if (TSCORE.Config.getShowTagAreaOnStartup()) {
        TSCORE.showTagsPanel();
      } else {
        TSCORE.showLocationsPanel();
      }
    }

    static getDirHistoryItem(path) {
      for (let i = 0; i < directoryHistory.length; i++) {
        if (directoryHistory[i].path === path) {
          return directoryHistory[i];
        }
      }
    }

    static _loadFolderMetaData(path, element) {
      let historyItem = this.getDirHistoryItem(path);
      TSCORE.Meta.loadFolderMetaDataPromise(path).then((metaData) => {
        historyItem.metaData = metaData;
        if (historyItem.metaData.perspectives) {
          TSCORE.PerspectiveManager.changePerspective(historyItem.metaData.perspectives);
        }
        this.generateFolderTags(metaData.tags, element);
        this._loadMetaTagGroups(historyItem.metaData);
      }).catch((err) => {
        console.log("_loadFolderMetaData: " + err);
        this.generateFolderTags(null, element);
      });
    }

    static _loadMetaTagGroups(metaData) {
      //Load tagGroups only from location folder
      if (TSCORE.Config.getLastOpenedLocation().indexOf(TSCORE.currentPath) >= 0) {
        if (metaTagGroupsHistory) {
          metaTagGroupsHistory.forEach((value) => {
            TSCORE.Config.deleteTagGroup(value);
          });
        }
        metaTagGroupsHistory = metaData.tagGroups;
        if (metaTagGroupsHistory) {
          metaData.tagGroups.forEach((value) => {
            TSCORE.Config.addTagGroup(value);
          });
        }
        TSCORE.generateTagGroups(metaData.tagGroups);
      }
    }

    static generateFolderTags(tags, $directoryTagsArea) {
      if ($directoryTagsArea) {
        $directoryTagsArea.empty();
      }

      let tagString = '';
      if (tags) {
        tags.forEach((value, index) => {
          if (index === 0) {
            tagString = value.title;
          } else {
            tagString = tagString + ',' + value.title;
          }
        });

        let genTagsBtns = TSCORE.generateTagButtons(tagString);
        if (genTagsBtns) {
          $directoryTagsArea.append(genTagsBtns);
        }
      }

      if (TSCORE.PRO && TSCORE.PRO.Directory) {
        TSCORE.PRO.Directory.setContextMenu($directoryTagsArea);
      }
      $("#locationContent .dropDownIcon").hide();
    }

    static updateSubDirs(dirList) {
      //console.log("Updating subdirs(TSCORE)..."+JSON.stringify(dirList));
      let hasSubFolders = false;
      for (let i = 0; i < directoryHistory.length; i++) {
        if (directoryHistory[i].path === TSCORE.currentPath) {
          directoryHistory[i].children = [];
          for (let j = 0; j < dirList.length; j++) {
            if (!dirList[j].isFile) {
              if (TSCORE.Config.getShowUnixHiddenEntries() || !TSCORE.Config.getShowUnixHiddenEntries() && dirList[j].name.indexOf('.') !== 0) {
                directoryHistory[i].children.push(dirList[j]);
                hasSubFolders = true;
              }
            }
          }
          // Sort the dirList alphabetically
          directoryHistory[i].children.sort((a, b) => {
            return a.name.localeCompare(b.name);
          });
        }
      }
      this._generateDirPath();
      generateAlternativeDirPath();
      this._handleDirCollapsion();
    }

    static _generateAlternativeDirPath() {
      console.log('Generating Alternative Directory Path...');

      let $alternativeNavigator = $('#alternativeNavigator');
      $alternativeNavigator.children().remove();

      $alternativeNavigator.html(alternativeDirectoryNavigatorTmpl({
        'dirHistory': directoryHistory
      }));

      $alternativeNavigator.find('.reloadCurrentDirectory').on('click', () => {
        navigateToDirectory($(this).attr('data-path'));
      });

      $alternativeNavigator.find('.createSubdirectory').on('click', function() {
        showCreateDirectoryDialog($(this).attr('data-path'));
      });

      $alternativeNavigator.find('.renameDirectory').on('click', function() {
        _showRenameDirectoryDialog($(this).attr('data-path'));
      });

      $alternativeNavigator.find('.dropdown-toggle').on('contextmenu', function() {
        TSCORE.hideAllDropDownMenus();
        $('#dirMenu' + $(this).attr('data-menu')).css("display", "block");
        return false;
      });

      $alternativeNavigator.find('.dropdown-toggle').on('click', function() {
        TSCORE.hideAllDropDownMenus();
        navigateToDirectory($(this).attr('data-path'));
        return false;
      });

      $alternativeNavigator.find('.close').on("click", function() {
        TSCORE.hideAllDropDownMenus();
      });

      $alternativeNavigator.find('.dirButton').on("click", function() {
        navigateToDirectory($(this).attr('data-path'));
      });

      if ($alternativeNavigator.i18n) {
        $alternativeNavigator.i18n();
      }

      $('#toggleFolderProperitesButton').on('click', this._toggleFolderProperties);

      if (folderPropertiesOpened) {
        $('#toggleFolderProperitesButton').addClass('buttonToggled');
      } else {
        $('#toggleFolderProperitesButton').removeClass('buttonToggled');
      }
    }

    static _generateDirPath() {
      console.log('Generating Directory Path...');
      let $locationContent = $('#locationContent');
      $locationContent.children().remove();
      $locationContent.html(mainDirectoryNavigatorTmpl({
        'dirHistory': directoryHistory,
        'noSubfoldersFound': $.i18n.t('ns.common:noSubfoldersFound'),
        'toggleDirectory': $.i18n.t('ns.common:toggleDirectory'),
        'directoryOperations': $.i18n.t('ns.common:directoryOperations')
      }));
      $locationContent.find('.directoryTitle').each(() => {
        this._loadFolderMetaData($(this).data('path'), $(this).parent().parent().find('.directoryTagsArea'));
        $(this).click(() => {
          navigateToDirectory($(this).data('path'));
        }).droppable({
          greedy: 'true',
          accept: '.fileTitleButton,.fileTile,.fileTileSelector,.fileInfoArea',
          hoverClass: 'dropOnFolder',
          drop: (event, ui) => {
            ui.draggable.detach();
            let filePath = ui.draggable.attr('filepath');
            let fileName = TSCORE.TagUtils.extractFileName(filePath);
            let targetDir = $(this).data('path');
            console.log('Moving file: ' + filePath + ' to ' + targetDir);
            let newFilePath = targetDir + TSCORE.dirSeparator + fileName;
            TSCORE.IO.renameFilePromise(filePath, newFilePath).then((success) => {
              TSCORE.hideWaitingDialog();
              TSCORE.IOUtils.renameFileSuccess(filePath, newFilePath);
            }, (err) => {
              TSCORE.hideWaitingDialog();
              TSCORE.showAlertDialog(err);
            });
            $(ui.helper).remove();
          }
        });
      });
      $locationContent.find('.dirButton').each(() => {
        $(this).click(() => {
          navigateToDirectory($(this).data('path'));
        }).droppable({
          greedy: 'true',
          accept: '.fileTitleButton,.fileTile,.fileTileSelector,.fileInfoArea',
          hoverClass: 'dropOnFolder',
          drop: (event, ui) => {
            ui.draggable.detach();
            // Fixing issue with dropping on stacked/overlapped directories
            if ($(this).parent().parent().parent().hasClass('in')) {
              let filePath = ui.draggable.attr('filepath');
              let fileName = TSCORE.TagUtils.extractFileName(filePath);
              let targetDir = $(this).data('path');
              console.log('Moving file: ' + filePath + ' to ' + targetDir);
              let newFilePath = targetDir + TSCORE.dirSeparator + fileName;
              TSCORE.IO.renameFilePromise(filePath, newFilePath).then((success) => {
                TSCORE.hideWaitingDialog();
                TSCORE.IOUtils.renameFileSuccess(filePath, newFilePath);
              }, (err) => {
                TSCORE.hideWaitingDialog();
                TSCORE.showAlertDialog(err);
              });
              $(ui.helper).remove();
            }
          }
        });
      });
    }

    static _handleDirCollapsion() {
      $('#locationContent').find('.accordion-heading').each(() => {
        let key = $(this).data('path');
        console.log('Entered Header for: ' + key);
        if (getDirectoryCollapsed(key)) {
          $(this).find('i').removeClass('fa-folder-open');
          $(this).find('i').addClass('fa-folder');
          $(this).next().removeClass('in');
          $(this).next().addClass('out');
        } else {
          $(this).find('i').removeClass('fa-folder');
          $(this).find('i').addClass('fa-folder-open');
          $(this).next().removeClass('out');
          $(this).next().addClass('in');
        }
      });
    }

    static _getDirectoryCollapsed(directoryPath) {
      for (let i = 0; i < directoryHistory.length; i++) {
        if (directoryHistory[i].path === directoryPath) {
          return directoryHistory[i].collapsed;
        }
      }
    }

    static _setDirectoryCollapse(directoryPath, collapsed) {
      for (let i = 0; i < directoryHistory.length; i++) {
        if (directoryHistory[i].path === directoryPath) {
          directoryHistory[i].collapsed = collapsed;
        }
      }
    }

    static navigateToDirectory(directoryPath) {
      console.log('Navigating to directory: ' + directoryPath);
      let indexOfDots = directoryPath.indexOf("/..");
      if (indexOfDots === (directoryPath.length - 3)) {
        directoryPath = TSCORE.TagUtils.extractParentDirectoryPath(directoryPath.substring(0, indexOfDots));
      }

      // Clearing search results on directory change
      TSCORE.clearSearchFilter();
      // Cleaning the directory path from \\ \ and / 
      if (directoryPath.lastIndexOf('/') + 1 === directoryPath.length || directoryPath.lastIndexOf('\\') + 1 === directoryPath.length) {
        directoryPath = directoryPath.substring(0, directoryPath.length - 1);
      }
      if (directoryPath.lastIndexOf('\\\\') + 1 === directoryPath.length) {
        directoryPath = directoryPath.substring(0, directoryPath.length - 2);
      }
      let directoryFoundOn = -1;
      for (let i = 0; i < directoryHistory.length; i++) {
        if (directoryHistory[i].path === directoryPath) {
          directoryHistory[i].collapsed = false;
          directoryFoundOn = i;
        } else {
          directoryHistory[i].collapsed = true;
        }
      }
      // Removes the history only if it is a completely new path
      if (directoryFoundOn >= 0) {
        let diff1 = directoryHistory.length - (directoryFoundOn + 1);
        if (diff1 > 0) {
          directoryHistory.splice(directoryFoundOn + 1, diff1);
        }
      }
      // If directory path not in history then add it to the history
      if (directoryFoundOn < 0) {
        // var parentLocation = directoryPath.substring(0, directoryPath.lastIndexOf(TSCORE.dirSeparator));
        let parentLocation = TSCORE.TagUtils.extractParentDirectoryPath(directoryPath);
        let parentFound = -1;
        for (let j = 0; j < directoryHistory.length; j++) {
          if (directoryHistory[j].path === parentLocation) {
            parentFound = j;
          }
        }
        if (parentFound >= 0) {
          let diff2 = directoryHistory.length - (parentFound + 1);
          if (diff2 > 0) {
            directoryHistory.splice(parentFound + 1, diff2);
          }
        }
        let locationTitle = directoryPath.substring(directoryPath.lastIndexOf(TSCORE.dirSeparator) + 1, directoryPath.length);
        //ios workarround for empty directory title
        if (isCordovaiOS && locationTitle.length === 0) {
          locationTitle = homeFolderTitle;
        }
        directoryHistory.push({
          'name': locationTitle,
          'path': directoryPath,
          'collapsed': false
        });
      }
      console.log('Dir History: ' + JSON.stringify(directoryHistory));
      TSCORE.currentPath = directoryPath;

      this._initFolderProperties();

      TSCORE.Meta.getDirectoryMetaInformation().then((dirList) => {
        TSCORE.metaFileList = dirList;
        this._listDirectory(directoryPath);
      }).catch((error) => {
        console.log("Error getting meta information " + error);
        TSCORE.metaFileList = [];
        this._listDirectory(directoryPath);
      });
    }

    static _listDirectory(dirPath) {
      TSCORE.showLoadingAnimation();
      //TSCORE.PerspectiveManager.removeAllFiles();
      TSCORE.IO.listDirectoryPromise(dirPath).then((entries) => {
        TSCORE.PerspectiveManager.updateFileBrowserData(entries);
        TSCORE.updateSubDirs(entries)
        TSCORE.hideLoadingAnimation();
        console.log("Listing: " + dirPath + " done!");

        // TODO enable after adding switch in the settings, disabling recursion does not work on windows
        // Disable watching on file operations with many fiels (copy, delete, rename, move)
        if (TSCORE.IO.watchDirectory && TSCORE.Config.getWatchCurrentDirectory()) {
          TSCORE.IO.watchDirectory(dirPath, () => {
            this._listDirectory(TSCORE.currentPath);
          });
        }
      }).catch((err) => {
        // Normalazing the paths
        let dir1 = TSCORE.TagUtils.cleanTrailingDirSeparator(TSCORE.currentLocationObject.path);
        let dir2 = TSCORE.TagUtils.cleanTrailingDirSeparator(dirPath);
        // Close the current location if the its path could not be opened
        if (dir1 === dir2) {
          TSCORE.showAlertDialog($.i18n.t('ns.dialogs:errorOpeningLocationAlert'));
          TSCORE.closeCurrentLocation();
        } else {
          TSCORE.showAlertDialog($.i18n.t('ns.dialogs:errorOpeningPathAlert'));
        }      
        console.log("Error listing directory " + dirPath + " - " + err);
      });

      if (TSCORE.PRO && TSCORE.Config.getEnableMetaData()) {
        TSCORE.Meta.createMetaFolderPromise(dirPath);
      }
    }

    static initUI() {
      // Context Menus
      $('body').on('contextmenu click', '.directoryActions', () => {
        TSCORE.hideAllDropDownMenus();
        dir4ContextMenu = $(this).data('path');
        TSCORE.showContextMenu('#directoryMenu', $(this));
        return false;
      });

      $('#directoryMenuReloadDirectory').on('click', () => {
        this.navigateToDirectory(dir4ContextMenu);
      });

      $('#directoryMenuCreateDirectory').on('click', () => {
        this.showCreateDirectoryDialog(dir4ContextMenu);
      });

      $('#directoryMenuRenameDirectory').on('click', () => {
        this._showRenameDirectoryDialog(dir4ContextMenu);
      });

      $('#directoryMenuDeleteDirectory').on('click', () => {
        let dlgConfirmMsgId = 'ns.dialogs:deleteDirectoryContentConfirm';
        if (TSCORE.Config.getUseTrashCan()) {
          dlgConfirmMsgId = 'ns.pro:trashDirectoryContentConfirm';
        }
        TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:deleteDirectoryTitleConfirm'), $.i18n.t(dlgConfirmMsgId, {
          dirPath: dir4ContextMenu
        }), () => {
          TSCORE.IO.deleteDirectoryPromise(dir4ContextMenu).then(() => {
              TSCORE.showSuccessDialog("Directory deleted successfully.");
              TSCORE.navigateToDirectory(TSCORE.TagUtils.extractParentDirectoryPath(dir4ContextMenu));
              TSCORE.hideLoadingAnimation();
            },
            (error) => {
              TSCORE.hideLoadingAnimation();
              console.error("Deleting directory " + dir4ContextMenu + " failed " + error);
              TSCORE.showAlertDialog($.i18n.t('ns.dialogs:errorDeletingDirectoryAlert'));
              TSCORE.hideLoadingAnimation();
            }
          );
        });
      });

      $('#directoryMenuOpenDirectory').on('click', () => {
        TSCORE.IO.openDirectory(dir4ContextMenu);
      });

      $('#locationSwitch').on('click', () => {
        TSCORE.UI.stopGettingStartedTour();
      });

      $('#editFolderDescriptionButton').on('click', this._editFolderDescription);

      $('#cancelEditFolderDescriptionButton').on('click', this._cancelEditFolderDescription);

      $('#saveFolderDescriptionButton').on('click', this._saveFolderDescription);

    }

    static _saveFolderTags(event) {
      let newTags = $(this).val();
      console.log("Tags: " + newTags);
      TSCORE.Meta.loadFolderMetaDataPromise(TSCORE.currentPath).then((metaData) => {
        newTags = newTags.split(",");
        metaData.tags = TSCORE.PRO.Directory.generateTags(newTags);
        TSCORE.PRO.Directory.saveMetaData(metaData);
      }).catch((err) => {
        console.warn("Error getting folder metadata, saving folder tags failed.");
      });
    }

    static _initFolderProperties() {
      $('#folderPathProperty').val(TSCORE.currentPath);

      $('#folderTagsProperty').off();
      $("#folderTagsProperty").val("");
      $('#folderTagsProperty').select2('data', null);

      this._cancelEditFolderDescription();
      $('#folderDescriptionPropertyRendered').empty();
      $('#folderDescriptionPropertyRendered').css("height", "0");
      $('#folderDescriptionPropertyRendered').css("padding", "0");
      $('#folderDescriptionProperty').val("");
      TSCORE.Meta.loadFolderMetaDataPromise(TSCORE.currentPath).then((metaData) => {
        let tags = '';
        if (metaData.tags && metaData.tags.length > 0) {
          metaData.tags.forEach((tag) => {
            tags = tags + "," + tag.title;
          });
          tags = tags.substring(1, tags.length);
        }

        $("#folderTagsProperty").val(tags);
        $('#folderTagsProperty').select2({
          multiple: true,
          tags: TSCORE.Config.getAllTags(),
          tokenSeparators: [',', ' '],
          minimumInputLength: 1,
          selectOnBlur: true,
          formatSelectionCssClass: function(tag, container) {
            let style = TSCORE.TagsUI.generateTagStyle(TSCORE.Config.findTag(tag.text));
            if (style) {
              $(container).parent().attr("style", style);
            }
          }
        });

        if (TSCORE.PRO && TSCORE.Config.getEnableMetaData()) { // TSCORE.Config.getWriteMetaToSidecarFile()
          $('#folderTagsProperty').on('change', this._saveFolderTags);
        } else {
          $('#folderTagsProperty').attr('disabled', 'disabled');
          // $('.select2-search-choice').css('padding-left', '4px !important');
        }

        if (metaData.description && metaData.description.length) {
          $('#folderDescriptionPropertyRendered').css("height", "200px");
          $('#folderDescriptionPropertyRendered').css("padding", "4px");
          TSCORE.Utils.setMarkDownContent($('#folderDescriptionPropertyRendered'), metaData.description);
          $('#folderDescriptionProperty').val(metaData.description);
        }
      }).catch((err) => {
        console.warn("Error getting folder metadata.");
      });
    }

    // TODO handle the case: changing to next file/close while in edit mode
    static _editFolderDescription() {
      if (TSCORE.PRO) {
        if (TSCORE.Config.getEnableMetaData()) {
          $('#folderDescriptionProperty').show();
          $('#folderDescriptionProperty').css("height", "200px");
          $('#folderDescriptionProperty').focus();
          $('#folderDescriptionPropertyRendered').hide();
          $('#editFolderDescriptionButton').hide();
          $('#cancelEditFolderDescriptionButton').show();
          $('#saveFolderDescriptionButton').show();
        } else {
          TSCORE.UI.showAlertDialog("In order to add or edit a description, you have to enable the use of hidden folders in the settings.");
        }
      } else {
        TSCORE.UI.showAlertDialog("Editing the folder description is possible with the TagSpaces PRO");
      }
    }

    static _cancelEditFolderDescription() {
      $('#folderDescriptionProperty').hide();
      $('#folderDescriptionPropertyRendered').show();
      $('#editFolderDescriptionButton').show();
      $('#cancelEditFolderDescriptionButton').hide();
      $('#saveFolderDescriptionButton').hide();
    }

    static _saveFolderDescription() {
      TSCORE.Meta.loadFolderMetaDataPromise(TSCORE.currentPath).then((metaData) => {
        let folderDescription = $('#folderDescriptionProperty').val();
        metaData.description = folderDescription;
        TSCORE.PRO.Directory.saveMetaData(metaData);
        this._cancelEditFolderDescription();
        TSCORE.Utils.setMarkDownContent($('#folderDescriptionPropertyRendered'), folderDescription);
        $('#folderDescriptionPropertyRendered').css("height", "200px");
      }).catch((err) => {
        console.warn("Error getting folder metadata.");
      });
    }

    static _toggleFolderProperties() {
      if (folderPropertiesOpened) {
        $('#folderPropertiesArea').hide();
        $('#toggleFolderProperitesButton').removeClass('buttonToggled');
      } else {
        $('#folderPropertiesArea').show();
        $('#toggleFolderProperitesButton').addClass('buttonToggled');
      }
      folderPropertiesOpened = !folderPropertiesOpened;
    }

    static createLocation() {
      var locationPath = $('#folderLocation').val();
      TSCORE.Config.createLocation($('#connectionName').val(), locationPath, $('#locationPerspective').val());
      // Enable the UI behavior of a not empty location list
      $('#createNewLocation').attr('title', $.i18n.t('ns.common:connectNewLocationTooltip'));
      $('#locationName').prop('disabled', false);
      $('#selectLocation').prop('disabled', false);
      this.openLocation(locationPath);
      this.initLocations();
    }

    static editLocation() {
      let $connectionName2 = $('#connectionName2');
      let $folderLocation2 = $('#folderLocation2');
      TSCORE.Config.editLocation($connectionName2.attr('oldName'), $connectionName2.val(), $folderLocation2.val(), $('#locationPerspective2').val());
      if ($('#defaultLocationEdit').prop('checked') === false) {
        TSCORE.Config.setDefaultLocation(TSCORE.Config.Settings.tagspacesList[0].path);
      }
      this.openLocation($folderLocation2.val());
      this.initLocations();
    }

    static _selectLocalDirectory() {
      TSCORE.IO.selectDirectory();
    }

    static _showLocationEditDialog(name, path) {
      require(['text!templates/LocationEditDialog.html'], (uiTPL) => {
        let $dialogLocationEdit = $('#dialogLocationEdit');

        // Check if dialog already created
        if ($dialogLocationEdit.length < 1) {
          let uiTemplate = Handlebars.compile(uiTPL);
          $('body').append(uiTemplate());

          $('#formLocationEdit').submit((e) => {
            e.preventDefault();
          });

          if (isWeb) {
            $('#selectLocalDirectory2').attr('style', 'visibility: hidden');
          } else {
            $('#selectLocalDirectory2').on('click', (e) => {
              e.preventDefault();
              this._selectLocalDirectory();
            });
          }

          $('#saveLocationButton').on('click', () => {
            $('#formLocationEdit').validator('validate');
            if ($(this).hasClass('disabled')) {
              return false;
            } else {
              this.editLocation();
            }
          });

          $('#deleteLocationButton').on('click', () => {
            this._showDeleteFolderConnectionDialog();
          });

          $('#formLocationEdit').validator();
          $('#formLocationEdit').on('invalid.bs.validator', () => {
            $('#saveLocationButton').prop('disabled', true);
          });
          $('#formLocationEdit').on('valid.bs.validator', () => {
            $('#saveLocationButton').prop('disabled', false);
          });

          $('#dialogLocationEdit').on('shown.bs.modal', () => {
            $('#formLocationEdit').validator('destroy');
            $('#formLocationEdit').validator();
          });

          $('#dialogLocationEdit').draggable({
            handle: ".modal-header"
          });

          $('#connectionName2').change(() => {
            $('#formLocationEdit').validator('validate');
          });

          $('#folderLocation2').change(() => {
            $('#formLocationEdit').validator('validate');
          });

          if (isCordova) {
            $('#folderLocation2').attr('placeholder', 'e.g.: DCIM/Camera');
          } else if (isWeb) {
            $('#folderLocation2').attr('placeholder', 'e.g.: /owncloud/remote.php/webdav/');
          }
        }

        let $connectionName2 = $('#connectionName2');
        let $folderLocation2 = $('#folderLocation2');
        let $locationPerspective2 = $('#locationPerspective2');
        let
         selectedPerspectiveId = TSCORE.Config.getLocation(path).perspective;

        $locationPerspective2.children().remove();
        TSCORE.Config.getActivatedPerspectives().forEach((value) => {
          let name = value.name ? value.name : value.id;
          if (selectedPerspectiveId === value.id) {
            $locationPerspective2.append($('<option>').attr('selected', 'selected').text(name).val(value.id));
          } else {
            $locationPerspective2.append($('<option>').text(name).val(value.id));
          }
        });

        $connectionName2.val(name);
        $connectionName2.attr('oldName', name);
        $folderLocation2.val(path);
        $('#dialogLocationEdit').i18n();

        let isDefault = isDefaultLocation(path);
        $('#defaultLocationEdit').prop('checked', isDefault);

        $('#dialogLocationEdit').modal({
          backdrop: 'static',
          show: true
        });
      });
    }

    static _showLocationCreateDialog() {
      require(['text!templates/LocationCreateDialog.html'], (uiTPL) => {
        let $dialogCreateFolderConnection = $('#dialogCreateFolderConnection');

        // Check if dialog already created
        if ($dialogCreateFolderConnection.length < 1) {
          let uiTemplate = Handlebars.compile(uiTPL);
          $('body').append(uiTemplate());

          $('#formLocationCreate').submit((e) => {
            e.preventDefault();
          });

          if (isWeb) {
            $('#_selectLocalDirectory').attr('style', 'visibility: hidden');
          } else {
            $('#_selectLocalDirectory').on('click', (e) => {
              e.preventDefault();
              this._selectLocalDirectory();
            });
          }

          $('#createFolderConnectionButton').on('click', () => {
            $('#formLocationCreate').validator('validate');
            if ($(this).hasClass('disabled')) {
              return false;
            } else {
              this.createLocation();
            }
          });

          $('#formLocationCreate').on('invalid.bs.validator', () => {
            $('#createFolderConnectionButton').prop('disabled', true);
          });
          $('#formLocationCreate').on('valid.bs.validator', () => {
            $('#createFolderConnectionButton').prop('disabled', false);
          });

          $('#dialogCreateFolderConnection').on('shown.bs.modal', () => {
            $('#formLocationCreate').validator('destroy');
            $('#formLocationCreate').validator();
          });

          $('#dialogCreateFolderConnection').draggable({
            handle: ".modal-header"
          });

          $('#folderLocation').change(() => {
            $('#formLocationCreate').validator('validate');
          });

          $('#connectionName').change(() => {
            $('#formLocationCreate').validator('validate');
          });

          $('#dialogCreateFolderConnection').i18n();

          if (isCordova) {
            $('#folderLocation').attr('placeholder', 'e.g., DCIM/Camera for Photos on Android ');
          } else if (isChrome) {
            $('#folderLocation').attr('placeholder', 'e.g., /home/chronos/user/Downloads/ for Chrome OS Downloads');
          } else if (isWeb) {
            $('#folderLocation').attr('placeholder', 'e.g., /owncloud/remote.php/webdav/');
          }
        }

        $('#locationPerspective').empty();
        TSCORE.Config.getActivatedPerspectives().forEach((value) => {
          let name = value.name ? value.name : value.id;
          $('#locationPerspective').append($('<option>').text(name).val(value.id));
        });

        $('#connectionName').val('');
        $('#folderLocation').val('');

        let enableDefaultlocation = (TSCORE.Config.getDefaultLocation() === "");
        $('#defaultLocation').prop('checked', enableDefaultlocation);
        $('#defaultLocation').prop('disabled', enableDefaultlocation);

        $('#dialogCreateFolderConnection').modal({
          backdrop: 'static',
          show: true
        });
      });
    }

    static _createDirectory() {
      let dirPath = $('#createNewDirectoryButton').attr('path') + TSCORE.dirSeparator + $('#newDirectoryName').val();
      TSCORE.IO.createDirectoryPromise(dirPath).then(() => {
        TSCORE.showSuccessDialog("Directory created successfully.");
        TSCORE.navigateToDirectory(dirPath);
        TSCORE.hideWaitingDialog();
        TSCORE.hideLoadingAnimation();
      }, (error) => {
        TSCORE.hideWaitingDialog();
        TSCORE.hideLoadingAnimation();
        console.error("Creating directory: " + dirPath + " failed with: " + error);
        TSCORE.showAlertDialog("Creating " + dirPath + " failed!");
      });
    }

    static showCreateDirectoryDialog(dirPath) {
      require(['text!templates/DirectoryCreateDialog.html'], (uiTPL) => {
        if ($('#dialogDirectoryCreate').length < 1) {
          let uiTemplate = Handlebars.compile(uiTPL);
          $('body').append(uiTemplate());
          //$('#createNewDirectoryButton').off();
          $('#createNewDirectoryButton').on('click', createDirectory);

          $('#dialogDirectoryCreate').i18n();
          $('#formDirectoryCreate').validator();
          $('#formDirectoryCreate').submit((e) => {
            e.preventDefault();
            if ($('#createNewDirectoryButton').prop('disabled') === false) {
              $('#createNewDirectoryButton').click();
            }
          });
          $('#formDirectoryCreate').on('invalid.bs.validator', () => {
            $('#createNewDirectoryButton').prop('disabled', true);
          });
          $('#formDirectoryCreate').on('valid.bs.validator', () => {
            $('#createNewDirectoryButton').prop('disabled', false);
          });
          $('#dialogDirectoryCreate').on('shown.bs.modal', () => {
            $('#newDirectoryName').focus();
          });
          $('#dialogDirectoryCreate').draggable({
            handle: ".modal-header"
          });
        }

        $('#createNewDirectoryButton').attr('path', dirPath);
        $('#newDirectoryName').val('');
        $('#dialogDirectoryCreate').modal({
          backdrop: 'static',
          show: true
        });
      });
    }

    static _showRenameDirectoryDialog(dirPath) {
      require(['text!templates/DirectoryRenameDialog.html'], (uiTPL) => {
        if ($('#dialogDirectoryRename').length < 1) {
          let uiTemplate = Handlebars.compile(uiTPL);
          $('body').append(uiTemplate());
          $('#renameDirectoryButton').on('click', () => {
            let dirPath = $('#renameDirectoryButton').attr('path');
            let newDirPath = $('#directoryNewName').val();
            TSCORE.IO.renameDirectoryPromise(dirPath, newDirPath).then((newDirName) => {
              TSCORE.showSuccessDialog("Directory renamed successfully.");
              TSCORE.navigateToDirectory(newDirName);
              TSCORE.hideLoadingAnimation();
            }, (err) => {
              TSCORE.hideWaitingDialog();
              TSCORE.showAlertDialog(err);
            });
          });
          $('#formDirectoryRename').submit((e) => {
            e.preventDefault();
            if ($('#renameDirectoryButton').prop('disabled') === false) {
              $('#renameDirectoryButton').click();
            }
          });
          $('#formDirectoryRename').on('invalid.bs.validator', () => {
            $('#renameDirectoryButton').prop('disabled', true);
          });
          $('#formDirectoryRename').on('valid.bs.validator', () => {
            $('#renameDirectoryButton').prop('disabled', false);
          });
          $('#dialogDirectoryRename').i18n();
          $('#dialogDirectoryRename').on('shown.bs.modal', () => {
            $('#directoryNewName').focus();
            $('#formDirectoryRename').validator('destroy');
            $('#formDirectoryRename').validator();
          });
          $('#dialogDirectoryRename').draggable({
            handle: ".modal-header"
          });
        }
        $('#renameDirectoryButton').attr('path', dirPath);
        let dirName = TSCORE.TagUtils.extractDirectoryName(dirPath);
        $('#directoryNewName').val(dirName);
        $('#dialogDirectoryRename').modal({
          backdrop: 'static',
          show: true
        });
      });
    }

    static isDefaultLocation(path) {

      return (TSCORE.Config.getDefaultLocation() === path);
    }

    static deleteLocation(name) {
      console.log('Deleting folder connection..');
      TSCORE.Config.deleteLocation(name);
      //Opens the first location in the settings after deleting a location  
      if (TSCORE.Config.Settings.tagspacesList.length > 0) {
        openLocation(TSCORE.Config.Settings.tagspacesList[0].path);
        TSCORE.Config.setDefaultLocation(TSCORE.Config.Settings.tagspacesList[0].path);
        TSCORE.Config.saveSettings();
      } else {
        this.closeCurrentLocation();
        TSCORE.Config.setLastOpenedLocation("");
        TSCORE.Config.setDefaultLocation("");
        TSCORE.Config.saveSettings();
      }
      this.initLocations();
    }

    static closeCurrentLocation() {
      console.log('Closing location..');
      $('#locationName').text($.i18n.t('ns.common:chooseLocation')).attr('title', '');
      $('#locationContent').children().remove();
      // Clear the footer
      $('#statusBar').children().remove();
      $('#statusBar').text("");
      $('#alternativeNavigator').children().remove();
      TSCORE.disableTopToolbar();
      TSCORE.PerspectiveManager.hideAllPerspectives();
    }

    static showDeleteFolderConnectionDialog() {
      TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:deleteLocationTitleAlert'), $.i18n.t('ns.dialogs:deleteLocationContentAlert', {
        locationName: $('#connectionName2').attr('oldName')
      }), () => {
        deleteLocation($('#connectionName2').attr('oldName'));
        $('#dialogLocationEdit').modal('hide');
      });
    }

    static initLocations() {
      console.log('Creating location menu...');
      let $locationsList = $('#locationsList');
      $locationsList.children().remove();

      TSCORE.Config.Settings.tagspacesList.forEach((element) => {
        if (isDefaultLocation(element.path)) {
          element.isDefault = true;
        } else {
          element.isDefault = false;
        }
      });
      $locationsList.html(locationChooserTmpl({
        'locations': TSCORE.Config.Settings.tagspacesList,
        'yourLocations': $.i18n.t('ns.common:yourLocations'),
        'connectLocation': $.i18n.t('ns.common:connectNewLocationTooltip'),
        'editLocationTitle': $.i18n.t('ns.common:editLocation')
      }));
      $locationsList.find('.openLocation').each(() => {
        $(this).on('click', () => {
          openLocation($(this).attr('path'));
        });
      });
      $locationsList.find('.editLocation').each(() => {
        $(this).on('click', () => {
          console.log('Edit location clicked');
          showLocationEditDialog($(this).attr('location'), $(this).attr('path'));
          return false;
        });
      });
      $locationsList.find('#createNewLocation').on('click', () => {
        this._showLocationCreateDialog();
      });
    }
  }

  // Public API definition
  exports.TSDirectoriesUI = TSDirectoriesUI;
});
