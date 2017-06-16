/**
 * Created by neo.white on 2017/6/1.
 */
var gulp = require('gulp'),
    path = require('path'),
    ts = require("gulp-typescript"),
    tsProject = ts.createProject("tsconfig.json"),
    watch = require('gulp-watch'),
    clean = require('gulp-clean'),
    less = require('gulp-less'),
    sourcemap = require('gulp-sourcemaps'),
    cp = require('copy'),
    browserify = require('browserify'),
    tsify = require('tsify'),
    source = require('vinyl-source-stream'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    buffer = require('vinyl-buffer'),
    watchify = require("watchify"),
    gutil = require("gulp-util"),
    bserver = require('browser-sync');

var watchedBrowserify = watchify(browserify({
    basedir: '.',
    debug: true,
    entries: ['src/ts/main.ts'],
    cache: {},
    packageCache: {}
}).plugin(tsify));
function bundle() {
    watchedBrowserify
        .transform('babelify', {
            presets: ['es2015'],
            extensions: ['.ts']
        })
        .bundle()
        .pipe(source('build.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest("dist/js"));
}
//less编译
gulp.task('less',function(){
    return gulp.src('src/less/*.less')
        .pipe(sourcemap.init())
        .pipe(less())
        .pipe(sourcemap.write('./maps'))
        .pipe(gulp.dest('dist/css'));
});
//复制html文件到dist
gulp.task('copy', function (callback) {
    cp(['src/*.html','src/**/*.html','src/lib/*.*','src/js/*.*','src/favicon.ico'], 'dist', callback);
});
//ts文件转换
gulp.task('ts', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist/js'));
});
//watch
gulp.task('changes',function(){
    gulp.watch(['src/*.html','src/**/*.html','src/lib/*.*','src/js/*.*'], function (event) {
        var p = event.path.replace(/\\/g, '/'),
            n = path.dirname(p.replace(/src/gi, 'dist'));

        return gulp.src(p)
            .pipe(gulp.dest(n));
    });
    gulp.watch(['src/less/*.less'],['less']);
    //gulp.watch('src/**/*.ts', ['build']);
});
//clean
gulp.task('clean',function(){
   return gulp.src('dist',{read:false})
       .pipe(clean())
});

//browserify
gulp.task('build',['copy'],bundle);
/**
 * 构建browser-sync,就是server
 * Browser sync options
 * options:http://www.browsersync.cn/docs/options/
 */
var bsInit = {
    ui: {
        port: 8090,
        weinre: {
            port: 9090
        }
    },
    files: ['dist/*.html','dist/**/*.html','dist/**/*.js','dist/**/*.css'],
    watchOptions:{
        ignoreInitial: true,
        ignored:'*.txt'
    },
    server:{
        baseDir: ['dist'],
        //directory: true, //这个一旦打开,index失效
        index:'/index.html',
        routes: {
            "/bower_components": "bower_components",
            "/node_modules":"node_modules"
        }
    },
    port:'8090',
    logLevel:'info',
    reloadOnRestart:true
};
gulp.task('serve', function() {
    bserver(bsInit);
});
gulp.task('default',['build','less','copy','serve','changes']);

watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);