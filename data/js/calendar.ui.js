/* Copyright (c) 2012-present The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars, isFirefox */
define((require, exports, module) => {
  'use strict';
  console.log('Loading calendar.ui.js ...');

  const TSCORE = require('tscore');

  require('datetimepicker');
  require('moment');
  
  class TSCalendar {

    static initCalendarUI() {
      $('#dateCalendarInput').click(() => {
        $('#dateTimeCalendar').hide();
        $('#dateTimeRange').hide();
        $('#dateCalendar').show();
      });

      $('#dateTimeInput').click(() => {
        $('#dateTimeCalendar').show();
        $('#dateTimeRange').hide();
        $('#dateCalendar').hide();
      });
      $('#dateTimeRangeInput').click(() => {
        $('#dateTimeCalendar').hide();
        $('#dateTimeRange').show();
        $('#dateCalendar').hide();
      });

      $('.nav-tabs a[href="#dateCalendarTab"]').on('click', () => {
        $('#dateCalendar').datetimepicker({
          viewMode: 'days',
          format: 'YYYY/MM/DD',
          inline: true,
          sideBySide: false,
          calendarWeeks: true,
          showTodayButton: true,
          allowInputToggle: true,
          useCurrent: true
        });
        let defaultDateCalendar = "2016-01-01";
        $('#dateCalendar').on('dp.change', (e) => {
          let d;
          let currentDate;
          d = e.date._d;
          currentDate = TSCORE.Utils.parseDate(d);
          $('#newTagName').val(currentDate);
        });
        $('#dateCalendar').data('DateTimePicker').format('YYYY/MM/DD').defaultDate(defaultDateCalendar).viewMode('days').toggle().show();
      });

      $('.nav-tabs a[href="#dateTimeCalendarTab"]').on('click', () => {
        $('#dateTimeCalendar').datetimepicker({
          viewMode: 'days',
          inline: true,
          sideBySide: false,
          calendarWeeks: true,
          showTodayButton: true,
          allowInputToggle: true,
          useCurrent: true
        });
        let defaultDateCalendar = "1990-01-01";
        $('#dateTimeCalendar').on('dp.change', (e) => {
          let currentDate;
          let d = e.date._d;
          let getHours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
          let getMinutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
          //var getSeconds = d.getSeconds();

          let time = getHours + '' + getMinutes + '' + '00';
          currentDate = TSCORE.Utils.parseDate(d);
          let dateDivider;
          dateDivider = '~';
          currentDate = currentDate + dateDivider + time;

          $('#newTagName').val(currentDate);
        });
        $('#dateTimeCalendar').data('DateTimePicker').format('YYYY/MM/DD').defaultDate(defaultDateCalendar).viewMode('days').toggle().show();
      });

      $('.nav-tabs a[href="#dateRangeTab"]').on('click', () => {
        let defaultDateCalendarFrom = "2016-01-01";
        let defaultDateCalendarTo = "2016-01-01";

        $('#dateTimeRangeCalendar').datetimepicker({
          viewMode: 'days',
          format: 'YYYY/MM/DD',
          //extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
          inline: true,
          sideBySide: false,
          calendarWeeks: true,
          showTodayButton: true,
          allowInputToggle: true,
          useCurrent: true
        });

        $('#dateTimeRangeCalendar').on('dp.change', (e) => {
          let d = e.date._d;
          let currentMinDate = TSCORE.Utils.parseDate(d);
          let oldValue = $('#newTagName').val();
          oldValue = oldValue.split('-');
          oldValue = oldValue[1];
          $('#newTagName').val(currentMinDate + "-" + oldValue);
        });

        $('#dateTimeRangeCalendar').data('DateTimePicker').defaultDate(defaultDateCalendarFrom).viewMode('days').toggle().show();

        $('#dateTimeRangeMaxCalendar').datetimepicker({
          viewMode: 'days',
          format: 'YYYY/MM/DD',
          //extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
          inline: true,
          sideBySide: false,
          calendarWeeks: true,
          showTodayButton: true,
          allowInputToggle: true,
          useCurrent: true
        });

        $('#dateTimeRangeMaxCalendar').on('dp.change', (e) => {
          let d = e.date._d;
          let currentMaxDate = TSCORE.Utils.parseDate(d);

          let oldValue = $('#newTagName').val();
          oldValue = oldValue.split('-');
          oldValue = oldValue[0];
          $('#newTagName').val(oldValue + "-" + currentMaxDate);
        });

        $('#dateTimeRangeMaxCalendar').data('DateTimePicker').defaultDate(defaultDateCalendarTo).viewMode('days').toggle().show();
      });
    }

    static dateCalendarTag(currentDateTime) {
      let defaultDateCalendar = TSCORE.Utils.parseToDate(currentDateTime);
      let viewMode = '', format = '';

      if (defaultDateCalendar.toString().length === 7 || defaultDateCalendar.length === 7) {
        viewMode = 'months';
        format = 'YYYY/MM';
      } else if (defaultDateCalendar.toString().length === 4) {
        viewMode = 'years';
        format = 'YYYY';
      } else if (defaultDateCalendar.toString().length === 10) {
        viewMode = 'days';
        format = 'YYYY/MM/DD';
      } else {
        viewMode = 'days';
        format = 'YYYY/MM/DD';
      }

      $('#dateCalendar').datetimepicker({
        //extraFormats: ['YYYY-MM-DD', 'YYYY-MM'],
        format: 'YYYY/MM/DD',
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: true
      });

      $('#dateCalendar').on('dp.change', (e) => {
        let d;
        let currentDate;
        if (viewMode === 'years') {
          d = e.date._d;
          currentDate = d.getFullYear();
        } else if (viewMode === 'months') {
          d = e.date._d;
          currentDate = TSCORE.Utils.parseDateMonth(d);
        } else if (viewMode === 'default' || viewMode === 'days') {
          d = e.date._d;
          currentDate = TSCORE.Utils.parseDate(d);
        } else {
          d = e.date._d;
          currentDate = TSCORE.Utils.parseDate(d);
        }
        $('#newTagName').val(currentDate);
      });
      $('#dateCalendar').data('DateTimePicker').format(format).useCurrent(true).defaultDate(defaultDateCalendar).viewMode(viewMode).toggle().show();
    }

    static showDateTimeCalendar(currentDateTime) {
      $('#dateTimeCalendar').datetimepicker({
        inline: true,
        sideBySide: true,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: true,
        extraFormats: ['YYYY-MM-DD HH:mm:ss', 'HH:mm:ss', 'HH:mm']
      });

      let defaultDate = TSCORE.Utils.convertToDateTime(currentDateTime);
      $('#dateTimeCalendar').on('dp.change', (e) => {
        let currentDate;
        let d = e.date._d;
        let getHours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        let getMinutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        //var getSeconds = d.getSeconds();

        let time = getHours + '' + getMinutes + '' + '00';
        currentDate = TSCORE.Utils.parseDate(d);
        let dateDivider;
        let dateTag = TSCORE.selectedTag;
        if (dateTag.length !== 5) {
          if (dateTag.indexOf('~') !== -1) {
            dateDivider = '~';
            currentDate = currentDate + dateDivider + time;
          }
          if (dateTag.indexOf(':') !== -1 && dateTag.length !== 5) {
            dateDivider = ':';
            currentDate = currentDate + dateDivider + time;
          }
          if (dateTag.indexOf('!') !== -1 && dateTag.length !== 5) {
            dateDivider = '!';
            currentDate = currentDate + dateDivider + time;
          }
        } else {
          if (dateTag.indexOf('~')) {
            dateDivider = '~';
            currentDate = getHours + dateDivider + getMinutes;
          }
          if (dateTag.indexOf(':')) {
            dateDivider = ':';
            currentDate = getHours + dateDivider + getMinutes;
          }
          if (dateTag.indexOf('!')) {
            dateDivider = '!';
            currentDate = getHours + dateDivider + getMinutes;
          }
        }
        $('#newTagName').val(currentDate);
      });

      $('#dateTimeCalendar').data('DateTimePicker').format('YYYY-MM-DD HH:mm:ss').useCurrent(true).defaultDate(defaultDate).toggle().show();
    }

    static dateRangeCalendar(currentDateTime) {
      let range = TSCORE.Utils.convertToDateRange(currentDateTime);
      console.log(range);
      let viewMode = '', format = '';
      if ((range[0].toString().length === 6 || range[0].length === 6) &&
        (range[1].toString().length === 6 || range[1].length === 6)) {
        viewMode = 'months';
        format = 'YYYY-MM';
      } else if (range[0].toString().length === 4 &&
        range[1].toString().length === 4) {
        viewMode = 'years';
        format = 'YYYY';
      } else {
        viewMode = 'days';
        format = 'YYYY-MM-DD';
      }

      $('#dateTimeRangeCalendar').datetimepicker({
        extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: true
      });

      $('#dateTimeRangeCalendar').on('dp.change', (e) => {
        let currentMinDate;
        let d;
        if (viewMode === 'years') {
          d = e.date._d;
          currentMinDate = d.getFullYear();
        } else if (viewMode === 'months') {
          d = e.date._d;
          currentMinDate = TSCORE.Utils.parseDateMonth(d);
        } else if (viewMode === 'days') {
          d = e.date._d;
          currentMinDate = TSCORE.Utils.parseDate(d);
        }
        let oldValue = $('#newTagName').val();
        oldValue = oldValue.split('-');
        oldValue = oldValue[1];
        $('#newTagName').val(currentMinDate + "-" + oldValue);
      });

      $('#dateTimeRangeCalendar').data('DateTimePicker').format(format).useCurrent(true).defaultDate(TSCORE.Utils.convertToDate(range[0])).viewMode(viewMode).toggle().show();

      $('#dateTimeRangeMaxCalendar').datetimepicker({
        extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: true
      });

      $('#dateTimeRangeMaxCalendar').on('dp.change', (e) => {
        let d;
        let currentMaxDate;
        if (viewMode === 'years') {
          d = e.date._d;
          currentMaxDate = d.getFullYear();
        } else if (viewMode === 'months') {
          d = e.date._d;
          currentMaxDate = TSCORE.Utils.parseDateMonth(d);
        } else if (viewMode === 'days') {
          d = e.date._d;
          currentMaxDate = TSCORE.Utils.parseDate(d);
        }
        let oldValue = $('#newTagName').val();
        oldValue = oldValue.split('-');
        oldValue = oldValue[0];
        $('#newTagName').val(oldValue + "-" + currentMaxDate);
      });

      $('#dateTimeRangeMaxCalendar').data('DateTimePicker').format(format).useCurrent(true).defaultDate(TSCORE.Utils.convertToDate(range[1])).viewMode(viewMode).toggle().show();
    }

    static tagRecognition(dataTag) {
      let geoLocationRegExp = /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g;

      let dateTimeRegExp = /^\d\d\d\d-(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/g;
      let dateTimeWinRegExp = /^(([0-1]?[0-9])|([2][0-3]))!([0-5]?[0-9])(!([0-5]?[0-9]))?$/g;
      let dateRangeRegExp = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[-]([0]?[1-9]|[1][0-2])$/g;
      let geoTag = 'geo-tag';
      let currentCoordinate;
      let currentDateTime = dataTag;

      let year = parseInt(currentDateTime) && !isNaN(currentDateTime) &&
        currentDateTime.length === 4;
      let month = parseInt(currentDateTime) && !isNaN(currentDateTime) &&
        currentDateTime.length === 6;
      let date = parseInt(currentDateTime) && !isNaN(currentDateTime) &&
        currentDateTime.length === 8;

      let convertToDateTime = TSCORE.Utils.convertToDateTime(currentDateTime);

      let yearRange, monthRange, dateRange;

      if (dataTag.lastIndexOf('+') !== -1) {
        currentCoordinate = TSCORE.Utils.splitValue(dataTag, dataTag.lastIndexOf('+'));
      } else if (dataTag.lastIndexOf('-') !== -1) {
        currentCoordinate = TSCORE.Utils.splitValue(dataTag, dataTag.lastIndexOf('-'));

        let character = currentDateTime.split("-");
        if (!currentCoordinate.search(".") && character) {
          let firstInt = parseInt(character[0]);
          let secondInt = parseInt(character[1]);
          yearRange = monthRange = dateRange =
            typeof firstInt === 'number' && !isNaN(firstInt) &&
            typeof secondInt === 'number' && !isNaN(secondInt);
        }
      }

      let dateRegExp = yearRange || monthRange || dateRange ||
        currentDateTime.match(dateTimeRegExp) ||
        currentDateTime.match(dateTimeWinRegExp) ||
        year || month || date || convertToDateTime;

      if (geoLocationRegExp.exec(currentCoordinate) || geoTag === dataTag) {
        if (TSCORE.PRO) {
          $('.nav-tabs a[href="#geoLocation"]').tab('show');
        } else {
          $('.nav-tabs a[href="#plainEditorTab"]').tab('show');
        }
      } else if (dateRegExp) {
        let dateTab = year || month || date;
        let dateTimeTab = currentDateTime.match(dateTimeRegExp) ||
          currentDateTime.match(dateTimeWinRegExp) || convertToDateTime;
        let dateRangeTab = currentDateTime.match(dateRangeRegExp) ||
          yearRange || monthRange || dateRange;

        if (dateTab) {
          $('.nav-tabs a[href="#dateCalendarTab"]').tab('show');
          //$('#dateCalendarInput').prop('checked', true);
          //if (document.getElementById('dateCalendarInput').checked) {
          TSCORE.Calendar.dateCalendarTag(currentDateTime);
        } else if (dateTimeTab) {
          $('.nav-tabs a[href="#dateTimeCalendarTab"]').tab('show');
          //$('#dateTimeInput').prop('checked', true);
          //if (document.getElementById('dateTimeInput').checked) {
          TSCORE.Calendar.showDateTimeCalendar(currentDateTime);
        } else if (dateRangeTab) {
          $('.nav-tabs a[href="#dateRangeTab"]').tab('show');
          //$('#dateTimeRangeInput').prop('checked', true);
          //if (document.getElementById('dateTimeRangeInput').checked) {
          TSCORE.Calendar.dateRangeCalendar(currentDateTime);
        }
      } else if (!(dateRegExp && geoLocationRegExp.exec(currentCoordinate))) {
        $('.nav-tabs a[href="#plainEditorTab"]').tab('show');
      } else {
        throw new TypeError("Invalid data.");
      }
    }
  }
  
  // Public API definition
  exports.TSCalendar = TSCalendar;
});