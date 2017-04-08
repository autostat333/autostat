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
            src:'./app/non_bower_libs/markerclusterer.js',
            dest:'./app/non_bower_libs/markerclusterer.min.js'
            
            //src:'./bower_components/materialize/dist/js/materialize.js',
            //dest:'./bower_components/materialize/dist/js/materialize.min.js'
            }
          },


        });


  //Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  //Default task runs automatically when grunt runs from command line
  grunt.registerTask('default', ['uglify']);

  };