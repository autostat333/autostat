module.exports = function(grunt)
{
	grunt.initConfig({
		'sass':
			{
			'dist':
				{
				'options':
					{
					'style':'compressed'
					},
				'files':
					{
					'../sass/materialize.css':'./css/mater.min.css'
					}

				}
			}
		})

	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.registerTask('sass',['sass']);
}
