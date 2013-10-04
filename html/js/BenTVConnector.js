function BenTVConnector() {
  this._init();
}

BenTVConnector.version = "1.0";

BenTVConnector.prototype = {
  _init: function() {
    this.xmlhttp = new XMLHttpRequest();
  },

  base64ArrayBuffer: function(arrayBuffer) {
    var base64    = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    var bytes         = new Uint8Array(arrayBuffer)
    var byteLength    = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength    = byteLength - byteRemainder
    var a, b, c, d, chunk

    for (var i = 0; i < mainLength; i = i + 3) {
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
      a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
      b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
      c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
      d = chunk & 63               // 63       = 2^6 - 1
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    if (byteRemainder == 1) {
      chunk = bytes[mainLength]
      a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
      b = (chunk & 3)   << 4 // 3   = 2^2 - 1
      base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
      a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
      b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
      c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
      base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
  },

  str2ab2: function(str, len) {
    var buf = new ArrayBuffer(len); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i=0; i<len; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  },

  requestResource: function(url) {
    console.log("[BenTVConnector] Resource Requested: " + url);
    this.xmlhttp.open("GET", url, true);
    this.xmlhttp.responseType = 'arraybuffer';
    this.xmlhttp.onload = this.readBytes;
    this.xmlhttp.send();

    return parseInt(this.xmlhttp.getResponseHeader("Content-Length"), 10);
  },

  readBytes: function(e) {
    var len = parseInt(e.currentTarget.getResponseHeader("Content-Length"), 10);
    console.log("[BenTVConnector] Reading bytes: " + len);
    bt = new BenTVConnector();
    var res = bt.base64ArrayBuffer(e.currentTarget.response);
    document['BenTVplayer'].resourceLoaded(res);
  }
}
