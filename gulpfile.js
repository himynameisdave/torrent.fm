// 		A gulpfile by Dave Lunny
var gulp 	= require('gulp'),
	plug 	= require('gulp-load-plugins')({
					scope: ['devDependencies'],
					replaceString: 'gulp-',
					lazy: true
				});

gulp.task('reload', function(){
	plug.livereload.listen()
	gulp.watch(['app/css/*.css','app/js/app.js','app/index.html'], function(){
		console.log('RELOADING PAGE');
	})
	.on('change', plug.livereload.changed);
});

gulp.task('less', function(){
	gulp.src('app/css/style.less')
		//LESS compilation
		.pipe(plug.less({
				style: 'compressed'
			}))
		//LESS error catch
		.on('error', function(e){
			console.log('ERROR ON LINE ' + e.line);
			console.log(e.message);
		})
		.pipe(gulp.dest('app/css/'));
});

gulp.task('styles', function(){
	gulp.watch('app/css/style.less', ['less']);
});	

	
//	This guy is the default task
gulp.task('default', ['reload', 'styles']);