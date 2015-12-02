# DRRrrRrvrr Project
#### By Kyeong Hwi Lee (https://github.com/kyuhodad/DRRrrRrvrr)

This project provides 3 view, and each view except for the Authorization view displays the contents in English and Zombified language.

  - **Authorization View**: It is a transient view showing the progress of authorization. On starting the web page, this view is automatically showing, and tries to get the authorization for the Google Drive API. If the authorization is granted, it activates the document list view. Otherwise, it shows an error message with a button to re-try.

  - **Document List View**: It shows the list of documents from the Google Drive. Each items of the list has the link to get the document contents so that it can move into Document Content View by selecting one of the document list items. The document list is shown in two languages, English and Zombie.

  - **Document Contents View**: It shows the contents of selected document from the Document List View. It , also, shows the contents in English and Zombie. There is a button to go back to the Document List View.

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

### Notes for the implementations
- **Angular module config and run block**:

- **authGapi directive** (`authGapi`):

- **OAuth Service** (`OAuthService`):

- **Google Drive Service** (`GoogleDriveService`):

- **Using $q service**:

- **Test for promise, http, and interval service**:

### How to mock promise
- When a function which returns promise, $rootScope.$apply() needs to get called to do the unit test.

- For http, $httpBackend.flush() needs.
- For interval, $interval for mock should be instantiated, and call $interval.flush(10000);


### gapi should be registered to global(window)

### Code structure
```
+-- src
|   +-- css
|   |   +-- styles.css (CSS file)
|   +-- js
|   |   +-- controllers
|   |   |   +-- authController.js     (Controller for authorization button)
|   |   |   +-- authViewController.js (Controller for Authorization View)
|   |   |   +-- docViewController.js  (Controller for Document Contents View)
|   |   |   +-- listViewController.js (Controller for Document List View)
|   |   +-- directives
|   |   |   +-- authGapi.js     (Directive for the authorization button)
|   |   +-- services
|   |   |   +-- googleDriveService.js (Service to get data from Google Drive)
|   |   |   +-- oauthConfig.js   (Value to hold CLIENT_ID and SCOPES for OAuth )
|   |   |   +-- oauthService.js  (Service to get authorization for Google API)
|   |   |   +-- zTranslator.js   (Service to translate into Zombie)
|   |   +-- app.js (Main angular module, configuration and run section)
|   +-- templates
|   |   +-- authGapi.html (Template for authGapi directive)
|   |   +-- docView.html  (Template for '/#/doc' view. Controller: docViewController.js)
|   |   +-- listView.html (Template for '/#/list' view. Controller: listViewController.js)
|   +-- tests
|   |   +-- controllers
|   |   |   +-- authControllerSpec.js     (Unit tests for authController)
|   |   |   +-- authViewControllerSpec.js (Unit tests for authViewController)
|   |   |   +-- docViewControllerSpec.js  (Unit tests for docViewController)
|   |   |   +-- listViewControllerSpec.js (Unit tests for listViewController)
|   |   +-- directives
|   |   |   +-- authGapiSpec.js (Unit tests for authGapi)
|   |   +-- services
|   |   |   +-- googleDriveServiceSpec.js (Unit tests for googleDriveService)
|   |   |   +-- oauthConfigSpec.js  (Unit tests for oauthConfig)
|   |   |   +-- oauthServiceSpec.js  (Unit tests for oauthService)
|   |   |   +-- zTranslatorSpec.js  (Unit tests for zTranslator)
|   |   +-- index.html (Main html of the application)
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
