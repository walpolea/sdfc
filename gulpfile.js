const gulp = require("gulp"),
  fs = require("fs"),
  del = require("del"),
  sourcemaps = require("gulp-sourcemaps"),
  plumber = require("gulp-plumber"),
  sass = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  minifyCss = require("gulp-clean-css"),
  babel = require("gulp-babel"),
  webpack = require("webpack-stream"),
  uglify = require("gulp-uglify"),
  concat = require("gulp-concat"),
  imagemin = require("gulp-imagemin"),
  browserSync = require("browser-sync").create(),
  nunjucksRender = require("gulp-nunjucks-render"),
  data = require("gulp-data"),
  src_folder = "src/",
  src_assets_folder = src_folder + "assets/",
  src_css_folder = src_folder + "css/",
  src_js_folder = src_folder + "js/",
  src_html_folder = src_folder + "html/",
  dist_folder = "dist/",
  dist_assets_folder = dist_folder + "assets/",
  dist_css_folder = dist_folder + "css/",
  dist_js_folder = dist_folder + "js/",
  dist_html_folder = dist_folder;

gulp.task("clear", () => del([dist_folder]));

gulp.task("nunjucks", function () {
  // Gets .html, .nunjucks or .njk files and compiles them
  return gulp
    .src(src_html_folder + "/*.+(html|nunjucks|njk)")
    .pipe(
      data(function () {
        // return require("./src/data/data.json");
        return JSON.parse(fs.readFileSync("./src/data/data.json"));
      })
    )
    .pipe(
      nunjucksRender({
        path: [src_html_folder],
      })
    )
    .pipe(gulp.dest(dist_html_folder));
});

gulp.task("sass", () => {
  return gulp
    .src([src_css_folder + "**/*.sass", src_css_folder + "**/*.scss"])
    .pipe(sourcemaps.init())
    .pipe(
      plumber(function (error) {
        console.log(error.message);
        this.emit("end");
      })
    )
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(minifyCss())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(dist_css_folder))
    .pipe(browserSync.stream());
});

gulp.task("js", () => {
  return gulp
    .src([src_js_folder + "**/*.js"], { since: gulp.lastRun("js") })
    .pipe(plumber())
    .pipe(
      webpack({
        mode: "production",
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(concat("scripts.min.js"))
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(dist_js_folder))
    .pipe(browserSync.stream());
});

gulp.task("images", () => {
  return gulp
    .src([src_assets_folder + "**/*.+(png|jpg|jpeg|gif|svg|ico)"], {
      since: gulp.lastRun("images"),
    })
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(dist_assets_folder))
    .pipe(browserSync.stream());
});

//commented out unused compilation steps - can be enabled later
gulp.task("build", gulp.series("clear", "nunjucks", "sass", "js", "images"));

gulp.task("dev", gulp.series("nunjucks", "sass", "js", "images"));

gulp.task("serve", () => {
  return browserSync.init({
    server: {
      baseDir: ["dist"],
    },
    port: 3000,
    open: false,
  });
});

gulp.task("watch", () => {
  const watchImages = [src_assets_folder + "**/*.+(png|jpg|jpeg|gif|svg|ico)"];

  const watch = [
    src_folder + "data/**/*.json",
    src_html_folder + "**/*.+(html|nunjucks|njk)",
    src_css_folder + "**/*.sass",
    src_css_folder + "**/*.scss",
    src_js_folder + "**/*.js",
    src_js_folder + "**/*.js",
  ];

  gulp.watch(watch, gulp.series("dev")).on("change", browserSync.reload);
  gulp.watch(watchImages, gulp.series("images")).on("change", browserSync.reload);
});

gulp.task("default", gulp.series("build", gulp.parallel("serve", "watch")));
