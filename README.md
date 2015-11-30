#DRRrrRrvrr Project
#### By Kyeong Hwi Lee (https://github.com/kyuhodad/DRRrrRrvrr)

This project provides a application page which consists of two tabs:

  - **Input form for a guest**: Getting guest information for the Shuffling Pines Dissolution Center. The input data are :
    - `Guest Name`: Name of the guest. Must be set.
    - `Transition Date`: Date of Transition
    - `Action Option`: Choose one of `Pick-up` and `Drop-off`
    - `Location`: Only for the `Pick-up` option is chosen. It should not be available if `Drop-off` option is chosen.

  The form is initialized with some default data except for the name field.

  Once the form is submitted, the guest list manager tab is, automatically, activated with populating all the guests with tabular form.

  - **Guest List Manager**: Showing all the guests and providing editing functionalities.

### Installation
After downloading the project, run followings to install development environment.

  - `npm install`
  - `bower install`

After installing all the components, run `gulp build` to build distribution folder and setup proper running environment.

`gulp` command runs following commands in order:

  - `gulp build`: Build distribution folder (`dist`) from all necessary  *.js*, *.html*, and *.css* files under *app* and *bower_components* folder.
  - `gulp test`: Start `karma` testing and run `jshint`.
  - `gulp watch`: Watch out specific files to start corresponding tasks.
  - `gulp connect`: Set up local host with 8080 port. The web page is, automatically, reloaded when a certain change happens.

### Code structure
```
+-- app
|   +-- css
|   |   +-- app.css (CSS file)
|   +-- js
|   |   +-- app.js (Main application JavaScript file)
|   +-- index.html (Main html of the application)
+-- tests
|   +-- specs
|       +-- appSpec.js (Main Jasmine based test codes)
+-- .gitignore (Git ignore file)
+-- .jshitrc (jshint rc file)
+-- gulpfile.js (Gulp configuration file)
+-- karma.conf.js (Karma configuration file)
+-- bower.json (Bower component management file)
+-- package.json (npm management file)
+-- README.md (This file)
```

### Notes for the implementations

- `guestManager` service: A singleton service to manage the list of guests. 

### How to mock promise
- When a function which returns promise, $rootScope.$apply() needs to get called to do the unit test.

- For http, $httpBackend.flush() needs.
- For interval, $interval for mock should be instantiated, and call $interval.flush(10000);


### gapi should be registered to global(window)
