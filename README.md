### How to mock promise
- When a function which returns promise, $rootScope.$apply() needs to get called to do the unit test.

- For http, $httpBackend.flush() needs.
- For interval, $interval for mock should be instantiated, and call $interval.flush(10000);


### gapi should be registered to global(window)
