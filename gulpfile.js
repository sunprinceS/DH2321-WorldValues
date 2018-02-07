var gulp = require('gulp'),
    connect = require('gulp-connect'),
    semantic_ui = require('./semantic/gulpfile')(gulp);

gulp.task('connect',function(){
  connect.server();
});

gulp.task('server',['watch','connect']);
gulp.task('default',['server']);
