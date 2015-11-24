angular.module('DRRrrRrvrr')
.service("ZTranslator", ['$http', '$q', function ($http, $q) {
  var svc = this;

  svc.zombify = function (inputStr, id) {
    var defer = $q.defer();

    var baseUrl = "http://ancient-anchorage-9224.herokuapp.com/zombify?q=";

    // Clean-up continuous whitespaces with single whitespace.
    var trimedInputStr = inputStr.replace(/\s+/gm, " ");

    // Request translation with blocked data since the service has input size limit.
    var blockSize = 1024;
    var numBlocks = Math.ceil (trimedInputStr.length / blockSize);
    if (numBlocks == 0) {
      failHttpGet ();
    } else {
      var receivedStrings = [];

      // Loop through for the translation requests
      var countReceived = 0;
      var hasFailed = false;

      for (var i=0; i<numBlocks && !hasFailed; i++) {
        var strToSend = trimedInputStr.substr(i*blockSize, blockSize);
        var url = baseUrl + strToSend;
        var prevWS = (strToSend.search(/^\s+/) >= 0) ? " " : "";
        var postWS = (strToSend.search(/\s+$/) >= 0) ? " " : "";

        var trimmed = strToSend.trim();
        if (trimmed.length > 0) {
          // Translate a string by using zombify service.
          $http.get(url, { data: {index:i, whitespaces:[prevWS, postWS]} })
               .then(successHttpGet, failHttpGet);
        } else {
          receivedStrings[i] = prevWS + postWS;

          countReceived++;
          if (countReceived === numBlocks) {
            mergeAndResolve ();
          }
        }
      }
    }

    // Success callback
    function successHttpGet(resp) {
      receivedStrings[resp.config.data.index] = resp.config.data.whitespaces[0] +
                                                resp.data.message +
                                                resp.config.data.whitespaces[1];
      countReceived++;
      if (countReceived === numBlocks) {
        mergeAndResolve ();
      }
    }

    // Fail callback
    function failHttpGet () {
      // Error with undefined result
      hasFailed = true;
      defer.resolve({ result: "", index: id });
    }

    function mergeAndResolve () {
      // Make a single string and resolve it.
      var outputStr = "";
      for (var j=0; j<numBlocks; j++) {
        if (receivedStrings[j]) {
          outputStr += receivedStrings[j];
        }
      }
      // Resolve it.
      defer.resolve({ result: outputStr, index: id });
    }

    return defer.promise;
  };

}]);
