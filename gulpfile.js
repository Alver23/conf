'use strict'

var gulp = require('gulp')
var uglify = require('gulp-uglify')
var gulpRename = require('gulp-rename')
var gulpSize = require('gulp-size')
var stylus = require('gulp-stylus')
var concatCSS = require('gulp-concat-css')
var minifyCSS = require('gulp-minify-css')
var cleanCSS = require('gulp-clean-css')
var imageop = require('gulp-image-optimization')
var standard = require('gulp-standard')
var buffer = require('vinyl-buffer')
var source = require('vinyl-source-stream')
var babelify = require('babelify')
var browserify = require('browserify')
var nib = require('nib')

/*
|----------------------------------------------
| configuracion
|----------------------------------------------
|
| Indicamos nuestras configuraciones del proyecto
|
 */

const config = {
	transform: {
		extensions: [
		  [
		    babelify,
		    {
		    	presets: ["es2015", "react"]
		    }
		  ]
		]
	},
	script: {
		main: './index.js', // Nombre del archivo principal a monitorizar los cambios
		watch: './src/js/**/*.js', // Ruta de los archivos a detectar cambios y ejecutar la tarea de compresion
		output: './dist/js', // Ruta donde dejaremos el archivo final
		fileName: 'bundleApp.js' // Nombre del archivo final generado
	},
	styles: {
		main: './src/css/app.styl', // Nombre del archivo principal a monitorizar los cambios usando stylus
		watch: './src/css/**/*.styl', // Ruta de los archivos a detectar cambios y ejecutar la tarea de 
		output: './dist/css/', // Ruta donde dejaremos el archivo final
		fileName: 'bundleApp.css' // Nombre del archivo final generado
	},
	images: {
		main: [
			'./src/images/**/*.png',
			'./src/images/**/*.jpg',
			'./src/images/**/*.gif',
			'./src/images/**/*.jpeg'
		],
		output: './dist/images'
	}
}

/*
|----------------------------------------------
| Task build:js
|----------------------------------------------
|
| Creamos la tarea para transformar y comprimir los archivos js
|
 */

gulp.task('build:js', () => {
	return browserify({
		entries: config.script.main,
		transform: config.transform.extensions
	})
	.bundle()
	.pipe(source(config.script.fileName))
	.pipe(buffer())
	.pipe(gulpSize())
	.pipe(gulp.dest(config.script.output))
	.pipe(uglify())
	.pipe(gulpRename({
		extname: '.min.js'
	}))
	.pipe(gulpSize())
	.pipe(gulp.dest(config.script.output))
})

/*
|----------------------------------------------
| Task standard
|----------------------------------------------
|
| Creamos la tarea para revisar nuestro codigo que se encuentre bien escrito
|
 */

gulp.task('standard', function () {
	return gulp.src([
		config.script.main
	])
	.pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true
    }))
})

/*
|----------------------------------------------
| Task build:css
|----------------------------------------------
|
| Creamos la tarea para transformar nuestro codigo stylus a css
|
 */

gulp.task('build:css', () => {
	gulp.src(config.styles.main)
	.pipe(stylus({
		use: nib()
	}))
	.pipe(concatCSS(config.styles.fileName))
	.pipe(minifyCSS())
	.pipe(gulp.dest(config.styles.output))
	.pipe(gulpRename({
		extname: '.min.css'
	}))
	.pipe(gulp.dest(config.styles.output));
})

/*
|----------------------------------------------
| Task build:img
|----------------------------------------------
|
| Creamos la tarea para optimizar nuestras imagenes y queden menos pesadas
|
 */

gulp.task('build:img', (cb) => {
	gulp.src(config.images.main)
	.pipe(imageop({
		optimizationLevel: 5,
		progressive: true,
		interlaced: true
	}))
	.pipe(gulp.dest(config.images.output))
	.on('end', cb)
	.on('error', cb)
})

/*
|----------------------------------------------
| Task watch
|----------------------------------------------
|
| Creamos nuestra tarea para que monitorize los 
| archivos configurado y los compile nuevamente
|
 */


gulp.task('watch', () => {
	gulp.watch([config.script.watch], ['standard'])
	gulp.watch([config.script.watch], ['build:js'])
	gulp.watch([config.styles.watch], ['build:css'])
})

gulp.task('default', ['watch'])