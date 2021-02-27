let gulp = require("gulp");
let {src, dest} = require("gulp");
let browsersync = require("browser-sync").create();
let fileinclude = require("gulp-include");
let htmlmin = require("gulp-htmlmin");
let scss = require("gulp-sass");
let autoprefixer = require("gulp-autoprefixer");
let cleancss = require("gulp-clean-css");
let uglify = require("gulp-uglify-es").default;
let babel = require("gulp-babel");
let imagemin = require("gulp-imagemin");
let svgsprite = require("gulp-svg-sprite");
let del = require("del");

let project_folder = require("path").basename(__dirname);
let source_folder = "src";

let path = {
   build: {
      html: project_folder + "/",
      css: project_folder + "/css/",
      js: project_folder + "/js/",
      img: project_folder + "/img/",
      fonts: project_folder + "/fonts/"
   },
   source: {
      html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
      css: source_folder + "/scss/style.scss",
      js: source_folder + "/js/*.js",
      img: source_folder + "/img/*",
      fonts: source_folder + "/fonts/*"
   },
   watch: {
      html: source_folder + "/**/*.html",
      css: source_folder + "/scss/*.scss",
      js: source_folder + "/js/*.js",
      img: source_folder + "/img/*",
      fonts: source_folder + "/fonts/*"
   },
   clean: "./" + project_folder + "/"
}

// HTML

gulp.task("html", () => {
   return src(path.source.html)
      .pipe(fileinclude())
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
});

// CSS

gulp.task("css", () => {
   return src(path.source.css)
      .pipe(scss({ outputStyle: "expanded" }))
      .pipe(autoprefixer({ overrideBrowserlist: ["last 5 versions"], cascade: true }))
      .pipe(cleancss())
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
});

//JS

gulp.task("js", () => {
   return src(path.source.js)
      .pipe(fileinclude())
      .pipe(babel({ presets: ["@babel/env"] }))
      .pipe(uglify())
      .pipe(dest(path.build.js))
      .pipe(browsersync.stream())
});

// IMG

gulp.task("img", () => {
   return src(path.source.img)
      .pipe(imagemin({ progressive: true, svgoPlugins: [{ removeViewBox: false }], interlaced: true, optimizationLevel: 3 }))
      .pipe(dest(path.build.img))
      .pipe(browsersync.stream())
});

gulp.task("svgsprite", function() {
   return gulp.src([source_folder + "/iconsprite/*.svg"])
      .pipe(svgsprite({ mode: { stack: { sprite: "../icons/icons.svg" }}}))
      .pipe(dest(path.build.img))
})

// FONTS

gulp.task("fonts", () => {
   return src(path.source.fonts)
      .pipe(dest(path.build.fonts))
      .pipe(browsersync.stream())
});

// WATCH

gulp.task("watch", () => {
   browsersync.init({
      server: {
         baseDir: "./" + project_folder + "/"
      },
      port: 3000,
      notify: false
   });
   gulp.watch([path.watch.html], gulp.series("html"));
   gulp.watch([path.watch.css], gulp.series("css"));
   gulp.watch([path.watch.js], gulp.series("js"));
   gulp.watch([path.watch.img], gulp.series("img"));
   gulp.watch([path.watch.fonts], gulp.series("fonts"));
});

// TASKS

gulp.task("del", () => {
   return del(path.clean);
});

// GULP

gulp.task("default", gulp.series("del", gulp.parallel("html", "css", "js", "img", "fonts"), "watch"));