
var app = angular.module('DRRrrRrvrr', ['ngRoute']);
//
// Configuration for the views
//
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    .when('/list', {
      templateUrl: 'templates/listView.html',
      controller: 'ListViewController',
      controllerAs: 'listVm'
    })
    .when('/doc', {
      templateUrl: 'templates/docView.html',
      controller: 'DocViewController',
      controllerAs: 'docVm'
    })
    .when('/auth', {
      template: '<h4>{{auvVm.messageToShow ()}}</h4>',
      controller: 'AuthViewController',
      controllerAs: 'auvVm'
    })
    .otherwise({
      redirectTo: '/list'
    });
}]);

//
// Run block:
//  1. Set the current path to '/auth' which is showing the progress of authorizing.
//  2. Try to get authorization ( maximum try 4 times with 2sec delay )
//  3. If successfully getting authorized, set the current path to '/list'.
//
app.run(['OAuthService', 'GoogleDriveService', '$interval', '$location',
  function (OAuthService, GoogleDriveService, $interval, $location) {
    // '/auth' is the first view.
    $location.path('/auth');

    OAuthService.checkAuth(4, 2000).then (function (isAuthorized) {
      if (isAuthorized) {
        GoogleDriveService.getFileList().then ( function () {
          $location.path('/list');
        });
      }
  });
}]);
