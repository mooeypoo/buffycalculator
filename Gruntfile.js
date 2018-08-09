/* eslint-env node */
module.exports = function Gruntfile( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );

	grunt.initConfig( {
		eslint: {
			code: {
				src: [
					'calculators/js/**/*.js'
				]
			}
		}
		// qunit: {
		// 	all: [ 'tests/index.html' ]
		// }
	} );

	grunt.registerTask( 'lint', [ 'eslint' ] );
	grunt.registerTask( 'test', [ 'lint' ] );
	// grunt.registerTask( 'test', [ 'lint', 'qunit' ] );
	// grunt.registerTask( 'build', [ 'test', 'concat:assets' ] );
	grunt.registerTask( 'default', 'test' );
};
