describe('AuthController', function(){
  var module = angular.mock.module;
  var inject = angular.mock.inject;

  var AuthController, OAuthService;
  var $location;

  beforeEach(function () {
    module('DRRrrRrvrr');

    module(['$provide', function ($provide) {
      // Mock OAuthService service.
      $provide.service('OAuthService', function () {
        this.authorized = true;
      });

      // mock runAuthorization service to skip run block
      $provide.service('runAuthorization', function () {
        this.run = function () {
        };
      });
    }]);

    inject (function ($injector, $rootScope, $controller, _$location_) {
      $location = _$location_;
      AuthController = $controller('AuthController', {$scope: $rootScope.$new()});
      OAuthService = $injector.get('OAuthService');
    });
  });

  it("should return same value what OAuthService.authorized flag.", function(){
    OAuthService.authorized = true;
    expect(AuthController.hasAuthorized()).toBe(true);
    OAuthService.authorized = false;
    expect(AuthController.hasAuthorized()).toBe(false);
  });

  it("should change the location to '/path' in doIt() function.", function(){
    spyOn($location, "path");
    AuthController.doIt ();
    expect($location.path).toHaveBeenCalledWith('/list');
  });
});
