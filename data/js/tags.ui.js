/* Copyright (c) 2012-present The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars  */
define((require, exports, module) => {
  'use strict';

  const locationTagGroupKey = 'LTG';
  const calculatedTagGroupKey = 'CTG';

  const defaultTagColor = "#008000";
  const defaultTagTextColor = "#ffffff";

  const TSCORE = require('tscore');

  let tagGroupsTmpl = Handlebars.compile(`
    {{#each tagGroups}}
    <div class="accordion-group disableTextSelection tagGroupContainer">
    <div class="accordion-heading btn-group ui-droppable tagGroupContainerHeading flexLayout" key="{{key}}">
    <button class="btn btn-link btn-lg tagGroupIcon" data-toggle="collapse" data-target="#tagButtons{{@index}}" data-i18n="[title]ns.common:toggleTagGroup" title="{{../toggleTagGroup}}">
    <i class="fa fa-tags fa-fw"></i>
    </button>
    <button class="btn btn-link tagGroupTitle flexMaxWidth" data-toggle="collapse" data-target="#tagButtons{{@index}}" key="{{key}}">{{title}}
    <sup {{#unless collapse}}style="display: none;"{{/unless}}><span class="badge" style="margin-left: 5px; font-size: 9px;" data-i18n="[title]ns.common:tagGroupTagsCount">{{children.length}}</span></sup></button>
    <button class="btn btn-link btn-lg tagGroupActions" key="{{key}}" data-i18n="[title]ns.common:tagGroupOperations" title="{{../tagGroupOperations}}">
    <b class="fa fa-ellipsis-v"></b>
    </button>
    </div>
    {{#if collapse}}
    <div class="accordion-body collapse" id="tagButtons{{@index}}">
    {{else}}
    <div class="accordion-body collapse in" id="tagButtons{{@index}}">
    {{/if}}
    <div class="accordion-inner" id="tagButtonsContent{{@index}}" style="padding: 2px;">
    <div>
    {{#each children}}
    <a class="btn btn-sm tagButton" tag="{{title}}" parentkey="{{../key}}" style="{{style}}" title="{{description}}" >
    <span class="{{icon}}" /> 
    {{title}}
    {{#if count}} <span class="badge" style="font-size: 9px; background-color: rgba(187, 187, 187, 0.26);" data-i18n="[title]ns.common:tagGroupTagsCount1">{{count}}</span>{{/if}}
    &nbsp;&nbsp;<span class="fa fa-ellipsis-v"></span>
    </a>
    {{/each}}
    </div>
    </div>
    </div>
    </div>
    {{/each}}
  `);

  let tagButtonTmpl = Handlebars.compile(` {{#each tags}} <button class="btn btn-sm tagButton" tag="{{tag}}" 
    filepath="{{filepath}}" style="{{style}}">{{tag}}&nbsp;&nbsp;<span class="fa fa-ellipsis-v dropDownIcon"></span></button>{{/each}}
    `);
  
  class TSTags {

    constructor() {
      console.log('Initializing tags.ui.js...');
    }

    initUI() {
      $('#extMenuAddTagAsFilter').click(() => {
      });

      // Context menu for the tags in the file table and the file viewer
      $('#tagMenuAddTagAsFilter').click(() => {
        TSCORE.searchForTag(TSCORE.selectedTag);
      });

      $('#tagMenuEditTag').click(() => {
        TSCORE.UI.showTagEditDialog();
      });

      $('#tagMenuRemoveTag').click(() => {
        TSCORE.TagUtils.removeTag(TSCORE.selectedFiles[0], TSCORE.selectedTag);
      });

      $('#tagMenuMoveTagFirst').click(() => {
        TSCORE.TagUtils.moveTagLocation(TSCORE.selectedFiles[0], TSCORE.selectedTag, 'first');
      });

      $('#tagMenuMoveTagRight').click(() => {
        TSCORE.TagUtils.moveTagLocation(TSCORE.selectedFiles[0], TSCORE.selectedTag, 'next');
      });

      $('#tagMenuMoveTagLeft').click(() => {
        TSCORE.TagUtils.moveTagLocation(TSCORE.selectedFiles[0], TSCORE.selectedTag, 'prev');
      });

      // Context menu for the tags in the tag tree
      $('#tagTreeMenuAddTagToFile').click(() => {
        if (TSCORE.selectedTag === 'geo-tag') {
          if (TSCORE.PRO) {
            TSCORE.UI.showTagEditDialog(true); // true start the dialog in add mode
          } else {
            TSCORE.showAlertDialog($.i18n.t("ns.common:needProVersion"), $.i18n.t("ns.common:geoTaggingNotPossible"));
          }
        } else {
          TSCORE.TagUtils.addTag(TSCORE.Utils.getUniqueSelectedFiles(), [TSCORE.selectedTag]);
        }
      });

      $('#tagTreeMenuAddTagAsFilter').click(() => {
        TSCORE.searchForTag(TSCORE.selectedTag);
      });

      $('#tagTreeMenuEditTag').click(() => {
        TSCORE.showTagEditInTreeDialog();
      });

      $('#tagTreeMenuDeleteTag').click(() => {
        TSCORE.showConfirmDialog('Delete Tag', 'Do you want to delete this tag from the taggroup?', () => {
          TSCORE.Config.deleteTag(TSCORE.selectedTagData);
          this.generateTagGroups();
        });
      });

      // Context menu for the tags groups
      $('#tagGroupMenuCreateNewTag').click(() => {
        TSCORE.showDialogTagCreate();
      });

      $('#tagGroupMenuImportTags').on('click', this._importTagGroups);

      $('#tagGroupMenuCreateTagGroup').click(() => {
        TSCORE.showDialogTagGroupCreate();
      });

      $('#tagGroupSort').click(() => {
        TSCORE.Config.sortTagGroup(TSCORE.selectedTagData);
        this.generateTagGroups();
      });

      $('#tagGroupMenuMoveUp').click(() => {
        TSCORE.Config.moveTagGroup(TSCORE.selectedTagData, 'up');
        this.generateTagGroups();
      });

      $('#tagGroupMenuMoveDown').click(() => {
        TSCORE.Config.moveTagGroup(TSCORE.selectedTagData, 'down');
        this.generateTagGroups();
      });

      $('#tagGroupMenuEdit').click(() => {
        TSCORE.showDialogEditTagGroup();
      });

      $('#tagGroupMenuDelete').click(() => {
        TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:deleteTagGroupTitleConfirm'), $.i18n.t('ns.dialogs:deleteTagGroupContentConfirm', {
          tagGroup: TSCORE.selectedTagData.title
        }), () => {
          TSCORE.Config.deleteTagGroup(TSCORE.selectedTagData);
          this.generateTagGroups();
        });
      });

      // Dialogs
      $('#editTagInTreeButton').click(() => {
        TSCORE.Config.editTag(TSCORE.selectedTagData, $('#tagInTreeName').val(), $('#tagColor').val(), $('#tagTextColor').val(), $('#tagInTreeKeyBinding').val());
        this.generateTagGroups();
        TSCORE.PerspectiveManager.refreshFileListContainer();
      });

      $('#cleanTagsButton').click(() => {
        TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:cleanFilesTitleConfirm'), $.i18n.t('ns.dialogs:cleanFilesContentConfirm'), () => {
          TSCORE.TagUtils.cleanFilesFromTags(TSCORE.Utils.getUniqueSelectedFiles());
        });
      });

      $('#addTagsButton').click(() => {
        let tags = $('#tags').val().split(',');
        TSCORE.TagUtils.addTag(TSCORE.Utils.getUniqueSelectedFiles(), tags);
      });

      $('#removeTagsButton').click(() => {
        let tags = $('#tags').val().split(',');
        TSCORE.TagUtils.removeTags(TSCORE.Utils.getUniqueSelectedFiles(), tags);
      });

      $('#createTagButton').click(() => {
        let tags = $('#newTagTitle').val().split(',');
        tags.forEach((value) => {
          TSCORE.Config.createTag(TSCORE.selectedTagData, value);
        });
        this.generateTagGroups();
      });

      $('#createTagGroupButton').on("click", this._createTagGroup);

      $('#editTagGroupButton').click(() => {
        TSCORE.Config.editTagGroup(TSCORE.selectedTagData, $('#tagGroupName').val(), $('#editTagGroupBackgroundColor').val(), $('#editTagGroupForegroundColor').val(), $('#colorChangesToAllTags').prop('checked'));
        this.generateTagGroups();
      });
    }

    _importTagGroups() {
      console.log("tagGroupMenuImportTags");
      $('#jsonImportFileInput').click();
      $('#jsonImportFileInput').on('change', (selection) => {
        let file = selection.currentTarget.files[0];
        //addFileInputName = decodeURIComponent(file.name);
        let reader = new FileReader();
        reader.onload = () => {
          try {
            let jsonObj = JSON.parse(reader.result);
            if ($.isArray(jsonObj.tagGroups)) {
              showImportTagsDialog(jsonObj.tagGroups);
            } else {
              TSCORE.showAlertDialog($.i18n.t("ns.dialogs:invalidImportFile"));
            }
          } catch (e) {
            console.log(e);
            TSCORE.showAlertDialog($.i18n.t("ns.dialogs:invalidImportFile"));
          }
        };
        reader.readAsText(file);
      });
    }

    _createTagGroup() {
      TSCORE.Config.createTagGroup(TSCORE.selectedTagData, $('#newTagGroupName').val(), $('#tagGroupBackgroundColor').val(), $('#tagGroupForegroundColor').val());
      this.generateTagGroups();
    }

    generateTagGroups() {
      console.log('Generating TagGroups...');
      let $tagGroupsContent = $('#tagGroupsContent');
      $tagGroupsContent.children().remove();
      $tagGroupsContent.addClass('accordion');

      let tagGroups = TSCORE.Config.Settings.tagGroups;
      let tag;
      // Cleaning Special TagGroups
      for (let k = 0; k < tagGroups.length; k++) {
        if (tagGroups[k].key.indexOf(locationTagGroupKey) === 0 || tagGroups[k].key === calculatedTagGroupKey) {
          console.log('Deleting:' + tagGroups[k].key + ' ' + k);
          tagGroups.splice(k, 1);
          k--;
        }
      }

      // Adding tags to the calculated tag group
      if (TSCORE.Config.getCalculateTags() && TSCORE.calculatedTags !== null) {
        tagGroups.push({
          'title': $.i18n.t('ns.common:tagsFromCurrentFolder'),
          'key': calculatedTagGroupKey,
          'expanded': true,
          'children': TSCORE.calculatedTags
        });
      }

      // Adding tag groups from the current location
      if (TSCORE.Config.getLoadLocationMeta() && TSCORE.locationTags !== null) {
        TSCORE.locationTags.forEach((data) => {
          tagGroups.push({
            'title': data.title + ' (imported)',
            'key': locationTagGroupKey + TSCORE.TagUtils.formatDateTime4Tag(new Date(), true, true),
            'expanded': true,
            'children': data.children
          });
        });
      }

      // ehnances the taggroups with addition styling information
      for (let i = 0; i < tagGroups.length; i++) {
        for (let j = 0; j < tagGroups[i].children.length; j++) {
          tag = tagGroups[i].children[j];
          if (!tag.description) {
            tag.description = tag.title;
          }
          tag.icon = '';
          if (tag.type === 'smart') {
            tag.icon = 'fa fa-flask';
            if (tag.title === 'geo-tag') {
              tag.icon = 'fa fa-map-marker';
            }
          }
          // Add keybinding to tags
          if (tag.keyBinding && tag.keyBinding.length > 0) {
            tag.icon = 'fa fa-keyboard-o';
            tag.description = tag.title + ' [' + tag.keyBinding + ']';
            Mousetrap.unbind(tag.keyBinding);
            Mousetrap.bind(tag.keyBinding, (innerTag) => {
              return (e) => {
                TSCORE.TagUtils.addTag(TSCORE.Utils.getUniqueSelectedFiles(), [innerTag]);
              };
            },(tag.title)); // jshint ignore:line
          }
          tag.style = this.generateTagStyle(tag);
        }
      }
      $tagGroupsContent.html(tagGroupsTmpl({
        'tagGroups': tagGroups,
        'toggleTagGroup': $.i18n.t('ns.common:toggleTagGroup'),
        'tagGroupOperations': $.i18n.t('ns.common:tagGroupOperations')
      }));

      $tagGroupsContent.find('.tagGroupIcon').each(() => {
        $(this).on('click', () => {
          let areaId = $(this).attr('data-target');
          if (areaId) {
            let index = areaId.substring(areaId.length - 1);
            tagGroups[index].collapse = $(areaId).is(':visible');
            if (tagGroups[index].collapse) {
              $(areaId).parent().find('sup').show();
            } else {
              $(areaId).parent().find('sup').hide();
            }
            TSCORE.Config.saveSettings();
          }
        });
      });

      $tagGroupsContent.find('.tagButton').each(() => {
        $(this).draggable({
          'appendTo': 'body',
          'helper': 'clone',
          'revert': 'invalid',
          'start': () => {
            console.log('Start dragging..........');
            TSCORE.selectedTagData = TSCORE.Config.getTagData($(this).attr('tag'), $(this).attr('parentKey'));
            TSCORE.selectedTag = generateTagValue(TSCORE.selectedTagData);
            TSCORE.selectedTagData.parentKey = $(this).attr('parentKey');
          }
        }).on('dblclick', () => {
          TSCORE.hideAllDropDownMenus();
          TSCORE.selectedTagData = TSCORE.Config.getTagData($(this).attr('tag'), $(this).attr('parentKey'));
          TSCORE.selectedTag = generateTagValue(TSCORE.selectedTagData);
          TSCORE.TagUtils.addTag(TSCORE.Utils.getUniqueSelectedFiles(), [TSCORE.selectedTag]);
        });
      });

      $tagGroupsContent.find('.tagGroupTitle').each(() => {
        $(this).on('click', () => {
          let areaId = $(this).attr('data-target');
          if (areaId) {
            let index = areaId.substring(areaId.length - 1);
            tagGroups[index].collapse = $(areaId).is(':visible');
            TSCORE.Config.saveSettings();
          }
        }).droppable({
          accept: '.tagButton',
          hoverClass: 'dirButtonActive',
          drop: (event, ui) => {
            //ui.draggable.detach();
            let parentKeyAttr = ui.draggable.attr('parentKey');
            let tagAttr = ui.draggable.attr('tag');
            let targetTagGroupKey = $(this).attr('key');
            if (parentKeyAttr && (targetTagGroupKey !== parentKeyAttr)) { // move from taggroup
              let tagGroupData = TSCORE.Config.getTagData(tagAttr, parentKeyAttr);
              //console.log('Moving tag: ' + tagGroupData.title + ' to ' + targetTagGroupKey);
              TSCORE.Config.moveTag(tagGroupData, targetTagGroupKey);
            } else if (tagAttr && tagAttr.length > 1) { // create from file
              let targetTagGroupData = TSCORE.Config.getTagGroupData(targetTagGroupKey);
              TSCORE.Config.createTag(targetTagGroupData, tagAttr, defaultTagColor, defaultTagTextColor);
            }
            this.generateTagGroups();
            $(ui.helper).remove();
          }
        });
      });

      $tagGroupsContent.on('contextmenu click', '.tagGroupActions', () => {
        TSCORE.hideAllDropDownMenus();
        TSCORE.selectedTag = $(this).attr('tag');
        TSCORE.selectedTagData = TSCORE.Config.getTagGroupData($(this).attr('key'));
        TSCORE.selectedTagData.parentKey = undefined;
        TSCORE.showContextMenu('#tagGroupMenu', $(this));
        return false;
      });

      $tagGroupsContent.on('contextmenu click', '.tagButton', () => {
        TSCORE.hideAllDropDownMenus();
        TSCORE.selectedTagData = TSCORE.Config.getTagData($(this).attr('tag'), $(this).attr('parentKey'));
        TSCORE.selectedTag = generateTagValue(TSCORE.selectedTagData);
        TSCORE.selectedTagData.parentKey = $(this).attr('parentKey');
        TSCORE.showContextMenu('#tagTreeMenu', $(this));
        return false;
      });

      $tagGroupsContent.append($('<button>', {
        'id': 'openTagGroupCreateButton',
        'class': 'btn btn-link',
        'style': 'margin-top: 15px; margin-left: -8px; display: block;  color: #1DD19F;',
        'text': $.i18n.t('ns.common:createTagGroup'),
        'data-i18n': 'ns.common:createTagGroup;[title]ns.common:createTagGroupTooltip'
      }).on('click', TSCORE.showDialogTagGroupCreate));

      $tagGroupsContent.append($('<button>', {
        'id': 'importTagGroupButton',
        'class': 'btn btn-link',
        'style': 'margin-top: 0px; display: block; margin-left: -8px; color: #1DD19F;',
        'text': $.i18n.t('ns.common:importTags'),
        'data-i18n': 'ns.common:importTags;[title]ns.common:importTagsTooltip'
      }).on('click', this._importTagGroups));
    }

    _generateTagValue(tagData) {
      let tagValue = tagData.title;
      let d;
      if (tagData.type === 'smart') {
        switch (tagData.functionality) {
          case 'geoTagging': {
            $('#viewContainers').on('drop dragend', (event) => {
              if (TSCORE.PRO && TSCORE.selectedTag === 'geo-tag') {
                TSCORE.UI.showTagEditDialog(true); // true start the dialog in add mode
              } else if (!TSCORE.PRO && TSCORE.selectedTag === 'geo-tag') {
                TSCORE.showAlertDialog($.i18n.t("ns.common:needProVersion"), $.i18n.t("ns.common:geoTaggingNotPossible"));
              }
            });
            break;
          }
          case 'today': {
            tagValue = TSCORE.TagUtils.formatDateTime4Tag(new Date(), false);
            break;
          }
          case 'tomorrow': {
            d = new Date();
            d.setDate(d.getDate() + 1);
            tagValue = TSCORE.TagUtils.formatDateTime4Tag(d, false);
            break;
          }
          case 'yesterday': {
            d = new Date();
            d.setDate(d.getDate() - 1);
            tagValue = TSCORE.TagUtils.formatDateTime4Tag(d, false);
            break;
          }
          case 'currentMonth': {
            let cMonth = '' + (new Date().getMonth() + 1);
            if (cMonth.length === 1) {
              cMonth = '0' + cMonth;
            }
            tagValue = '' + new Date().getFullYear() + cMonth;
            break;
          }
          case 'currentYear': {
            tagValue = '' + new Date().getFullYear();
            break;
          }
          case 'now': {
            tagValue = TSCORE.TagUtils.formatDateTime4Tag(new Date(), true);
            break;
          }
          default: {
            break;
          }
        }
      }
      return tagValue;
    }

    openTagMenu(tagButton, tag, filePath) {
      TSCORE.selectedFiles.push(filePath);
      TSCORE.selectedTag = tag;
    }

    // Helper function generating tag buttons
    generateTagButtons(commaSeparatedTags, filePath) {
      //console.log("Creating tags...");
      let tagString = '' + commaSeparatedTags;
      let context = {
        tags: []
      };
      if (tagString.length > 0) {
        let tags = tagString.split(',');
        for (let i = 0; i < tags.length; i++) {
          context.tags.push({
            filepath: filePath,
            tag: tags[i],
            style: this.generateTagStyle(TSCORE.Config.findTag(tags[i]))
          });
        }
      }
      let metaTags = TSCORE.Meta.getTagsFromMetaFile(filePath);
      if (metaTags.length > 0) {
        for (let i = 0; i < metaTags.length; i++) {
          let tag = metaTags[i];
          if (!tag.style) {
            tag.style = this.generateTagStyle(TSCORE.Config.findTag(tag.tag));
          }
        }

        context.tags = context.tags.concat(metaTags);
      }
      return tagButtonTmpl(context);
    }

    // Get the color for a tag
    generateTagStyle(tagObject) {
      let tagTextColor = TSCORE.Config.getDefaultTagTextColor();
      let tagColor = TSCORE.Config.getDefaultTagColor();

      if (tagObject.textcolor) {
        tagTextColor = tagObject.textcolor;
      }
      if (tagObject.color) {
        tagColor = tagObject.color;
      }

      return 'color: ' + tagTextColor + ' !important; background-color: ' + tagColor + ' !important;';
    }

    showDialogTagCreate() {
      $('#newTagTitle').val('');
      $('#formAddTags').validator();
      $('#formAddTags').submit((e) => {
        e.preventDefault();
        if ($('#createTagButton').prop('disabled') === false) {
          $('#createTagButton').click();
        }
      });
      $('#formAddTags').on('invalid.bs.validator', () => {
        $('#createTagButton').prop('disabled', true);
      });
      $('#formAddTags').on('valid.bs.validator', () => {
        $('#createTagButton').prop('disabled', false);
      });
      $('#dialogTagCreate').on('shown.bs.modal', () => {
        $('#newTagTitle').focus();
      });
      $('#dialogTagCreate').modal({
        backdrop: 'static',
        show: true
      });
      $('#dialogTagCreate').draggable({
        handle: ".modal-header"
      });
    }

    _showImportTagsDialog(tagGroups) {
      require(['text!templates/ImportTagsDialog.html'], (uiTPL) => {

        if ($('#dialogImportTags').length < 1) {
          let uiTemplate = Handlebars.compile(uiTPL);
          $('body').append(uiTemplate({objects: tagGroups}));

          $('#importTagsButton').on('click', () => {

            tagGroups.forEach((value) => {
              TSCORE.Config.addTagGroup(value);
            });
            TSCORE.Config.saveSettings();
            this.generateTagGroups();
          });
        }
        $('#dialogImportTags').i18n();
        $('#dialogImportTags').modal({
          backdrop: 'static',
          show: true
        });
        $('#dialogImportTags').draggable({
          handle: ".modal-header"
        });
      });
    }

    showDialogEditTagGroup() {
      $('#colorChangesToAllTags').prop('checked', false);

      let $editTagGroupBackgroundColorChooser = $('#editTagGroupBackgroundColorChooser');
      let $editTagGroupBackgroundColor = $('#editTagGroupBackgroundColor');
      $editTagGroupBackgroundColorChooser.simplecolorpicker({
        picker: false
      });
      $editTagGroupBackgroundColorChooser.on('change', () => {
        $editTagGroupBackgroundColor.val($editTagGroupBackgroundColorChooser.val());
      });

      if (TSCORE.selectedTagData.color === undefined || TSCORE.selectedTagData.color.length < 1) {
        $editTagGroupBackgroundColor.val(TSCORE.Config.getDefaultTagColor());
      } else {
        $editTagGroupBackgroundColor.val(TSCORE.selectedTagData.color);
      }

      let $editTagGroupForegroundColorChooser = $('#editTagGroupForegroundColorChooser');
      let $editTagGroupForegroundColor = $('#editTagGroupForegroundColor');
      $editTagGroupForegroundColorChooser.simplecolorpicker({
        picker: false
      });
      $editTagGroupForegroundColorChooser.on('change', () => {
        $editTagGroupForegroundColor.val($editTagGroupForegroundColorChooser.val());
      });

      if (TSCORE.selectedTagData.textcolor === undefined || TSCORE.selectedTagData.textcolor.length < 1) {
        $editTagGroupForegroundColor.val(TSCORE.Config.getDefaultTagTextColor());
      } else {
        $editTagGroupForegroundColor.val(TSCORE.selectedTagData.textcolor);
      }

      $('#colorChangesToAllTags').on('change', () => {
        $('#colorChangesToAllTags').prop('checked');
      });

      $('#tagGroupName').val(TSCORE.selectedTagData.title);
      $('#formTagGroupEdit').validator();
      $('#formTagGroupEdit').submit((e) => {
        e.preventDefault();
        if ($('#editTagGroupButton').prop('disabled') === false) {
          $('#editTagGroupButton').click();
        }
      });
      $('#formTagGroupEdit').on('invalid.bs.validator', () => {
        $('#editTagGroupButton').prop('disabled', true);
      });
      $('#formTagGroupEdit').on('valid.bs.validator', () => {
        $('#editTagGroupButton').prop('disabled', false);
      });
      $('#dialogEditTagGroup').on('shown.bs.modal', () => {
        $('#tagGroupName').focus();
      });
      $('#dialogEditTagGroup').modal({
        backdrop: 'static',
        show: true
      });
      $('#dialogEditTagGroup').draggable({
        handle: ".modal-header"
      });
    }

    showDialogTagGroupCreate() {
      let $tagGroupBackgroundColorChooser = $('#tagGroupBackgroundColorChooser');
      let $tagGroupBackgroundColor = $('#tagGroupBackgroundColor');
      $tagGroupBackgroundColorChooser.simplecolorpicker({
        picker: false
      });
      $tagGroupBackgroundColorChooser.on('change', () => {
        $tagGroupBackgroundColor.val($tagGroupBackgroundColorChooser.val());
      });

      $tagGroupBackgroundColor.val(TSCORE.Config.getDefaultTagColor());

      let $tagGroupForegroundColorChooser = $('#tagGroupForegroundColorChooser');
      let $tagGroupForegroundColor = $('#tagGroupForegroundColor');
      $tagGroupForegroundColorChooser.simplecolorpicker({
        picker: false
      });
      $tagGroupForegroundColorChooser.on('change', () => {
        $tagGroupForegroundColor.val($tagGroupForegroundColorChooser.val());
      });
      console.log(TSCORE.Config.getDefaultTagTextColor());
      $tagGroupForegroundColor.val(TSCORE.Config.getDefaultTagTextColor());

      $('#newTagGroupName').val('');
      $('#formTagGroupCreate').validator();
      $('#formTagGroupCreate').off();
      $('#formTagGroupCreate').on("submit", (e) => {
        e.preventDefault();
        if ($('#createTagGroupButton').prop('disabled') === false) {
          $('#createTagGroupButton').click();
        }
      });
      $('#formTagGroupCreate').on('invalid.bs.validator', () => {
        $('#createTagGroupButton').prop('disabled', true);
      });
      $('#formTagGroupCreate').on('valid.bs.validator', () => {
        $('#createTagGroupButton').prop('disabled', false);
      });
      $('#dialogTagGroupCreate').on('shown.bs.modal', () => {
        $('#newTagGroupName').focus();
      });
      $('#dialogTagGroupCreate').modal({
        backdrop: 'static',
        show: true
      });
      $('#dialogTagGroupCreate').draggable({
        handle: ".modal-header"
      });
    }

    showTagEditInTreeDialog() {
      $('#tagInTreeName').val(TSCORE.selectedTagData.title);
      $('#tagInTreeKeyBinding').val(TSCORE.selectedTagData.keyBinding);
      let $tagColorChooser = $('#tagColorChooser');
      let $tagColor = $('#tagColor');
      $tagColorChooser.simplecolorpicker({
        picker: false
      });
      $tagColorChooser.on('change', () => {
        $tagColor.val($tagColorChooser.val());
      });
      if (TSCORE.selectedTagData.color === undefined || TSCORE.selectedTagData.color.length < 1) {
        $tagColor.val(defaultTagColor);
      } else {
        $tagColor.val(TSCORE.selectedTagData.color);
      }
      let $tagTextColorChooser = $('#tagTextColorChooser');
      let $tagTextColor = $('#tagTextColor');
      $tagTextColorChooser.simplecolorpicker({
        picker: false
      });
      $tagTextColorChooser.on('change', () => {
        $tagTextColor.val($tagTextColorChooser.val());
      });
      if (TSCORE.selectedTagData.textcolor === undefined || TSCORE.selectedTagData.textcolor.length < 1) {
        $tagTextColor.val(defaultTagTextColor);
      } else {
        $tagTextColor.val(TSCORE.selectedTagData.textcolor);
      }
      $('#formEditInTreeTag').validator();
      $('#formEditInTreeTag').on('invalid.bs.validator', () => {
        $('#editTagInTreeButton').prop('disabled', true);
      });
      $('#formEditInTreeTag').on('valid.bs.validator', () => {
        $('#editTagInTreeButton').prop('disabled', false);
      });
      $('#dialogEditInTreeTag').on('shown.bs.modal', () => {
        $('#tagInTreeName').focus();
      });
      $('#dialogEditInTreeTag').modal({
        backdrop: 'static',
        show: true
      });
      $('#dialogEditInTreeTag').draggable({
        handle: ".modal-header"
      });
    }

    showAddTagsDialog() {
      if (!TSCORE.selectedFiles[0]) {
        TSCORE.showAlertDialog("Please select a file first.", "Tagging not possible!");
        return;
      }
      console.log('Adding tags...');
      $('#tags').select2('data', null);
      $('#tags').select2({
        multiple: true,
        tags: TSCORE.Config.getAllTags(),
        tokenSeparators: [
          ',',
          ' '
        ],
        minimumInputLength: 1,
        selectOnBlur: true,
        formatSelectionCssClass: (tag, container) => {
          let style = this.generateTagStyle(TSCORE.Config.findTag(tag.text));
          if (style) {
            $(container).parent().attr("style", style);
          }
        }
      });
      $('#dialogAddTags').on('shown.bs.modal', () => {
        $('.select2-input').focus();
      });
      $('#dialogAddTags').modal({
        backdrop: 'static',
        show: true
      });
      $('#dialogAddTags').draggable({
        handle: ".modal-header"
      });
    }
  }

  // Public Vars
  exports.calculatedTags = [];
  exports.locationTags = [];

  // Public API definition
  exports.TSTags = TSTags;
});
