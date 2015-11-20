angular.module('DRRrrRrvrr')
.controller('DocViewController', ['GoogleDriveService', 'ZTranslator', '$location',
  function (GoogleDriveService, ZTranslator, $location) {
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
