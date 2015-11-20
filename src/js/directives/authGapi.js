// -----------------------------------------------------------------------------
// "authGapi" directive:
//  This is a component to get the Google API authorization.
//  Attributes:
//    title: The description to show for the title
//    label: The label on the button.
//    success: Callback to call after getting authorized.
// -----------------------------------------------------------------------------
angular.module('DRRrrRrvrr')
.directive('authGapi', ['OAuthService', 'GoogleDriveService', function (OAuthService, GoogleDriveService){
    return {
      restrict: 'E',
      controller: function ($scope) {
        var authVm = this;
        var scope = $scope;
        authVm.succeededAuth = false;

        authVm.authorize = function () {
          OAuthService.checkAuth ().then( function (isAuthorized) {
            if (isAuthorized) {
              authVm.succeededAuth = true;

              GoogleDriveService.getFileList().then ( function () {
                // Call the callback function.
                if (scope.success) { scope.success(); }
              });
            } else {
              authVm.succeededAuth = false;
            }
          });
        };

        var defaultTitle = "Get authorization for access to Drive API: ";
        var defaultLabel = "Authorize";
        authVm.getTitle = function () { return scope.title ? scope.title : defaultTitle; };
        authVm.getLabel = function () { return scope.label ? scope.label : defaultLabel; };
      },

      controllerAs: "authVm",
      scope: {
          title: '@title',
          label: '@label',
          success: '&onSuccess' // callback from parent scope controller on success.
      },
      templateUrl: 'templates/authGapi.html'
    };
}]);
