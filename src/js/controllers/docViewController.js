angular.module('DRRrrRrvrr')
.controller('DocViewController', ['GoogleDriveService', 'ZTranslator', '$location',
  function (GoogleDriveService, ZTranslator, $location) {
    var docVm = this;
    docVm.fileData = GoogleDriveService.fileData;
    docVm.splitFileData = GoogleDriveService.splitFileData;
    docVm.fileName = GoogleDriveService.getCurrentFileName ();
    docVm.fileNameInZombie = undefined;
    docVm.fileDataInZombie = undefined;
    docVm.splitFileDataInZombie = [];

    // Translate the file name
    ZTranslator.zombify (docVm.fileName).then (function (dataInZombie) {
      docVm.fileNameInZombie = dataInZombie.result;
    });

    // Translate the document content
    ZTranslator.zombify (docVm.fileData).then (function (dataInZombie) {
      docVm.fileDataInZombie = dataInZombie.result;
    });

    // Translate the document content
    for (var i=0; i<docVm.splitFileData.length; i++) {
      ZTranslator.zombify (docVm.splitFileData[i], i).then (addToSplitFileDataInZombie);
    }
    function addToSplitFileDataInZombie(data) {
      if (data.index !== undefined) {
        docVm.splitFileDataInZombie[data.index] = data.result;
      }
    }

    docVm.doGoBackToListView = function () {
      $location.path('/list');
    };

    docVm.hasFileToShow = function () {
      return GoogleDriveService.currentFileId !== undefined;
    };
}]);
