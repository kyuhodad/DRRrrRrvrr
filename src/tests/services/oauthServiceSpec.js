describe('OAuthService', function(){
  var module = angular.mock.module;
  var inject = angular.mock.inject;

  var OAuthService, OAuthConfig, gapiMock;
  var $rootScope, $interval;

  beforeEach(function () {
    module('DRRrrRrvrr');

    module(['$provide', function ($provide) {
      // mock gapi.auth.authorize service.
      $provide.service('gapi', function () {
        this.auth = {
          authorize: function(option, callback) {
              callback({error: (option.client_id !== "mock.client_id")});
          }
        };
      });

      // mock OAuthConfig value
      $provide.service('OAuthConfig', function () {
        this.CLIENT_ID = "mock.client_id";
        this.SCOPES = ["mock.scope"];
      });

      // mock runAuthorization service to skip run block
      $provide.service('runAuthorization', function () {
        this.run = function () {
        };
      });
    }]);

    inject (function ($injector, _$rootScope_, _$interval_) {
      $rootScope = _$rootScope_;
      $interval = _$interval_;
      OAuthService = $injector.get('OAuthService');
      OAuthConfig = $injector.get('OAuthConfig');
      gapiMock = $injector.get('gapi');
      window.gapi = gapiMock; // Register gapi to global
    });

    spyOn(gapiMock.auth, "authorize").and.callThrough();
  });

  afterEach (function () {
    $interval.flush(10000);
    $rootScope.$apply();
  });

  it("should be available and initialized properly.", function(){
    expect(OAuthService).not.toBeUndefined();
    expect(OAuthService.authorized).toBeFalsy();
    expect(OAuthService.status).toBe(-1);
  });

  it("should call google authorization api.", function(){
    OAuthService.checkAuth(1, 0).then(function() {
      expect(gapiMock.auth.authorize).toHaveBeenCalled ();
    });
  });

  it("should get authorized with OAuthConfig.", function(){
    OAuthService.checkAuth(1, 0).then(function(isAuthorized) {
      expect(isAuthorized).toBeTruthy();
      expect(OAuthService.status).toBe(1);
      expect(OAuthService.authorized).toBeTruthy ();
    });
  });

  it("should fail with worng client id.", function(){
    OAuthConfig.CLIENT_ID = "wrong.mock.client_id";
    OAuthService.checkAuth(1, 0).then(function(isAuthorized) {
      expect(isAuthorized).toBeFalsy ();
      expect(OAuthService.status).toBe(-2);
      expect(OAuthService.authorized).toBeFalsy ();
    });
  });

  it("should call google authorization api multiple times if it fails.", function(){
    OAuthConfig.CLIENT_ID = "wrong.mock.client_id";
    gapiMock.auth.authorize.calls.reset();
    OAuthService.checkAuth(4, 0).then(function() {
      expect(gapiMock.auth.authorize.calls.count()).toBe (4);
    });
  });

});
