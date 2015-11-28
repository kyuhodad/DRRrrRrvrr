describe('OAuthConfig Value', function(){
  var module = angular.mock.module;
  var inject = angular.mock.inject;

  var OAuthConfig;

  beforeEach(function () {
    module('DRRrrRrvrr');

    inject (function ($injector) {
      OAuthConfig = $injector.get('OAuthConfig');
    });
  });

  it("should be available.", function(){
    expect(OAuthConfig).not.toBeUndefined();
  });
  it("should have valid data.", function(){
    expect(OAuthConfig.CLIENT_ID).not.toBeUndefined();
    expect(OAuthConfig.CLIENT_ID).toMatch("apps\.google");
    expect(OAuthConfig.SCOPES).not.toBeUndefined();
    expect(OAuthConfig.SCOPES).toMatch("www\.googleapis\.com\/auth");
  });
});
