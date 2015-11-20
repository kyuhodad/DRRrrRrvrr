// -----------------------------------------------------------------------------
// "GoogleDriveService" service:
//  Service to get data from Google Drive API service.
// -----------------------------------------------------------------------------
angular.module('DRRrrRrvrr')
.service('GoogleDriveService', ['OAuthService', '$http', '$q', function (OAuthService, $http, $q) {
  var svc = this;

  svc.files = [];
  svc.currentFileIndex = -1; // Index of svc.files array
  svc.currentFileId = undefined; // FileId
  svc.fileData = undefined;

  // Get the file name which document view is showing.
  svc.getCurrentFileName = function () {
    if (svc.currentFileIndex >= 0) {
      return svc.files[svc.currentFileIndex].title;
    } else {
      return "";
    }
  };

  //
  // Get all the file list from google drive.
  // It returns promise of which 'then' method gets called with list of files.
  // Also, 'svc.files' array is filled up with the files.
  // (ex) GoogleDriveService.getFileList().then (function(list_Of_files) {
  //              ......
  //          })
  //
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

  //
  // Get the file content of selected file from google drive, and
  // store those information to   svc.currentFileIndex, svc.currentFileId, svc.fileData.
  // It returns promise of which 'then' method gets called with data from the google drive.
  // (ex) GoogleDriveService.getFile().then (function(data) {
  //              ......
  //          })
  //
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
