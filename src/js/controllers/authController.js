// -----------------------------------------------------------------------------
// "AuthController" controller:
//  A wrapper controller to move to list view after getting authorized.
// -----------------------------------------------------------------------------
angular.module('DRRrrRrvrr')
.controller('AuthController', ['$location', 'OAuthService', function ($location, OAuthService) {
  var auVm = this;
  auVm.hasAuthorized = function () {
    return OAuthService.authorized;
  };
  auVm.doIt = function () {
    $location.path('/list');
  };
}]);
