/* global annyang */
(function () {
  if (!('annyang' in window)) {
    return;
  }

  function sortObjectBy (items, key) {
    var objA;
    var objB;
    var objAKey;
    var objBKey;
    return Object.keys(items).sort(function (a, b) {
      objA = items[a];
      objB = items[b];
      objAKey = (objA[key] || '').toLowerCase();
      objBKey = (objB[key] || '').toLowerCase();
      if (objA[key] && objB[key]) {
        if (objAKey < objBKey) { return -1; }
        if (objAKey > objBKey) { return 1; }
      }
      return 0;
    });
  }

  function looksLikeAUrl (url) {
    url = (url || '').trim();
    if (!url) { return false; }
    return url.indexOf('http:') === 0 || url.indexOf('https:') === 0;
  }

  function coerceToSourceUrl (url) {
    if (!url) { return; }
    if (url.split('/').length - 1 === 1) {
      return 'https://github.com/' + url;
    }
    return url;
  }

  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', directoryLoaded);
  xhr.open('get', 'directory/index.json');
  xhr.send();

  function sanitiseItem (item) {
    var sourceUrl = coerceToSourceUrl(item.source_url);

    if (typeof item.author === 'string') {
      if (looksLikeAUrl(item.author)) {
        item.author = {url: item.author};
      } else {
        item.author = {name: item.author};
      }
    } else {
      if (!item.author.url) {
        if (looksLikeAUrl(item.author.name)) {
          item.author.url = item.author.name;
        } else if (sourceUrl) {
          item.author.url = sourceUrl;
        }
      }
    }

    if (item.start_url && !item.url) {
      item.url = item.url;
    }

    return item;
  }

  function directoryLoaded () {
    try {
      data = JSON.parse(this.responseText);
    } catch (e) {
      return {};
    }
    data = Array.isArray(data.objects) ? data.objects : data;
    data = data.map(sanitiseItem);
    if (annyang.addItems) {
      annyang.addItems(data);
    }
    annyang.start();
    return data;
  }
})();
