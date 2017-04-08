module.exports = function(grunt)
    {

    //Project configuration.
    grunt.initConfig(
        {
        //pkg: grunt.file.readJSON('package.json'),

        //MINIFIED
        uglify:
          {
          options:
            {
            compress: true,
            mangle: true
            },

          my_target:
            {
            src:'./app/dist/app_bundle.js',
            dest:'./app/dist/app_bundle.js'
            }
          },

        //CONCATENATION LIBS
        concat:
          {
          libs:
            {
            options:
              {
              separator:';'
              },
            src: [
              './bower_components/angular/angular.min.js',
              //'./bower_components/angular/angular.js',
              './bower_components/jquery/dist/jquery.min.js',
              //'./bower_components/jquery/dist/jquery.js',
              './bower_components/materialize/dist/js/materialize.min.js',
              //'./bower_components/materialize/dist/js/materialize.js',
              
              //'./app/non_bower_libs/ui-bootstrap-custom-build/ui-bootstrap-custom-tpls-2.5.0.js',
              './bower_components/angular-bootstrap/ui-bootstrap-tpls.min_1.1.2.js',
              
              './bower_components/angular-ui-router/release/angular-ui-router.min.js',
              './app/non_bower_libs/chosen/chosen.jquery.min.js',
              //'./app/non_bower_libs/chosen/chosen.jquery.js',

              //'./app/non_bower_libs/c3/d3_3.5.6.js',
                './app/non_bower_libs/c3/d3_3.5.6.min.js',
              './app/non_bower_libs/c3/c3.min.js',
              //'./app/non_bower_libs/c3/c3.min.js',
              './bower_components/owl.carousel/dist/owl.carousel.min.js',
              './app/non_bower_libs/data-table.js',
              './app/non_bower_libs/markerclusterer.js'
              
              ],
            dest: './app/dist/libs_bundle.js',
            },
          //CONCATENATE LIBS CSS
          css:
            {
            options:
              {
              separator:''
              },
            src:[
                './bower_components/materialize/dist/css/materialize.min.css',
                './app/non_bower_libs/animate.min.css',
                './app/non_bower_libs/chosen/chosen.min.css',
                './app/non_bower_libs/font-awesome/css/font-awesome.min.css',
                './app/non_bower_libs/noUiSlider/nouislider.min.css',
                './app/non_bower_libs/c3/c3.min.css',
                './bower_components/owl.carousel/dist/assets/owl.carousel.min.css',
              //'./bower_components/bootstrap/dist/css/bootstrap.min.css',
              ],
            dest:'./app/dist/libs_styles.css'
            }
          },

        //BROWSERIFY APP JS
        browserify:
          {
          some_task:
            {
            src:['./app/*.js',
                './app/controllers/*.js',
                './app/controllers/**/*.js',
                './app/directives/*.js',
                './app/services/*.js',
                './app/filters/*.js',
                './app/factories/*.js'],
            dest:'./app/dist/app_bundle.js'
            }
          },


        //SAAS
        sass:
          {
          dist:
            {
            options:
              {
              style:'compressed'
              },
            files:
              {
              './app/dist/compile.css': './app/styles/compile.scss',
       //       './bower_components/materialize/sass/materialize.css':'./bower_components/materialize/dist/css/materialize.test'
              }
            }
          },


          //WATCHER
          watch:
            {
            app:
              {
              files:['./app/*.js',
                  './app/controllers/*.js',
                  './app/controllers/**/*.js',
                  './app/directives/*.js',
                  './app/services/*.js',
                  './app/filters/*.js',
                  './app/factories/*.js'],
              tasks:['browserify']
              },
            css:
              {
              files:['./app/styles/*'],
              tasks:['sass']
              },
            libs:
              {
              files:['./app/non_bower_libs/*.*','./app/non_bower_libs/**/*.*',],
              tasks:['concat']
              }
            }
            

        });


  //Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  //Default task runs automatically when grunt runs from command line
  grunt.registerTask('default', ['sass','concat','browserify','watch','uglify']);
  grunt.registerTask('full_build',['sass','concat','browserify','uglify']);  //all task execute

  };