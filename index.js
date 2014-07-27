var es = require('event-stream');
var core = require('./lib/core.js');

function render_pipeline() {
    return es.pipeline(
        core.render_page(),
        core.unfolder_index(),
        core.wiki()
    );
}

function src() {
    s1 = core.src_modules()
        .pipe(core.build_module_assets())
        .pipe(core.module_pages());
    s2 = core.src_pages();
    return es.merge(s1,s2);
}

function watch() {
    s0 = src();
    s1 = core.watch_pages();
    s2 = core.watch_modules()
        .pipe(core.build_module_assets())
        .pipe(core.module_pages());

    return es.merge(s0, s1, s2);
}

module.exports = {render_pipeline:render_pipeline, src:src, watch:watch};