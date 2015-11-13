
var app = angular.module('DRRrrRrvrr', ['ngRoute']);

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
    .otherwise({
      redirectTo: '/list'
    });
}]);

// -----------------------------------------------------------------------------
// "authGapi" directive:
//  This is a component to get the Google API authorization.
//  Attributes:
//    title: The description to show for the title
//    label: The label on the button.
//    success: Callback to call after getting authorized.
// -----------------------------------------------------------------------------
app.directive('authGapi', ['gapiAuthorize', 'gapiDrive', function (gapiAuthorize, gapiDrive){
    return {
      restrict: 'E',
      controller: function ($scope) {
        var authVm = this;
        var scope = $scope;
        authVm.succeededAuth = false;

        authVm.authorize = function () {
          gapiAuthorize.checkAuth ().then( function (isAuthorized) {
            if (isAuthorized) {
              authVm.succeededAuth = true;

              gapiDrive.getFileList().then ( function (filelist) {
                // Call the callback function.
                if (scope.success) { scope.success(); }
              });
            } else {
              authVm.succeededAuth = false;
              alert('Fail to get the authorization. Try it later.')
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
          success: '&success' // callback from parent scope controller on success.
      },
      templateUrl: 'templates/authGapi.html'
    };
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
// "gapiAuthorize" service:
//  Service to check the autorization.
// -----------------------------------------------------------------------------
app.service('gapiAuthorize', ['OAuthConfig', '$q', function (OAuthConfig, $q) {
  var svc = this;
  svc.authorized = false;
  /**
   * Check if current user has authorized this application.
   * The callback function gets the flag if it is authorized or not.
   *  callback (isAuthorized);
   */
  svc.checkAuth = function() {
    var defer = $q.defer();

    if (svc.authorized) {
      defer.resolve(svc.authorized);
    } else {
      gapi.auth.authorize({
          'client_id': OAuthConfig.CLIENT_ID,
          'scope': OAuthConfig.SCOPES.join(' '),
          'immediate': true
        }, function (authResult) {
          svc.authorized = (authResult && !authResult.error);
          defer.resolve(svc.authorized);
        });
    }

    return defer.promise;
  };
}]);

// -----------------------------------------------------------------------------
// "gapiDrive" service:
//  Service to get data from Google Drive API service.
// -----------------------------------------------------------------------------
app.service('gapiDrive', ['gapiAuthorize', '$http', '$q', function (gapiAuthorize, $http, $q) {
  var svc = this;

  svc.files = [];
  svc.currentFileIndex = -1; // Index of svc.files array
  svc.currentFileId = undefined; // FileId
  svc.fileData = undefined;

  svc.getCurrentFileName = function () {
    if (svc.currentFileIndex >= 0) {
      return svc.files[svc.currentFileIndex].title;
    } else {
      return "";
    }
  };

  svc.getFileList = function () {
    var defer = $q.defer();

    gapiAuthorize.checkAuth ().then( function (hasAuthirized) {
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

  svc.getFile = function (index, asHtmlFormat) {
    var defer = $q.defer();

    if (index < 0 || index >= svc.files.length) {
      defer.reject ('File list is not updated.');
      return defer.promise;
    }

    svc.currentFileIndex = index;
    var fileId = svc.files[index].id;

    gapiAuthorize.checkAuth ().then( function (hasAuthirized) {
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
              var output = fileResp.data;
              if (asHtmlFormat) {
                output.replace(/\n/g, "<br>");
              }
              svc.fileData = output;
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

// -----------------------------------------------------------------------------
// NOTE: My not needed.....
// "authController" controller:
//  Controller to get the authorization.
// -----------------------------------------------------------------------------
app.controller('AuthController', ['gapiAuthorize', 'gapiDrive', '$location', '$interval',
  function (gapiAuthorize, gapiDrive, $location, $interval) {
    var authVm = this;
    authVm.succeededAuth = false;

    authVm.onAuthorize = function () {
      gapiAuthorize.checkAuth ().then( function (isAuthorized) {
        if (isAuthorized) {
          authVm.succeededAuth = true;
          gapiDrive.getFileList().then ( function (filelist) {
            if (filelist) {
              $location.path('/listView');
            }
          });
        } else {
          authVm.succeededAuth = false;
        }
      });
  };
}]);

// -----------------------------------------------------------------------------
// "MoveToListViewController" controller:
//  A wrapper controller to move to list view after getting authorized.
// -----------------------------------------------------------------------------
app.controller('MoveToListViewController', ['$location', function ($location) {
  var moveToListVm = this;
  moveToListVm.doIt = function () {
    $location.path('/listView');
  };
}]);

app.controller('ListViewController', ['gapiDrive', '$location', function (gapiDrive, $location) {
  var listVm = this;
  listVm.files = gapiDrive.files;

  listVm.onSelectFile = function (index) {
    gapiDrive.getFile(index, true).then (function () {
      $location.path('/doc');
    });
  };
}]);

app.controller('DocViewController', ['gapiDrive', '$location', function (gapiDrive, $location) {
  var docVm = this;
  docVm.fileData = gapiDrive.fileData;

  docVm.doGoBackToListView = function () {
    $location.path('/list');
  };

  docVm.hasFileToShow = function () {
    return gapiDrive.currentFileId !== undefined;
  };

  docVm.getFileName = function () {
    return gapiDrive.getCurrentFileName ();
  };

}]);
