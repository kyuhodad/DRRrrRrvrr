describe('AuthViewController', function(){
  var module = angular.mock.module;
  var inject = angular.mock.inject;

  var AuthViewController, OAuthService;

  beforeEach(function () {
    module('DRRrrRrvrr');

    module(['$provide', function ($provide) {
      // Mock OAuthService service.
      $provide.service('OAuthService', function () {
        this.status = -1;
      });

      // mock runAuthorization service to skip run block
      $provide.service('runAuthorization', function () {
        this.run = function () {
        };
      });
    }]);

    inject (function ($injector, $rootScope, $controller) {
      AuthViewController = $controller('AuthViewController', {$scope: $rootScope.$new()});
      OAuthService = $injector.get('OAuthService');
    });
  });

  it("should return proper message based on OAuthService.status.", function(){
    expect(OAuthService.status).toBe(-1); // Initial status
    expect(AuthViewController.messageToShow()).toMatch("Initializing");

    OAuthService.status = 0;
    expect(AuthViewController.messageToShow()).toMatch("Authorizing");

    OAuthService.status = 1;
    expect(AuthViewController.messageToShow()).toMatch("Success");

    OAuthService.status = -2;
    expect(AuthViewController.messageToShow()).toMatch("Fail");
  });
});
