describe('ZTranslator', function(){
  var ZTranslator;
  var $httpBackend, $rootScope;

  var baseUrl = "http://ancient-anchorage-9224.herokuapp.com/zombify?q=";
  var baseUrlRe = new RegExp(/http:\/\/ancient-anchorage-9224\.herokuapp\.com\/zombify\?q=.+/);
  var mockTrData = "DRRrrRrvrr";

  beforeEach(function () {
    angular.mock.module('DRRrrRrvrr');

    // anonymous module to mock services...
    angular.mock.module(function ($provide) {
      // mock runAuthorization service to skip run block
      $provide.service('runAuthorization', function () {
        this.run = function () {
        };
      });
    });

    angular.mock.inject (function ($injector, _$rootScope_) {
      $rootScope = _$rootScope_;

      ZTranslator = $injector.get('ZTranslator');
      $httpBackend = $injector.get('$httpBackend');

      // Set up the httpBackend for the zombify api.
      $httpBackend
      .when('GET', baseUrlRe)
        .respond(function(method, url) {
          return [200, {message: mockTrData}];
      });
    });
  });

  afterEach (function () {
    $rootScope.$apply();
  });

  it("should translate empty string to empty string.", function () {
    var testString = "";
    ZTranslator.zombify(testString)
    .then (function (data) {
      expect(data.result.length).toBe(0);
    });
  });

  it("should keep given id in the output data", function () {
    var id = 10;
    var testString = "";
    ZTranslator.zombify(testString, id)
    .then (function (data) {
      expect(data.index).toBe(id);
    });
  });

  it("should translate to non-empty string for non-empty string input.", function () {
    var id = 5;
    var testString = "Hello";
    ZTranslator.zombify(testString)
    .then (function (data) {
      expect(data.result.length).toBeGreaterThan(0);
    });
  });

  it("should request a zombify http service for non-empty string input.", function () {
    var id = 5;
    var testString = "Hello";

    // Register expectation of $http with 'GET' and specified URL
    $httpBackend.expect("GET", baseUrl+testString);
    ZTranslator.zombify("Hello");
    $httpBackend.flush();
  });

  it("should return valid zombified string for valid string input.", function () {
    var id = 5;
    var testString = "Hello";
    ZTranslator.zombify("Hello", id).then(function (data) {
      expect(data.result).toMatch(mockTrData);
      expect(data.index).toBe(id);
    });
    $httpBackend.flush();
  });
});
