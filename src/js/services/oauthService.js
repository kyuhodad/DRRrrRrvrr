// -----------------------------------------------------------------------------
// "OAuthService" service:
//  Service to check the autorization.
//  - checkAuth function:
//
// -----------------------------------------------------------------------------
angular.module('DRRrrRrvrr')
.service('OAuthService', ['OAuthConfig', '$q', '$interval', function (OAuthConfig, $q, $interval) {
  var svc = this;
  svc.authorized = false;

  // -2: Fail to get authorized.
  // -1: Initial state
  //  0: Trying to ge authorized
  //  1: Authorized.
  svc.status = -1; // Initial state

  /**
   * Check if current user has authorized this application.
   */
  svc.checkAuth = function(maxNumOfTries, delay) {
    var defer = $q.defer();

    if (maxNumOfTries === undefined) {
      maxNumOfTries = 4;
    }
    if (delay === undefined) {
      delay = 2000;
    }

    if (svc.authorized) {
      defer.resolve(svc.authorized);
    } else {
      var count = 0;
      svc.status = 0; // on getting authorized

      var checkProcess = $interval(function () {
        count++;
        if (count > maxNumOfTries) {
          $interval.cancel(checkProcess);
          svc.status = -2;
          defer.resolve(svc.authorized);
          $interval.cancel(checkProcess);
        } else {
          gapi.auth.authorize({
              'client_id': OAuthConfig.CLIENT_ID,
              'scope': OAuthConfig.SCOPES.join(' '),
              'immediate': true
            }, function (authResult) {
              svc.authorized = (authResult && !authResult.error);
              if (svc.authorized) {
                svc.status = 1;
                defer.resolve(svc.authorized);
                $interval.cancel(checkProcess);
              }
            });
        }
      }, delay);
    }

    return defer.promise;
  };
}]);
