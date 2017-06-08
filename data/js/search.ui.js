/* Copyright (c) 2015-present The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars*/
define((require, exports, module) => {
  'use strict';
  console.log('Loading search.ui.js ...');
  const TSCORE = require('tscore');

  let initUI = () => {
    // Search UI
    $('#searchBox').keyup((e) => {
      if (e.keyCode === 13) { // Start the search on ENTER
        this._startSearch();
      } else if (e.keyCode == 27) { // Hide search on ESC
        this._cancelSearch();
      } else {
        TSCORE.Search.nextQuery = this.value;
      }
    }).focus((e) => {
      $("#searchOptions").hide();
    });

    $('#showSearchButton').on('click', () => {
      // Showing the expanded search area
      TSCORE.showSearchArea();
    });

    $('#searchButton').on("click", (e) => {
      this._startSearch();
    });

    $('#startSearchButton').on("click", (e) => {
      e.preventDefault();
      this._updateQuery();
      this._startSearch();
    });

    $('#showSearchOptionsButton').on("click", () => {
      this._showSearchOptions();
    });

    $('#searchOptions').on('click', '.close', () => {
      $('#searchOptions').hide();
    });

    $('#resetSearchButton').on('click', (e) => {
      e.preventDefault();
      this._resetSearchOptions();
      $('#searchBox').val("");
    });

    $('#clearSearchButton').on('click', (e) => {
      e.preventDefault();
      $('#searchOptions').hide();
      this._cancelSearch();
    });

    $('#searchRecursive').attr('checked', TSCORE.Config.getUseSearchInSubfolders());

    $('#searchRecursive').on('click', (e) => {
      this._updateQuery();
    });

    $('#searchTerms').on('blur', (e) => {
      this._updateQuery();
    }).keypress(startSearchOnEnter);

    $('#searchTags').on('blur', (e) => {
      this._updateQuery();
    }).keypress(startSearchOnEnter);

    $('#searchFileType').on('change', (e) => {
      this._updateQuery();
    });

    if (TSCORE.PRO) {
      $('#searchFileType').prop('disabled', false);
      $('#searchHistory').prop('disabled', false);
      $('#searchFileType').attr('title', '');
      $('#searchHistory').attr('title', '');
      $('#searchFileType').removeClass('disabled');
      $('#searchHistory').removeClass('disabled');
    }
  };
  
  class TSSearchUi {

    static _startSearchOnEnter(e) {
      if (e.which == 13) {
        e.preventDefault();
        this._updateQuery();
        this._startSearch();
      }
    }

    //function parseQuery() {}

    static _updateQuery() {
      let query = "";
      if (!$('#searchRecursive').is(':checked')) {
        query = TSCORE.Search.recursiveSymbol + " ";
      }

      let searchTerms = $('#searchTerms').val();
      if (searchTerms.length > 0) {
        searchTerms = searchTerms.split(" ");
        searchTerms.forEach((term) => {
          if (term.length > 1) {
            query = query + " " + term;
          }
        });
      }

      let tags = $('#searchTags').val();
      if (tags.length > 0) {
        tags = tags.split(" ");
        tags.forEach((tag) => {
          if (tag.length > 1) {
            query = query + " +" + tag;
          }
        });
      }

      let fileType = $('#searchFileType').val();
      if (fileType.length > 0) {
        query = query + " " + fileType;
      }

      console.log();
      $('#searchBox').val(query);
      TSCORE.Search.nextQuery = query;
    }

    static _resetSearchOptions() {
      $('#searchRecursive').prop('checked', TSCORE.Config.getUseSearchInSubfolders());
      $('#searchTerms').val("");
      $('#searchTags').val("");
      $('#searchFileType').val("");
      $('#searchHistory').val("");
    }

    static _showSearchOptions() {
      this._resetSearchOptions();
      if (TSCORE.PRO && TSCORE.PRO.Search) {
        TSCORE.PRO.Search.loadSearchHistory();
      }
      var leftPosition = $(".col2").position().left + $(".col2").width();
      leftPosition = leftPosition - ($("#searchOptions").width() + 2);
      $("#searchOptions").css({left: leftPosition});
      $("#searchOptions").show();
    }

    static _startSearch() {
      if (TSCORE.IO.stopWatchingDirectories) {
        TSCORE.IO.stopWatchingDirectories();
      }
      if ($('#searchBox').val().length > 0) {
        let origSearchVal = $('#searchBox').val();
        origSearchVal = origSearchVal.trim();

        if ($('#searchRecursive').prop('checked')) {
          $('#searchBox').val(origSearchVal);
        } else {
          if (origSearchVal.indexOf(TSCORE.Search.recursiveSymbol) === 0) {
            $('#searchBox').val(origSearchVal);
          } else {
            //origSearchVal = origSearchVal.substring(1, origSearchVal.length);
            $('#searchBox').val(TSCORE.Search.recursiveSymbol + " " + origSearchVal);
          }
        }

        if (TSCORE.PRO && TSCORE.PRO.Search) {
          TSCORE.PRO.Search.addQueryToHistory(origSearchVal);
        }
        TSCORE.Search.nextQuery = $('#searchBox').val();
      } else {
        this._cancelSearch();
      }
      $('#searchOptions').hide();
      TSCORE.PerspectiveManager.redrawCurrentPerspective();
    }

    static _cancelSearch() {
      this.clearSearchFilter();
      // Restoring initial dir listing without subdirectories
      TSCORE.IO.listDirectoryPromise(TSCORE.currentPath).then(
        (entries) => {
          TSCORE.PerspectiveManager.updateFileBrowserData(entries);
          TSCORE.updateSubDirs(entries);        
        }
      ).catch((err) => {
        let dir1 = TSCORE.TagUtils.cleanTrailingDirSeparator(TSCORE.currentLocationObject.path);
        let dir2 = TSCORE.TagUtils.cleanTrailingDirSeparator(TSCORE.currentPath);
        // Close the current location if the its path could not be opened
        if (dir1 === dir2) {
          TSCORE.showAlertDialog($.i18n.t('ns.dialogs:errorOpeningLocationAlert'));
          TSCORE.closeCurrentLocation();
        } else {
          TSCORE.showAlertDialog($.i18n.t('ns.dialogs:errorOpeningPathAlert'));
        }      
        console.warn("Error listing directory" + err);
      });
    }

    static showSearchArea() {
      $('#showSearchButton').hide();
      $('#searchToolbar').show();
      $('#searchBox').focus();
    }

    static clearSearchFilter() {
      $('#searchToolbar').hide();
      $('#showSearchButton').show();
      $('#searchOptions').hide();
      $('#searchBox').val('');
      $('#clearFilterButton').removeClass('filterOn');
      TSCORE.Search.nextQuery = '';
    }

    static searchForTag(tagQuery) {
      if (TSCORE.isOneColumn()) {
        TSCORE.closeLeftPanel();
      }
      let nxtQuery = ' +' + tagQuery; //TSCORE.Search.recursiveSymbol + ' +' + tagQuery;
      TSCORE.Search.nextQuery = nxtQuery;
      $('#searchBox').val(nxtQuery);
      TSCORE.PerspectiveManager.redrawCurrentPerspective();
      $('#showSearchButton').hide();
      $('#searchToolbar').show();
      //TSCORE.showSearchArea();
    }
  } 

  // Public API definition
  exports.TSSearchUi = TSSearchUi;
});
