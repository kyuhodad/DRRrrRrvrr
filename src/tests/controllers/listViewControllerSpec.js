describe('ListViewController', function(){
  var module = angular.mock.module;
  var inject = angular.mock.inject;

  var ListViewController, GoogleDriveService, ZTranslator;
  var $location, $rootScope;

  var mockTitle = "File List";
  var mockTitleZ = "FrrRrlrr LrrRrst";
  var mockFileList = [
    { title: "Document 1", id: 1},
    { title: "Document 2", id: 2},
    { title: "Document 3", id: 3},
    { title: "Document 4", id: 4}
  ];
  var mockFileData = [
    "Document Data 1",
    "Document Data 2",
    "Document Data 3",
    "Document Data 4"
  ];

  var mockZombifyMap = {};
  mockZombifyMap[mockTitle] = mockTitleZ;
  for (var i=0; i<mockFileList.length; i++) {
    mockZombifyMap[mockFileList[i].title] = "DrrrRrcrrrrRrmrrnt " + i;
  }

  beforeEach(function () {
    module('DRRrrRrvrr');

    module(['$provide', function ($provide) {
      // Mock GoogleDriveService service.
      $provide.service('GoogleDriveService', ['$q', function ($q) {
        var svc = this;
        svc.files = [];
        svc.currentFileIndex = -1; // Index of svc.files array
        svc.currentFileId = undefined; // FileId
        svc.fileData = undefined;
        svc.splitFileData = undefined;

        this.getFile = function (index) {
          var defer = $q.defer();

          svc.currentFileIndex = index;
          svc.currentFileId = svc.files[index].id;
          svc.fileData = mockFileData[index];
          svc.splitFileData = mockFileData[index];
          defer.resolve();

          return defer.promise;
        };

        this.getFileList = function () {
          var defer = $q.defer();
          svc.files = mockFileList;
          defer.resolve(svc.files);
          return defer.promise;
        };
      }]);

      // Mock ZTranslator service.
      $provide.service('ZTranslator', ['$q', function ($q) {
        this.zombify = function (str, id) {
          var defer = $q.defer();
          defer.resolve({ result: mockZombifyMap[str], index: id });
          return defer.promise;
        };
      }]);

      // mock runAuthorization service to skip run block
      $provide.service('runAuthorization', function () {
        this.run = function () {
        };
      });
    }]);

    inject (function ($injector, _$rootScope_, $controller, _$location_) {
      $rootScope = _$rootScope_;
      $location = _$location_;
      GoogleDriveService = $injector.get('GoogleDriveService');
      ZTranslator = $injector.get('ZTranslator');

      spyOn(ZTranslator, "zombify").and.callThrough ();
      ListViewController = $controller('ListViewController', {$scope: $rootScope.$new()});
    });

    $rootScope.$apply();
  });

  it("should be initialized so that empty file list and not current file", function(){
    expect(GoogleDriveService.files.length).toBe(0);

    expect(ListViewController.files).toEqual(GoogleDriveService.files);
    expect(ListViewController.viewTitle).toMatch(mockTitle);
    expect(ListViewController.viewTitleInZombie).toMatch(mockTitleZ);
    expect(ListViewController.titlesInZombie.length).toBe(0);
  });

  it("should update the file list by refreshList() function.", function(){
    spyOn(GoogleDriveService, "getFileList").and.callThrough ();
    ListViewController.refreshList();
    $rootScope.$apply();

    expect(GoogleDriveService.getFileList).toHaveBeenCalled();
    expect(ListViewController.files).toEqual(mockFileList);
  });

 it("should call the getFile() from GoogleDriveService service in onSelectFile()", function(){
   // Initialize file list...
   ListViewController.refreshList();
   $rootScope.$apply();
   expect(ListViewController.files.length).toBeGreaterThan(3);

   // Register spy on GoogleDriveService.getFile
   spyOn(GoogleDriveService, "getFile").and.callThrough ();

   // Select 3rd file
   var indexSelected = 2;
   ListViewController.onSelectFile(indexSelected);
   $rootScope.$apply();

   expect(GoogleDriveService.getFile).toHaveBeenCalledWith(indexSelected);
   expect(GoogleDriveService.fileData).toMatch(mockFileData[indexSelected]);
 });

 it("should change the path to '/doc' view.", function(){
   // Initialize file list...
   ListViewController.refreshList();
   $rootScope.$apply();

   // Register spy on GoogleDriveService.getFile
   spyOn($location, "path").and.callThrough ();

   // Select 3rd file
   var indexSelected = 2;
   ListViewController.onSelectFile(indexSelected);
   $rootScope.$apply();

   expect($location.path).toHaveBeenCalledWith('/doc');
 });
});
