var core = require('./lib/core.js');
var gulp = require('gulp');
var es = require('event-stream');
var fs = require('fs');

function pipeline() {
    return es.pipeline(
        core.render_page(),
        core.unfolder_index(),
        core.wiki()
    );
}

function src() {
    var s1 = core.src_themes()
        .pipe(core.gulp_theme())
        .pipe(core.emit_pages());
    var s2 = core.src_pages();
    return es.merge(s1,s2);
}

function watch() {
    var s0 = src();
    var s1 = core.watch_pages();
    var s2 = core.watch_themes()
        .pipe(core.gulp_theme())
        .pipe(core.emit_pages());
    return es.merge(s0, s1, s2);
}

function install() {
    var s1 = gulp.src('./wikismith_themes/*/bower.json')
        .pipe(core.bower_install());

    var s2 = gulp.src('./wikismith_themes/*/package.json')
        .pipe(core.npm_install());

    return es.merge(s1, s2);
}

module.exports = {pipeline: pipeline, src:src, watch:watch, install: install, core: core};