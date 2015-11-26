describe ('authGapi directive', function () {
  var authGapiDirective, authGapiController, directiveScope;
  var OAuthService, GoogleDriveService;
  var $rootScope, $compile;

  beforeEach (function () {
    var module = angular.mock.module;
    var inject = angular.mock.inject;

    module ('DRRrrRrvrr');
    module ('templates');

    module (function ($provide) {

      // Mock OAuthService service
      $provide.service('OAuthService', ['$q', function ($q) {
        var svc = this;
        svc.authorized = true; // As the default, returns true.
        svc.checkAuth = function () {
          var defer = $q.defer();
          defer.resolve(svc.authorized);
          return defer.promise;
        };
      }]);

      // Mock GoogleDriveService
      $provide.service('GoogleDriveService', ['$q', function ($q) {
        this.getFileList = function () {
          var defer = $q.defer();
          defer.resolve();
          return defer.promise;
        };
      }]);
    });

    inject(function (_$compile_, _$rootScope_, $injector) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      directiveScope = $rootScope.$new();

      OAuthService = $injector.get("OAuthService");
      GoogleDriveService = $injector.get("GoogleDriveService");
    });

    directiveScope.onSuccessCallback = function () {
    };
    var tpl =
    ' <auth-gapi title="Test authGApi" label="Authorize" ' +
    '            on-success = "onSuccessCallback()" </auth-gapi>';

    var element = angular.element(tpl);
    authGapiDirective = $compile(element)(directiveScope);
    directiveScope.$digest();

    authGapiController = authGapiDirective.controller('authGapi');
  });

  it("should have proper title and label.", function () {
    var title = authGapiDirective.find('label');
    expect(title.text()).toBe("Test authGApi");
    var label = authGapiDirective.find('button');
    expect(label.text()).toMatch("Authorize");
  });

  it("should get proper title and label from the controller.", function () {
    expect(authGapiController.getTitle()).toBe("Test authGApi");
    expect(authGapiController.getLabel()).toMatch("Authorize");
  });

  it("should call OAuthService.checkAuth() in authorize() function.", function () {
    spyOn(OAuthService, "checkAuth").and.callThrough();
    authGapiController.authorize();
    $rootScope.$apply();

    expect(OAuthService.checkAuth).toHaveBeenCalled();
  });

  it("should call GoogleDriveService.getFileList() in authorize() function if authorized.", function () {
    expect(OAuthService.authorized).toBeTruthy ();

    spyOn(GoogleDriveService, "getFileList").and.callThrough();
    authGapiController.authorize();
    $rootScope.$apply();

    expect(GoogleDriveService.getFileList).toHaveBeenCalled();
  });

  it("should not call GoogleDriveService.getFileList() in authorize() function if not authorized.", function () {
    OAuthService.authorized = false;

    spyOn(GoogleDriveService, "getFileList").and.callThrough();
    authGapiController.authorize();
    $rootScope.$apply();

    expect(GoogleDriveService.getFileList).not.toHaveBeenCalled();
  });

  it("should have correct value for authorized state after calling authorize() function.", function () {
    expect(OAuthService.authorized).toBeTruthy ();
    authGapiController.authorize();
    $rootScope.$apply();
    expect(authGapiController.succeededAuth).toBeTruthy();

    OAuthService.authorized = false;
    authGapiController.authorize();
    $rootScope.$apply();
    expect(authGapiController.succeededAuth).toBeFalsy();
  });

  it("should register on-success callback and call it in authorize() if authorized.", function () {
    expect(OAuthService.authorized).toBeTruthy ();
    spyOn(directiveScope, "onSuccessCallback").and.callThrough();
    authGapiController.authorize();
    $rootScope.$apply();
    expect(directiveScope.onSuccessCallback).toHaveBeenCalled();
  });

});
