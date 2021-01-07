const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const htmlmin = require("gulp-htmlmin");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const del = require("del");

const imagemin = require("gulp-imagemin");
// HTML
gulp.task("html", () => {
	return gulp
		.src("./src/*.html")
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest("./dist"))
		.pipe(browserSync.stream());
});
// CSS
gulp.task("css", () => {
	return gulp
		.src(["./src/scss/style.scss"])
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(concat("style.css"))
		.pipe(
			autoprefixer({
				browsers: ["last 10 versions"],
				cascade: false,
			})
		)
		.pipe(
			cleanCSS({
				compatibility: "ie8",
				level: {
					1: {
						all: true,
						specialComments: 0,
					},
					2: {
						all: true,
					},
				},
			})
		)
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest("./dist/css"))
		.pipe(browserSync.stream());
});
// JS
gulp.task("js", () => {
	return gulp
		.src(["./src/js/main.js"])
		.pipe(concat("main.js"))
		.pipe(
			babel({
				presets: ["@babel/env"],
			})
		)
		.pipe(
			uglify({
				toplevel: true,
			})
		)
		.pipe(gulp.dest("./dist/js"))
		.pipe(browserSync.stream());
});
// IMG
gulp.task("img", () => {
	return gulp
		.src("./src/img/**")
		.pipe(imagemin({ progressive: true }))
		.pipe(gulp.dest("./dist/img/"))
		.pipe(browserSync.stream());
});
// FONTS
gulp.task("fonts", () => {
	return gulp
		.src("./src/fonts/**")
		.pipe(gulp.dest("./dist/fonts/"))
		.pipe(browserSync.stream());
});
// WATCH
gulp.task("watch", () => {
	browserSync.init({
		server: {
			baseDir: "./dist/",
		},
		port: 3000,
	});
	gulp.watch("./src/*.html", gulp.series("html"));
	gulp.watch("./src/scss/*.scss", gulp.series("css"));
	gulp.watch("./src/js/*.js", gulp.series("js"));
	gulp.watch("./src/img/**", gulp.series("img"));
	gulp.watch("./src/fonts/**", gulp.series("fonts"));
});
// TASKS
gulp.task("del", () => {
	return del(["./dist/*"]);
});
// GULP
gulp.task(
	"default",
	gulp.series(
		"del",
		gulp.parallel("html", "css", "js", "img", "fonts"),
		"watch"
	)
);
