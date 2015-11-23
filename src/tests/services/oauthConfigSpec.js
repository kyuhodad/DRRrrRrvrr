describe('OAuthConfig Value', function(){
  var OAuthConfig;

  beforeEach(function () {
    angular.mock.module('DRRrrRrvrr');

    angular.mock.inject (function ($injector) {
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
