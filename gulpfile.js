let gulp = require("gulp");
let {src, dest} = require("gulp");
let browsersync = require("browser-sync").create();
let fileinclude = require("gulp-include");
let htmlmin = require("gulp-htmlmin");
let scss = require("gulp-sass");
let autoprefixer = require("gulp-autoprefixer");
let cleancss = require("gulp-clean-css");
let groupmedia = require("gulp-group-css-media-queries");
let rename = require("gulp-rename");
let uglify = require("gulp-uglify-es").default;
let babel = require("gulp-babel");
let imagemin = require("gulp-imagemin");
let webp = require("gulp-webp");
let webphtml = require("gulp-webp-html");
let webpcss = require("gulp-webpcss");
let svgsprite = require("gulp-svg-sprite");
let ttf2woff = require("gulp-ttf2woff");
let ttf2woff2 = require("gulp-ttf2woff2");
let fonter = require("gulp-fonter");
let del = require("del");
let fs = require("fs");

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
      img: source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}",
      fonts: source_folder + "/fonts/*.ttf"
   },
   watch: {
      html: source_folder + "/**/*.html",
      css: source_folder + "/scss/**/*.scss",
      js: source_folder + "/js/*.js",
      img: source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}"
   },
   clean: "./" + project_folder + "/"
}

// HTML

gulp.task("html", () => {
   return src(path.source.html)
      .pipe(fileinclude())
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(webphtml())
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
});

// CSS

gulp.task("css", () => {
   return src(path.source.css)
      .pipe(scss({ outputStyle: "expanded" }))
      .pipe(groupmedia())
      .pipe(autoprefixer({ overrideBrowserlist: ["last 5 versions"], cascade: true }))
      .pipe(webpcss({ webpClass: '.webp',noWebpClass: '.no-webp' }))
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
      .pipe(webp({ quality: 70 }))
      .pipe(dest(path.build.img))
      .pipe(src(path.source.img))
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
   src(path.src.fonts)
      .pipe(ttf2woff)
      .pipe(dest(path.build.fonts))
   return src(path.src.fonts)
      .pipe(ttf2woff2)
      .pipe(dest(path.build.fonts))
});

gulp.task("otf2ttf", function() {
   return src([source_folder + "/fonts/*.otf"])
      .pipe(fonter({ formats: ['ttf'] }))
      .pipe(dest(source_folder + "/fonts/"));
})

function fontstyle(params) {
   let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
   if (file_content == '') {
      fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
      return fs.readdir(path.build.fonts, function (err, items) {
         if (items) {
            let c_fontname;
            for (var i = 0; i < items.length; i++) {
               let fontname = items[i].split('.');
               fontname = fontname[0];
               if (c_fontname != fontname) {
                  fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
               }
               c_fontname = fontname;
            }
         }
      })
   }
} function cb() {}

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
});

// TASKS

gulp.task("del", () => {
   return del(path.clean);
});

// GULP

gulp.task("default", gulp.parallel(gulp.series("del", gulp.parallel("html", "css", "js", "img"), fontstyle), "watch"));