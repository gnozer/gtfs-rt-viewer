function GET (url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
	 // xhr.withCredentials = true;
xhr.responseType = "arraybuffer";

    xhr.open('GET', url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
}

