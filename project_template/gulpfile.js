var gulp = require('gulp');
var es = require('event-stream');
var wikismith = require('wikismith');
var express = require('express');
var livereload = require('connect-livereload');
var tinylr = require('tiny-lr');

var app = express();
var lr = tinylr();

function serve() {
    wikismith.watch()
        .pipe(wikismith.render_pipeline())
        .pipe(gulp.dest('build'))
        .pipe(es.map(function(file, cb) {
            lr.changed({body: { files: [file.path] }});
            cb(null, file);
        }));

    app.use(livereload());
    app.use(express.static(__dirname + '/build'));
    app.listen(9292);
    lr.listen(35729);
}

gulp.task('default', function() {
    serve()
});

gulp.task('install', function() {
    wikismith.core.install();
})