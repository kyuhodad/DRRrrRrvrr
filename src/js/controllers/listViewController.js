angular.module('DRRrrRrvrr')
.controller('ListViewController', ['GoogleDriveService', 'ZTranslator', '$location',
  function (GoogleDriveService, ZTranslator, $location) {
    var listVm = this;
    listVm.files = GoogleDriveService.files;
    listVm.titlesInZombie = [];
    for (var i=0; i<listVm.files.length; i++) {
      ZTranslator.zombify (listVm.files[i].title).then (addZombifiedTitle);
    }
    function addZombifiedTitle(dataInZombie) {
      listVm.titlesInZombie.push(dataInZombie);
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
