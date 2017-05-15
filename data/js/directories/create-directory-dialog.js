/* Copyright (c) 2017-present the TagSpaces Authors.
 */

define(function(require, exports, module) {
  "use strict";

  const TSCORE = require('tscore');

  const createDialogTemplate = `
    <div id="dialogDirectoryCreate" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
              <i class="fa fa-times"></i>
            </button>
            <h4 data-i18n="ns.dialogs:createNewDirectoryTitle">Create New Directory</h4>
          </div>
          <div class="modal-body form">
            <form role="form" data-toggle="validator" id="formDirectoryCreate">
              <div class="form-group">
                  <label class="control-label" for="newDirectoryName" data-i18n="ns.dialogs:createNewDirectoryTitleName">New Directory Name</label>*
                  <input class="form-control" type="text" name="newDirectoryName" id="newDirectoryName"
                        pattern='^([^#/\\:*?<>|"]){1,}$' data-i18n="[data-error]ns.dialogs:directoryNameHelp" required />
                  <p class="help-block with-errors"></p>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-default pull-left cancelButton" data-dismiss="modal" aria-hidden="true">
              <span data-i18n="ns.dialogs:cancel"></span>
            </button>
            <button id="createNewDirectoryButton" class="btn btn-primary" data-dismiss="modal" aria-hidden="true">
              <span data-i18n="ns.dialogs:ok"></span>
            </button>
          </div>
        </div>
      </div>
    </div>`;

  class CreateDirectoryDialog {
    constructor() {
      console.log("Init dialog");
      if ($('#dialogDirectoryCreate').length < 1) {
        const compiledTemplate = Handlebars.compile(createDialogTemplate);
        $('body').append(compiledTemplate());
        //$('#createNewDirectoryButton').off();
        $('#createNewDirectoryButton').on('click', this._createDirectory);

        $('#dialogDirectoryCreate').i18n();
        $('#formDirectoryCreate').validator();
        $('#formDirectoryCreate').submit(function(e) {
          e.preventDefault();
          if ($('#createNewDirectoryButton').prop('disabled') === false) {
            $('#createNewDirectoryButton').click();
          }
        });
        $('#formDirectoryCreate').on('invalid.bs.validator', function() {
          $('#createNewDirectoryButton').prop('disabled', true);
        });
        $('#formDirectoryCreate').on('valid.bs.validator', function() {
          $('#createNewDirectoryButton').prop('disabled', false);
        });
        $('#dialogDirectoryCreate').on('shown.bs.modal', function() {
          $('#newDirectoryName').focus();
        });
        $('#dialogDirectoryCreate').draggable({
          handle: ".modal-header"
        });
      }
    }

    _createDirectory() {
      var dirPath = $('#createNewDirectoryButton').attr('path') + TSCORE.dirSeparator + $('#newDirectoryName').val();
      TSCORE.IO.createDirectoryPromise(dirPath).then(function() {
        TSCORE.showSuccessDialog("Directory created successfully.");
        TSCORE.navigateToDirectory(dirPath);
        TSCORE.hideWaitingDialog();
        TSCORE.hideLoadingAnimation();
      }, function(error) {
        TSCORE.hideWaitingDialog();
        TSCORE.hideLoadingAnimation();
        console.error("Creating directory: " + dirPath + " failed with: " + error);
        TSCORE.showAlertDialog("Creating " + dirPath + " failed!");
      });
    }

    showDialog(dirPath) {
      $('#createNewDirectoryButton').attr('path', dirPath);
      $('#newDirectoryName').val('');
      $('#dialogDirectoryCreate').modal({
        backdrop: 'static',
        show: true
      });
    }
  }

  exports.CreateDirectoryDialog = CreateDirectoryDialog;

});
