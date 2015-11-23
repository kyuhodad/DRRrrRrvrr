describe('GoogleDriveService', function(){
  var GoogleDriveService, OAuthService;
  var gapiMock, $httpBackend, $rootScope;

  var fileList = [
      {title:'Document1', id:0},
      {title:'Document2', id:1},
      {title:'Document3', id:2}
  ];
  var mockFileData = [
    'Contents of Document1',
    'Contents of Document2',
    'Contents of Document3\nSecond Line'
  ];
  var mockURL = "/mockURL/";
  var mockReMockURL = /\/mockURL\/(.+)/;
  var mockAccessToken = "auth-file-access-token";

  function mockFilesListObj () {
    this.execute = function (callback) {
      callback({items: fileList});
    };
  }
  function mockFilesGetObj () {
    var self = this;
    self.option = undefined;
    self.execute = function (callback) {
      callback({exportLinks: {"text/plain": mockURL + self.option.fileId}});
    };
  }
  var mockFilesListFn = new mockFilesListObj ();
  var mockFilesGetFn = new mockFilesGetObj ();

  beforeEach(function () {
    angular.mock.module('DRRrrRrvrr');

    // anonymous module to mock services...
    angular.mock.module(function ($provide) {
      // mock gapi.auth.authorize service.
      $provide.service('gapi', function () {
        var svc = this;

        var fileListAPI = {
          list: function(option) { return mockFilesListFn; },
          get:  function(option) { mockFilesGetFn.option = option; return mockFilesGetFn; }
        };

        // mock gapi.auth api
        svc.auth = {
          getToken: function () { return {access_token: mockAccessToken}; }
        };

        // mock gapi.client api
        svc.client = {
          load:   function(drive, version, callback) {
            if (drive && version) {
              svc.client.drive = { files: fileListAPI };
            }
            callback();
          },
          drive: {
              files: fileListAPI
          }
        };
      });

      // mock OAuthService service.
      $provide.service('OAuthService', ['$q', function ($q) {
        var svc = this;
        svc.authorized = true; // As the default, returns true.
        svc.checkAuth = function () {
          var defer = $q.defer();
          defer.resolve(svc.authorized);
          return defer.promise;
        };
      }]);

      // mock runAuthorization service to skip run block
      $provide.service('runAuthorization', function () {
        this.run = function () {
        };
      });
    });

    angular.mock.inject (function ($injector, _$rootScope_) {
      $rootScope = _$rootScope_;

      GoogleDriveService = $injector.get('GoogleDriveService');
      OAuthService = $injector.get('OAuthService');
      gapiMock = $injector.get('gapi');
      window.gapi = gapiMock;

      $httpBackend = $injector.get('$httpBackend');
      $httpBackend
      .when('GET', mockReMockURL)
        .respond(function(method, url) {
          var splitUrl = url.split('/');
          return [200, mockFileData[splitUrl[2]]];
      });
    });
  });

  afterEach (function () {
    $rootScope.$apply();
  });

  it("should be available and initialized properly.", function(){
    // As default, it is authorized for unit test.
    expect(OAuthService.authorized).toBeTruthy();

    expect(GoogleDriveService).not.toBeUndefined();
    expect(GoogleDriveService.files.length).toBe(0);
    expect(GoogleDriveService.currentFileIndex).toBe(-1);
    expect(GoogleDriveService.fileData).toBeUndefined();
    expect(GoogleDriveService.splitFileData).toBeUndefined();
    expect(GoogleDriveService.currentFileId).toBeUndefined();
    expect(GoogleDriveService.getCurrentFileName()).toBe("");
  });

  describe('GoogleDriveService.getFileList', function(){
    it("should call porper google client APIs in getFileList only if authorized.", function(){
      spyOn(gapiMock.client, "load").and.callThrough();
      spyOn(gapiMock.client.drive.files, "list").and.callThrough();
      spyOn(mockFilesListFn, "execute").and.callThrough();

      GoogleDriveService.getFileList().then (function (fileList) {
        expect(gapiMock.client.load).toHaveBeenCalled();
        expect(gapiMock.client.drive.files.list).toHaveBeenCalled();
        expect(mockFilesListFn.execute).toHaveBeenCalled();
      });
    });

    it("should return list of file data by getFileList function.", function(){
      GoogleDriveService.getFileList().then (function (items) {
        expect(items.length).toBe(fileList.length);
        expect(items).toEqual(fileList);
        expect(GoogleDriveService.files).toEqual(items);
      });
    });

    it("should not call any google client APIs in getFileList if not authorized.", function(){
      OAuthService.authorized = false;

      spyOn(gapiMock.client, "load").and.callThrough();
      spyOn(gapiMock.client.drive.files, "list").and.callThrough();

      GoogleDriveService.getFileList().then (function (fileList) {
        // Should not be here....
        expect(true).toBe(false);
      }, function (reason) {
        // Should be here since it is not authorized.
        expect(reason).not.toBeNull();
        expect(gapiMock.client.load).not.toHaveBeenCalled();
        expect(gapiMock.client.drive.files.list).not.toHaveBeenCalled();
      });
    });
  });

  describe('GoogleDriveService.getFile', function(){
    it("should call porper google client APIs in getFile only if authorized.", function(){
      spyOn(gapiMock.client, "load").and.callThrough();
      spyOn(gapiMock.client.drive.files, "get").and.callThrough();
      spyOn(gapiMock.auth, "getToken").and.callThrough();
      spyOn(mockFilesGetFn, "execute").and.callThrough();

      var fileIdx = 0;
      GoogleDriveService.getFileList().then (function (items) {
        gapiMock.client.load.calls.reset();
        gapiMock.client.drive.files.get.calls.reset();
        mockFilesGetFn.execute.calls.reset();
        gapiMock.auth.getToken.calls.reset();

        // Register expectation of $http with 'GET' and specified URL
        $httpBackend.expect("GET", mockURL+fileIdx);

        GoogleDriveService.getFile(fileIdx).then (function (data) {
          expect(gapiMock.client.load).toHaveBeenCalled();
          expect(gapiMock.client.drive.files.get).toHaveBeenCalled();
          expect(mockFilesGetFn.execute).toHaveBeenCalled();
          expect(gapiMock.auth.getToken).toHaveBeenCalled();
        });

      });
      $httpBackend.flush();
    });

    it("should get file data by getFile function.", function(){
      var fileIdx = 1;
      GoogleDriveService.getFileList().then (function (items) {
        GoogleDriveService.getFile(fileIdx).then (function (data) {
          expect(data).toEqual(mockFileData[fileIdx]);

          expect(GoogleDriveService.currentFileIndex).toBe(fileIdx);
          expect(GoogleDriveService.currentFileId).toBe(fileList[fileIdx].id);
          expect(GoogleDriveService.fileData).toEqual(data);
          expect(GoogleDriveService.splitFileData[0]).toEqual(data);
        });
      });
      $httpBackend.flush();
    });

    it("should split file data at new lines and save them in splitFileData.", function(){
      var fileIdx = 2;
      GoogleDriveService.getFileList().then (function (items) {
        GoogleDriveService.getFile(fileIdx).then (function (data) {
          var splitData = mockFileData[fileIdx].split('\n');
          expect(GoogleDriveService.splitFileData.length).toBe(splitData.length);
          expect(GoogleDriveService.splitFileData[0]).toMatch(splitData[0]);
          expect(GoogleDriveService.splitFileData[1]).toMatch(splitData[1]);
        });
      });
      $httpBackend.flush();
    });

    it("should fail if the file list is not updated.", function(){
      var fileIdx = 0;
      GoogleDriveService.getFile(fileIdx).then (function (data) {
        // Should not be here...
        expect(false).toBe(true);
      }, function (reason) {
        expect(reason).toMatch("Invalid file index or it has not updated file list.");
      });
    });

    it("should fail if the file index is invalid.", function(){
      var fileIdx = 10;
      GoogleDriveService.getFileList().then (function (items) {
        GoogleDriveService.getFile(fileIdx).then (function (data) {
          // Should not be here...
          expect(false).toBe(true);
        }, function (reason) {
          expect(reason).toMatch("Invalid file index or it has not updated file list.");
        });
      });
    });
  });

});
