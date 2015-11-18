
var app = angular.module('DRRrrRrvrr', ['ngRoute']);

app.run(['OAuthService', 'GoogleDriveService', '$interval', '$location', '$rootScope',
  function (OAuthService, GoogleDriveService, $interval, $location, $rootScope) {
    // '/auth' is the first view.
    $location.path('/auth');

    OAuthService.checkAuth(4, 2000).then (function (isAuthorized) {
      if (isAuthorized) {
        GoogleDriveService.getFileList().then ( function () {
          $location.path('/list');
        });
      }
    });
  }]);

//
// Configuration for the views
//
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    .when('/list', {
      templateUrl: 'templates/listView.html',
      controller: 'ListViewController',
      controllerAs: 'listVm'
    })
    .when('/doc', {
      templateUrl: 'templates/docView.html',
      controller: 'DocViewController',
      controllerAs: 'docVm'
    })
    .when('/auth', {
      template: '<h4>{{auvVm.messageToShow ()}}</h4>',
      controller: 'AuthViewController',
      controllerAs: 'auvVm'
    })
    .otherwise({
      redirectTo: '/list'
    });
}]);

// -----------------------------------------------------------------------------
// "OAuthConfig" value: Holding the CLIENT_ID & SCOPE to get authorized for
// Google Service.
// -----------------------------------------------------------------------------
app.value('OAuthConfig', {
  CLIENT_ID: '905693818138-c8q6jtqnq2isv36o0aeqbs92lk66d0m5.apps.googleusercontent.com',
  SCOPES: ['https://www.googleapis.com/auth/drive.readonly']
});

// -----------------------------------------------------------------------------
// "OAuthService" service:
//  Service to check the autorization.
// -----------------------------------------------------------------------------
app.service('OAuthService', ['OAuthConfig', '$q', '$interval', function (OAuthConfig, $q, $interval) {
  var svc = this;
  svc.authorized = false;
  svc.status = -1; // Initial state

  /**
   * Check if current user has authorized this application.
   */
  svc.checkAuth = function(maxNumOfTries, delay) {
    if (maxNumOfTries === undefined) maxNumOfTries = 4;
    if (delay === undefined) delay = 2000;

    var defer = $q.defer();

    if (svc.authorized) {
      defer.resolve(svc.authorized);
    } else {
      var count = 0;
      svc.status = 0; // on getting authorized

      var checkProcess = $interval(function () {
        count++;
        if (count >= 4) {
          $interval.cancel(checkProcess);
          svc.status = -2;
          defer.resolve(svc.authorized);
          $interval.cancel(checkProcess);
        } else {
          gapi.auth.authorize({
              'client_id': OAuthConfig.CLIENT_ID,
              'scope': OAuthConfig.SCOPES.join(' '),
              'immediate': true
            }, function (authResult) {
              svc.authorized = (authResult && !authResult.error);
              if (svc.authorized) {
                svc.status = 1;
                defer.resolve(svc.authorized);
                $interval.cancel(checkProcess);
              }
            });
        }
      }, delay);
    }

    return defer.promise;
  };

}]);

// -----------------------------------------------------------------------------
// "authGapi" directive:
//  This is a component to get the Google API authorization.
//  Attributes:
//    title: The description to show for the title
//    label: The label on the button.
//    success: Callback to call after getting authorized.
// -----------------------------------------------------------------------------
app.directive('authGapi', ['OAuthService', 'GoogleDriveService', function (OAuthService, GoogleDriveService){
    return {
      restrict: 'E',
      controller: function ($scope) {
        var authVm = this;
        var scope = $scope;
        authVm.succeededAuth = false;

        authVm.authorize = function () {
          OAuthService.checkAuth ().then( function (isAuthorized) {
            if (isAuthorized) {
              authVm.succeededAuth = true;

              GoogleDriveService.getFileList().then ( function (filelist) {
                // Call the callback function.
                if (scope.success) { scope.success(); }
              });
            } else {
              authVm.succeededAuth = false;
            }
          });
        };

        var defaultTitle = "Get authorization for access to Drive API: ";
        var defaultLabel = "Authorize";
        authVm.getTitle = function () { return scope.title ? scope.title : defaultTitle; };
        authVm.getLabel = function () { return scope.label ? scope.label : defaultLabel; };
      },

      controllerAs: "authVm",
      scope: {
          title: '@title',
          label: '@label',
          success: '&onSuccess' // callback from parent scope controller on success.
      },
      templateUrl: 'templates/authGapi.html'
    };
}]);

// -----------------------------------------------------------------------------
// "GoogleDriveService" service:
//  Service to get data from Google Drive API service.
// -----------------------------------------------------------------------------
app.service('GoogleDriveService', ['OAuthService', '$http', '$q', function (OAuthService, $http, $q) {
  var svc = this;

  svc.files = [];
  svc.currentFileIndex = -1; // Index of svc.files array
  svc.currentFileId = undefined; // FileId
  svc.fileData = undefined;
  svc.fileDataHtml = undefined;

  svc.getCurrentFileName = function () {
    if (svc.currentFileIndex >= 0) {
      return svc.files[svc.currentFileIndex].title;
    } else {
      return "";
    }
  };

  svc.getFileList = function () {
    var defer = $q.defer();

    OAuthService.checkAuth ().then( function (hasAuthirized) {
      if (hasAuthirized) {
        gapi.client.load('drive', 'v2', function () {
          var request = gapi.client.drive.files.list({
              'maxResults': 10,
              'q': "mimeType = 'application/vnd.google-apps.document'"
            });

          request.execute( function(resp) {
            svc.files = resp.items;
            defer.resolve(resp.items);
          });
        });
      } else {
        defer.reject ('Not authorized');
      }
    });

    return defer.promise;
  };

  svc.getFile = function (index) {
    var defer = $q.defer();

    if (index < 0 || index >= svc.files.length) {
      defer.reject ('File list is not updated.');
      return defer.promise;
    }

    svc.currentFileIndex = index;
    var fileId = svc.files[index].id;

    OAuthService.checkAuth ().then( function (hasAuthirized) {
      if (hasAuthirized) {
        gapi.client.load('drive', 'v2', function () {
        svc.currentFileId = fileId;

        // fileId = window.location.hash.substring(1);
        var request = gapi.client.drive.files.get({fileId: fileId});

        request.execute(function(resp) {
          var accessToken = gapi.auth.getToken().access_token;
          $http.get(
            resp.exportLinks["text/plain"], {
              headers: { 'Authorization': "Bearer "+accessToken }
            }).then(function (fileResp) {
              svc.fileData = fileResp.data;
              svc.fileDataHtml = svc.fileData.replace(/\n/g, "<br>");
              defer.resolve(svc.fileData);
            }, function () {
              svc.fileData = undefined;
              defer.resolve(svc.fileData);
            });
          });
        });
      } else {
        defer.reject ('Not authorized');
      }
    });

    return defer.promise;
  };
}]);

app.service("ZTranslator", ['$http', '$q', function ($http, $q) {
  var svc = this;

  svc.zombify = function (inputStr) {
    var defer = $q.defer();

    var baseUrl = "http://ancient-anchorage-9224.herokuapp.com/zombify?q=";

    // Clean-up continuous whitespaces with single whitespace.
    var trimedInputStr = inputStr.replace(/\s+/gm, " ");

    // Request translation with blocked data since the service has input size limit.
    var blockSize = 1024;
    var numBlocks = Math.ceil (trimedInputStr.length / blockSize);
    var receivedStrings = [];

    // Loop through for the translation requests
    var countReceived = 0;
    for (var i=0; i<numBlocks; i++) {
      var strToSend = trimedInputStr.substr(i*blockSize, blockSize);
      var url = baseUrl + strToSend;
      var prevWS = (strToSend.search(/^\s+/) >= 0) ? " " : "";
      var postWS = (strToSend.search(/\s+$/) >= 0) ? " " : "";

      // Translate using zombify service.
      $http.get(url, {data:{index:i, whitespaces:[prevWS, postWS]}}).then(function (resp) {
        receivedStrings[resp.config.data.index] = resp.config.data.whitespaces[0] +
                                                  resp.data.message +
                                                  resp.config.data.whitespaces[1];
        countReceived++;
        if (countReceived === numBlocks) {
          // Now, all results have been receivec. Make a single string.
          var outputStr = "";
          for (var j=0; j<numBlocks; j++) {
            if (receivedStrings[j])
              outputStr += receivedStrings[j];
          }

          // Resolve it.
          defer.resolve(outputStr);
        }
      }, function () {
        // Error with undefined result
        defer.resolve(undefined);
      });
    }

    return defer.promise;
  };

}]);

// -----------------------------------------------------------------------------
// "AuthController" controller:
//  A wrapper controller to move to list view after getting authorized.
// -----------------------------------------------------------------------------
app.controller('AuthController', ['$location', 'OAuthService', function ($location, OAuthService) {
  var auVm = this;
  auVm.hasAuthorized = function () {
    return OAuthService.authorized;
  };
  auVm.doIt = function () {
    $location.path('/list');
  };
}]);

app.controller('ListViewController', ['GoogleDriveService', 'ZTranslator', '$location',
  function (GoogleDriveService, ZTranslator, $location) {
    var listVm = this;
    listVm.files = GoogleDriveService.files;
    listVm.titlesInZombie = [];
    for (var i=0; i<listVm.files.length; i++) {
      ZTranslator.zombify (listVm.files[i].title).then (function (dataInZombie) {
        listVm.titlesInZombie.push(dataInZombie);
      });
    }

    listVm.onSelectFile = function (index) {
      GoogleDriveService.getFile(index).then (function () {
        $location.path('/doc');
      });
    };

    listVm.refreshList = function () {
      GoogleDriveService.getFileList();
    };
}]);

app.controller('DocViewController', ['GoogleDriveService', 'ZTranslator', '$location', '$scope',
  function (GoogleDriveService, ZTranslator, $location, $scope) {
    var docVm = this;
    docVm.fileData = GoogleDriveService.fileData;
    docVm.fileName = GoogleDriveService.getCurrentFileName ();
    docVm.fileNameInZombie = undefined;
    docVm.fileDataInZombie = undefined;

    // Translate the file name
    ZTranslator.zombify (docVm.fileName).then (function (dataInZombie) {
      docVm.fileNameInZombie = dataInZombie;
    });

    // Translate the document content
    ZTranslator.zombify (docVm.fileData).then (function (dataInZombie) {
      docVm.fileDataInZombie = dataInZombie;
    });

    docVm.doGoBackToListView = function () {
      $location.path('/list');
    };

    docVm.hasFileToShow = function () {
      return GoogleDriveService.currentFileId !== undefined;
    };
}]);

app.controller('AuthViewController', ['OAuthService', function (OAuthService) {
  var auvVm = this;

  auvVm.messageToShow = function () {
    switch (OAuthService.status) {
      case 0:
        return "Authorizing.......";
      case 1:
        return "Successfully authorized.......";
      case -2:
        return "Fail to get authorized. Try it later or click <Authorize> button.";
      default:
      case -1:
        return "Initializing...";
    }
  };
}]);
