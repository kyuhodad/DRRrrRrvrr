describe('DocViewController', function(){
  var module = angular.mock.module;
  var inject = angular.mock.inject;

  var DocViewController, GoogleDriveService, ZTranslator;
  var $location, $rootScope;

  var mockCurrentFileId = 123;
  var mockFileName = "Test Document";
  var mockFileNameZ = "Trrst DrrrRrcrrrrRrmrrnt";
  var mockSplitFileData = [
    "Document Contents",
    "Paragraph 1",
    "Paragraph 2",
    "Paragraph 3"
  ];
  var mockSplitFileDataZ = [
    "DrrrRrcrrrrRrmrrnt CrrrRrntrrnts",
    "PhraRRhragRRhraph 1",
    "PhraRRhragRRhraph 2",
    "PhraRRhragRRhraph 3"
  ];

  beforeEach(function () {
    module('DRRrrRrvrr');

    module(['$provide', function ($provide) {
      // Mock GoogleDriveService service.
      $provide.service('GoogleDriveService', function () {
        this.splitFileData = mockSplitFileData;
        this.getCurrentFileName = function () {
          return mockFileName;
        };
        this.currentFileId = mockCurrentFileId;
      });

      // Mock ZTranslator service.
      $provide.service('ZTranslator', ['$q', function ($q) {

        this.zombify = function (str, id) {
          var defer = $q.defer();

          if (mockFileName.search(str) >= 0) {
            defer.resolve({ result: mockFileNameZ, index: id });
          } else {
            var bHasReolved = false;
            for (var i=0; i< mockSplitFileData.length; i++) {
              if (mockSplitFileData[i].search(str) >= 0) {
                defer.resolve({ result: mockSplitFileDataZ[i], index: id });
                bHasReolved = true;
                break;
              }
            }
            if (!bHasReolved) {
              defer.resolve({ result: "", index: id });
            }
          }

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
      DocViewController = $controller('DocViewController', {$scope: $rootScope.$new()});
    });

    $rootScope.$apply();
  });

  it("should be initialized with GoogleDriveService.", function(){
    expect(DocViewController.splitFileData).toEqual(GoogleDriveService.splitFileData);
    expect(DocViewController.fileName).toBe(GoogleDriveService.getCurrentFileName());
    expect(DocViewController.splitFileData).toEqual(mockSplitFileData);
    expect(DocViewController.fileName).toEqual(mockFileName);
  });

  it("should call zombofy function of ZTranslator service.", function(){
    expect(ZTranslator.zombify).toHaveBeenCalledWith(mockFileName);
    for(var i=0; i<mockSplitFileData.length; i++) {
      expect(ZTranslator.zombify).toHaveBeenCalledWith(mockSplitFileData[i], i);
    }
  });

  it("should be initialized with profer zombified data.", function(){
    expect(DocViewController.splitFileDataInZombie).toEqual(mockSplitFileDataZ);
    expect(DocViewController.fileNameInZombie).toBe(mockFileNameZ);
  });

  it("should return true if there is valid current file id.", function(){
    expect(GoogleDriveService.currentFileId).toBe(mockCurrentFileId);
    expect(DocViewController.hasFileToShow()).toBeTruthy();
  });

  it("should change the location to '/list' in doGoBackToListView().", function(){
    spyOn($location, "path").and.callThrough ();
    DocViewController.doGoBackToListView();
    expect($location.path).toHaveBeenCalledWith('/list');
  });

});
