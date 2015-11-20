angular.module('DRRrrRrvrr')
.controller('ListViewController', ['GoogleDriveService', 'ZTranslator', '$location',
  function (GoogleDriveService, ZTranslator, $location) {
    var listVm = this;
    listVm.files = GoogleDriveService.files;
    listVm.viewTitle = "File List";
    listVm.viewTitleInZombie = "File List";
    listVm.titlesInZombie = [];
    ZTranslator.zombify (listVm.viewTitle).then (function (dataInZombie) {
      listVm.viewTitleInZombie = dataInZombie.result;
    });

    for (var i=0; i<listVm.files.length; i++) {
      ZTranslator.zombify (listVm.files[i].title, i).then (addZombifiedTitle);
    }
    function addZombifiedTitle(dataInZombie) {
      if (dataInZombie.index !== undefined) {
        listVm.titlesInZombie[dataInZombie.index] = dataInZombie.result;
      }
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
