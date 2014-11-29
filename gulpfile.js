// 		A gulpfile by Dave Lunny
var gulp 	= require('gulp'),
	plug 	= require('gulp-load-plugins')({
					scope: ['devDependencies'],
					replaceString: 'gulp-',
				});


///////////////////////////////////////////////////////
//	//											//	//
//	//				 PRODUCTION					//	//
//	//											//	//
///////////////////////////////////////////////////////
gulp.task('production', function(){
	
	/////RUN JS PRODUCTION SCRIPT
		//STEP 1: ng-annotate the prod.app.js file
		// console.log('Step 1: ng-annotate');
		// 	gulp.src('app/js/app.js')
		//         .pipe(plug.ngAnnotate())
		//         .on('error', function(e){
		//         	console.log('ng-annotate error');
		//         	console.log(e);
		//         })
		//         .pipe(gulp.dest('app/lib/js/'));

		//STEP 2: uglify lib js files
		console.log('Step 2: Uglify lib js files');
			// gulp.src('app/lib/js/*.js')
			gulp.src( [
						'app/lib/js/angular.js',
						'app/lib/js/jquery.js',
						'app/lib/js/lastfm.api.min.js',
						'app/lib/js/purl.min.js'
					] )
				.pipe(plug.uglify())
				.on('error', function(e){
		        	console.log('uglify js files error');
		        	console.log(e);
		        })
				.pipe(gulp.dest('app/lib/js/'));
		//STEP 3: concat that .js
		console.log('Step 3: Concat JS');
			gulp.src([ 'app/lib/js/*.js' ])
				.pipe(plug.concat('core.js'))
				.pipe(gulp.dest('public/'));
		//ADDITIONAL STEP: add app.js to public directory (until i make shit work better)
			gulp.src( 'app/js/app.js' )
				.pipe(gulp.dest( 'public/' ));

		console.log('=================\n== END  JSPROD ==\n=================\n');
	
	/////RUN CSS PRODUCTION SCRIPT
		//STEP 1: One last LESS compile, an Autoprefix, and a CSSComb on the main stylesheet
		console.log('Step 1: Final LESS compile, prefix, and comb');
			gulp.src('app/css/style.less')
				.pipe(plug.less({ style: 'compressed' }))
				.on('error', function(e){
					console.log('ERROR ON LINE ' + e.line);
					console.log(e.message);
				})
				.pipe(plug.autoprefixer({
		            browsers: ['last 3 versions'],
		            cascade: true
		        }))
		        .pipe(plug.csscomb())
		        .pipe(gulp.dest('app/lib/css/'));
			
		//STEP 2: Minify CSS
		console.log('Step 2: Minify CSS');
			gulp.src( 'app/lib/css/*.css' )
				.pipe(plug.minifyCss())
				.on('error', function(e){
		        	console.log('minify css files error');
		        	console.log(e);
		        })
				.pipe(gulp.dest('app/lib/css/'));

		//STEP 3: CONCAT CSS
		console.log('Step 3: Concat CSS');
			gulp.src( 'app/lib/css/*.css' )
				.pipe(plug.concat('core.css'))
				.pipe(gulp.dest('public/'));

		console.log('=================\n== END CSSPROD ==\n=================\n');
	
	/////COPY OVER INDEX.HTML AND OTHER ASSETS
		//Step 1: Copy index and favi
		console.log('Step 1: Copy  favicon');
			gulp.src( 'app/favicon.ico' )
				.pipe( gulp.dest('public/') );
		//Step 2: Copy assets
		console.log('Step 2: Copy assets');
			gulp.src( 'app/assets/**/' )
				.pipe( gulp.dest('public/assets/') );
		//Step 3: angulr-htmlify
		console.log('Step 3: angular htmlify the index page');
			gulp.src( 'app/index.html' )
				.pipe(plug.angularHtmlify())
				.pipe(gulp.dest( 'public/' ));

});			


///////////////////////////////////////////////////////
//	//											//	//
//	//				DEVELOPMENT					//	//
//	//											//	//
///////////////////////////////////////////////////////

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

gulp.task('csscomb', function(){	
	gulp.src('app/css/style.css')
		.pipe(plug.csscomb())
		.pipe(gulp.dest('app/css/'));

});


///////////////////////////////////////////////////////
//	//					DEFAULT					//	//
//	//											//	//
	gulp.task('default', ['reload', 'styles']); //	//
//	//											//	//
///////////////////////////////////////////////////////