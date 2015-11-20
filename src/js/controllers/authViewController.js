angular.module('DRRrrRrvrr')
.controller('AuthViewController', ['OAuthService', function (OAuthService) {
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
