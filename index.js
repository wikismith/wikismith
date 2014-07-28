var es = require('event-stream');
var core = require('./lib/core.js');
var fs = require('fs');

function pipeline() {
    return es.pipeline(
        core.render_page(),
        core.unfolder_index(),
        core.wiki()
    );
}

function src() {
    var s1 = core.src_modules()
        .pipe(core.build_module())
        .pipe(core.emit_pages());
    var s2 = core.src_pages();
    return es.merge(s1,s2);
}

function watch() {
    var s0 = src();
    var s1 = core.watch_pages();
    var s2 = core.watch_modules()
        .pipe(core.build_module())
        .pipe(core.emit_pages());
    return es.merge(s0, s1, s2);
}

module.exports = {pipeline: pipeline, src:src, watch:watch, core: core};