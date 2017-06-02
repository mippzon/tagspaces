/* Copyright (c) 2012-present The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define  */
define((require, exports, module) => {
  'use strict';

  console.log('Loading utils.js ...');

  const TSCORE = require('tscore');
  const marked = require("marked");
  const saveAs = require("libs/filesaver.js/FileSaver.min");
  
  class TSUtils {

    static saveAsTextFile(blob, filename) {
      saveAs(blob, filename);
    }

    //Conversion utility
    static arrayBufferToDataURL(arrayBuffer, mime) {
      let blob = new Blob([arrayBuffer], {type: mime});
      let url = window.URL || window.webkitURL;
      return url.createObjectURL(blob);
    }

    static base64ToArrayBuffer(base64) {
      let bstr = window.atob(base64);
      let bytes = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) {
        bytes[i] = bstr.charCodeAt(i);
      }
      return bytes.buffer;
    }

    static dataURLtoBlob(dataURI) {
      let arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1];
      let arrBuff = base64ToArrayBuffer(arr[1]);
      return new window.Blob([arrBuff], {type: mime});
    }

    static getBase64Image(imgURL) {
      let canvas = document.createElement("canvas");
      let img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imgURL;
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    }

    static arrayBufferToStr(buf) {
      let str = '',
        bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return decodeURIComponent(escape(str));
    }

    static arrayBufferToBuffer(ab) {
      let buffer = new Buffer(ab.byteLength);
      let view = new Uint8Array(ab);
      for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
      }
      return buffer;
    }

    static baseName(dirPath) {
      let fileName = dirPath.substring(dirPath.lastIndexOf(TSCORE.dirSeparator) + 1, dirPath.length);
      return fileName ? fileName : dirPath;
    }

    static dirName(dirPath) {

      return dirPath.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
    }

    static getFileExt(fileURL) {
      let ext = fileURL.split('.').pop();
      return (ext === fileURL) ? "" : ext;
    }

    static getURLParameter(variable) {
      let query = window.location.search.substring(1);
      let vars = query.split("&");
      for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        if (pair[0] == variable) {
          return pair[1];
        }
      }
      return false;
    }

    static isVisibleOnScreen(element) {
      let rectangle = element.getBoundingClientRect();
      let isVisible = (
        rectangle.top >= 0 &&
        rectangle.left >= 0 &&
        rectangle.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rectangle.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
      return isVisible;
    }

    static getRandomInt(min, max) {

      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // TODO Use set instead of array in the core for selectedFiles
    static getUniqueSelectedFiles() {
      return _.uniq(TSCORE.selectedFiles);
    }

    /**
     * Convert 64bit url string to Blob
     * @name b64toBlob
     * @method
     * @memberof TSCORE.Utils
     * @param {string} b64Data - the 64bit url string which should be converted to Blob
     * @param {string} contentType - content type of blob
     * @param {int} sliceSize - optional size of slices if omited 512 is used as default
     * @returns {Blob}
     */
    static b64toBlob(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      let byteCharacters = atob(b64Data);
      let byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);
        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      let blob = new Blob(byteArrays, {type: contentType});
      return blob;
    }

    static convertToDateRange(dateRange) {
      let dateRangeRegExp = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[-]([0]?[1-9]|[1][0-2])$/g;
      if (dateRange.match(dateRangeRegExp) || dateRange.search('-')) {
        let range = dateRange.split('-');
        if (parseInt(range[0]) && parseInt(range[1])) {
          return range;
        }
      }
    }

    static convertToDateTime(dateTime) {
      let dateTimeRegExp = /^\d\d\d\d-(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/g;
      let dateTimeWinRegExp = /^(([0-1]?[0-9])|([2][0-3]))!([0-5]?[0-9])(!([0-5]?[0-9]))?$/g;
      let dateTimeWin1RegExp = /^(([0-1]?[0-9])|([2][0-3]))~([0-5]?[0-9])(!([0-5]?[0-9]))?$/g;
      if (dateTime.match(dateTimeRegExp) || dateTime.match(dateTimeWinRegExp) ||
        dateTime.match(dateTimeWin1RegExp) || dateTime.search('!') ||
        dateTime.search(':') || dateTime.search('~')) {

        let time, firstTime, secondTime;
        if (dateTime.indexOf('!')) {
          time = dateTime.split('!');
          if (parseInt(time[0]) && parseInt(time[1])) {
            firstTime = time[0];
            secondTime = time[1];
            if (firstTime.length === 2 && secondTime.length === 2) {
              time = firstTime + ":" + secondTime;
            } else if (firstTime.length > 2 && firstTime.length <= 8) {
              time = convertToDate(firstTime) + " " + toHHMMSS(secondTime);
            }
            return time;
          }
        }
        if (dateTime.indexOf(':')) {
          time = dateTime.split(':');
          if (parseInt(time[0]) && parseInt(time[1])) {
            return time;
          }
        }
        if (dateTime.indexOf('~')) {
          time = dateTime.split('~');
          if (parseInt(time[0]) && parseInt(time[1])) {
            firstTime = time[0];
            secondTime = time[1];
            if (firstTime.length === 2 && secondTime.length === 2) {
              time = firstTime + ":" + secondTime;
            } else if (firstTime.length > 2 && firstTime.length <= 8) {
              time = convertToDate(firstTime) + " " + toHHMMSS(secondTime);
            }
            return time;
          }
        }
      }
    }

    static convertToDate(date) {

      let d = new Date(date);

      let parseToInt = parseInt(date);
      let dateStr, match, betterDateStr;
      switch (date.length) {
        case 4:
          if (parseToInt && !isNaN(parseToInt)) {
            let year = d.getFullYear();

            return year;
          }
          break;
        case 6:
          if (parseToInt && !isNaN(parseToInt)) {
            dateStr = date;
            match = dateStr.match(/(\d{4})(\d{2})/);
            betterDateStr = match[1] + '-' + match[2];

            return betterDateStr;
          }
          break;
        case 8:
          if (parseToInt && !isNaN(parseToInt)) {
            dateStr = date;
            match = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
            betterDateStr = match[1] + '-' + match[2] + '-' + match[3];

            return betterDateStr;
          }
          break;
        default:
          return false;
      }
    }

    static toHHMMSS(time) {
      let timeFormat = time;
      let match = timeFormat.match(/(\d{2})(\d{2})(\d{2})/);
      let hhmmss = match[1] + ':' + match[2] + ':' + match[3];
      return hhmmss;
    }

    // Format Sun May 11, 2014 to 2014-05-11
    static formatDate(date) {
      let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) {
        month = '0' + month;
      }
      if (day.length < 2) {
        day = '0' + day;
      }

      return [year, month, day].join('-');
    }

    // Format Sun May 11, 2014 to 2014-05
    static formatDateMonth(date) {
      let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        year = d.getFullYear();

      if (month.length < 2) {
        month = '0' + month;
      }
      return [year, month].join('-');
    }

    // parse “YYYYmmdd” to 'Fri Jul 15 2016 00:00:00 GMT+0300 (FLE Summer Time)'
    static parseFullDate(date) {
      // validate year as 4 digits, month as 01-12, and day as 01-31
      if ((date = date.match(/^(\d{4})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/))) {
        // make a date
        date[0] = new Date(+date[1], +date[2] - 1, +date[3]);
        // check if month stayed the same (ie that day number is valid)
        if (date[0].getMonth() === +date[2] - 1) {
          return date[0];
        }
      }
    }

    // return array of [years, month]
    static parseToDate(date) {
      let dateMonth = convertToDate(date);
      let d;
      if (dateMonth) {
        d = dateMonth;
      } else if (dateMonth.length === 5) {
        let dateString = dateMonth.split('-');
        d = new Date(dateString[0], dateString[1]);
      }
      return d;
    }


    // Format Sun May 11, 2014 to 2014-05-11
    static parseDate(date) {
      let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) {
        month = '0' + month;
      }
      if (day.length < 2) {
        day = '0' + day;
      }

      return [year, month, day].join('');
    }

    // Format Sun May 11, 2014 to 2014-05
    static parseDateMonth(date) {
      let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        year = d.getFullYear();

      if (month.length < 2) {
        month = '0' + month;
      }
      return [year, month].join('');
    }

    static splitValue(value, index) {
      let currentLat = value.substring(0, index);
      let currentLng = value.substring(index);

      return parseFloat(currentLat) + "," + parseFloat(currentLng);
    }

    static _hasURLProtocol(url) {
      return (
        url.indexOf("http://") === 0 ||
        url.indexOf("https://") === 0 ||
        url.indexOf("file://") === 0 ||
        url.indexOf("data:") === 0
      );
    }

    static handleLinks($element) {
      $element.find("img[src]").each(() => {
        let currentSrc = $(this).attr("src");
        if (!_hasURLProtocol(currentSrc)) {
          let path = (isWeb ? "" : "file://") + TSCORE.currentPath + "/" + currentSrc;
          $(this).attr("src", path);
        }
      });

      $element.find("a[href]").each(() => {
        let currentSrc = $(this).attr("href");
        let path;

        if(currentSrc.indexOf("#") === 0 ) {
          // Leave the default link behaviour by internal links
        } else {
          if (!_hasURLProtocol(currentSrc)) {
            let path = (isWeb ? "" : "file://") + TSCORE.currentPath + "/" + currentSrc;
            $(this).attr("href", path);
          }

          $(this).off();
          $(this).on('click', (e) => {
            e.preventDefault();
            if (path) {
              currentSrc = encodeURIComponent(path);
            }
            let msg = {command: "openLinkExternally", link: currentSrc};
            window.postMessage(JSON.stringify(msg), "*");
          });
        }
      });
    }

    static setMarkDownContent($targetElement, content) {
      $targetElement.html(this.convertMarkdown(content));
      this.handleLinks($targetElement);
    }

    static convertMarkdown(content) {
      let mdOptions = {
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
      }
      if (marked) {
        return marked(content, mdOptions);
      } else {
        console.warn("Marked library not loaded...");
      }
    }

    static guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
  }

  exports.TSUtils = TSUtils;
});
