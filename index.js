var core = require('./lib/core.js');
var gulp = require('gulp');
var es = require('event-stream');
var fs = require('fs');

function pipeline(theme_dir, page_dir) {
    return es.pipeline(
        core.render_page(theme_dir),
        core.unfolder_index(page_dir),
        core.index_entry(page_dir),
        core.wiki(page_dir)
    );
}

function src(theme_dir, page_dir) {
    var s1 = core.src_themes(theme_dir)
        .pipe(core.gulp_theme(theme_dir))
        .pipe(core.emit_pages(page_dir));
    var s2 = core.src_pages(page_dir);
    return es.merge(s1,s2);
}

function watch(theme_dir, page_dir) {
    var s0 = src();
    var s1 = core.watch_pages(page_dir)
        .pipe(core.emit_dependent(page_dir));
    var s2 = core.watch_themes(theme_dir)
        .pipe(core.gulp_theme(theme_dir))
        .pipe(core.emit_pages(page_dir));
    return es.merge(s0, s1, s2);	
}

function watch_all(theme_dir, page_dir) {
    var s0 = src();
    var s1 = core.watch_pages(page_dir)
        .pipe(core.emit_dependent(page_dir))
    var s2 = core.watch_themes_all(theme_dir)
        .pipe(core.gulp_theme(theme_dir))
        .pipe(core.emit_pages(page_dir));
    return es.merge(s0, s1, s2);
}

function install(theme_dir) {
    theme_dir = typeof theme_dir !== 'undefined' ? theme_dir : 'themes';
    var s1 = gulp.src('./'+theme_dir+'/*/bower.json')
        .pipe(core.bower_install());

    var s2 = gulp.src('./'+theme_dir+'/*/package.json')
        .pipe(core.npm_install());

    return es.merge(s1, s2);
}

module.exports = {pipeline: pipeline, src:src, watch:watch, watch_all: watch_all, install: install, core: core};