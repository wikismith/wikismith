var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');

var es = require('event-stream');
var fs = require('fs');
var path = require('path');
var frontmatter = require('front-matter');
var yaml = require('js-yaml');
var slug = require('slug');
var parsetrace = require('parsetrace');
var ejs = require('ejs');

var throttle_duplicates = require('./lib/throttle_duplicates');
var relate_stream = require('./lib/relate_stream.js');

// EXPORTED METHODS

module.exports = {
    watch_pages: watch_pages,
    watch_modules: watch_modules,
    src_pages: src_pages,
    src_modules: src_modules,
    render_page: render_page,
    build_module_assets: build_module_assets,
    unfolder_index: unfolder_index,
    module_pages: module_pages
}

function module_pages() {
    // given a module emit all the related pages
    return relate_stream( function(file1, stream) {
        src_pages()
            .pipe(es.map( function(file2,cb) {
               if (file2.params.module == file1.module) {
                    stream.emit('data', file2);
               }
            }))
    })
}

function src_pages() {
    return gulp.src("pages/**/index.md")
        .pipe(decoratePage())
}

function src_modules() {
    return gulp.src("wikismith_modules/**/index.js")
        .pipe(decorateModule())
}

function watch_pages() {
    return watch({glob:'./pages/**/*', emitOnGlob: false})
        .pipe(get_page_index())
        .pipe(throttle_duplicates('path',1000))
        .pipe(decoratePage())
}

function watch_modules() {
    return watch({glob:'./wikismith_modules/**/*', emitOnGlob: false})
        .pipe(get_module_index())
        .pipe(throttle_duplicates('path',1000))
        .pipe(decorateModule())
}

function unfolder_index() {
    return es.map(function (file, cb) {
        if (file.page=='index') {
            var cwd = path.join(process.cwd(),'pages')
            var relative_path = path.relative(cwd, file.path).split(path.sep).slice(1).join(path.sep)
            file.path = path.join(cwd, relative_path);
        }
        cb(undefined, file);
    });
}

function render_page() {
    return es.map(function (file, cb) {
        gutil.log("Render Page: "+file.page);
        var contents = pageContent(file);
        file.contents =  new Buffer(contents);
        file.path = gutil.replaceExtension(file.path, '.html');
        cb(null, file);
    });
}

function build_module_assets() {

    return es.map(function (file, cb) {
        gutil.log("Build Module: "+file.module);
        var call_back = function() {
            cb(null, file)
        };
        module_path = file.path;
        delete require.cache[require.resolve(module_path)]
        var wikismith_module = require(module_path);
        try {
            wikismith_module.build_module_assets(call_back);
        }
        catch (error) {
            gutil.log(gutil.colors.red("Error Building "+file.module));
            gutil.beep();
            call_back();
        }
    });
}

// PRIVATE METHODS

function decoratePage() {
    // add page, params, and body attribute to file
    return es.map(function (file, cb) {
        var fm = frontmatter(String(fs.readFileSync(file.path)));
        file.page = path.dirname(file.path).split(path.sep).slice(-1)[0]
        file.params = fm.attributes;
        file.body = String(fm.body);
        cb(null, file);
    });
}

function decorateModule() {
    // add module attribute to file
    return es.map(function (file, cb) {
        file.module = path.dirname(file.path).split(path.sep).slice(-1)[0]
        cb(null, file);
    });
}

function get_page_index() {
    // Converts pages/page1/foo_page/bar/jazz -> wikismith_modules/foo_page/index.md
    return get_index_helper('pages', 'index.md')
}

function get_module_index() {
    // Converts wikismith_modules/foo_module/bar/jazz -> wikismith_modules/foo_module/index.js
    return get_index_helper('wikismith_modules', 'index.js')
}

function get_index_helper(folder_name, fname) {
    // Get the first nested folder afer folder_name path and then join it with fname
    var base = path.join(process.cwd(), folder_name);
    return es.map(function (file,cb) {
        var folder = path.relative(base, file.path).split(path.sep)[0];
        var folder_path = path.join(base, folder);
        file.path = path.join(folder_path, fname);
        cb(undefined, file);
    })
}

function pageContent(file) {
    try {
        if (file.paramserror)
        {
            throw file.params.error;
        }
        else
        {
            var module_name = file.params.module || 'minimum'
            var modulePath = path.join(process.cwd(), 'wikismith_modules', module_name, 'index.js');
            delete require.cache[require.resolve(modulePath)]
            var wikismith_module = require(modulePath);
            var h1 = wikismith_module.render(file);
            var h2 = h1 // makeWiki(h1, page);
            return h2;
        }
    }
    catch (error) {
        try {
            var error_html = renderError(file, error, "Wikismith Render Error");
            return error_html;
        }
        catch (errorRenderError) {
            return '<h1>An Error Occurred While Attempting To Render Error</h1>' +
                '<h2>Error-Render Error</h2>' +
                '<pre>'+errorRenderError+'</pre>' +
                '<h2>Original Error</h2>' +
                '<pre>'+error+'</pre>';
        }
    }
    return contents
};


function renderError(file, error, wikismith_error) {
    var template_data = ["<!DOCTYPE html><html lang='en'><head><title><%=wikismith_error%></title></head><body style='margin: 2em;'>",
        "<h1 class='text-muted'><%=wikismith_error%></h1>",
        "<p class='lead'>Failed to render page <%=file.page%> with module <%=file.params.module%></p>",
        "<div class='error-box'><%-error.name%>: <%=error.message.split('\\n').slice(-1)[0]%></div>",
        "<%if (parsetrace.object().frames[0].file.match('ejs.js')) {%>",
        "<h3>EJS Error</h3>",
        "<pre><%=error.message%></pre>",
        "<%}%>",
        "<h3>Stack Trace</h3>",
        "<pre><%-parsetrace.toString()%></pre>",
        "</body></html>"].join("\n")

    var pt = parsetrace(error, { sources: true });

    return ejs.render(template_data, {
        file: file,
        error: error,
        parsetrace: pt,
        wikismith_error: wikismith_error
    });

}

function makeWiki(data, page) {
    var results = String(data);
    var matches = results.match(/\[\[.*?\]\]/g) || [];
    matches.forEach( function(match) {
        var title = match.replace("[[",'').replace("]]",'')
        var slug_name =  slug(match,"_").toLowerCase();
        var newf = process.cwd() + '/wiki/'+ slug_name+'.md';
        if (fs.existsSync(newf) == false) {
            gutil.log(gutil.colors.yellow('Creating New File: '+ '/wiki/'+ slug_name+'.md'));
            // Create Fontmatter
            var attrs = page.attributes;
            attrs.title = title;
            attrs.subtitle = '';
            attrs.crumbs = attrs.crumbs; // Worry about adding myself later
            var newBody = "---\n"+yaml.dump(attrs, {flowlevel: 10})+"---\n"
            fs.writeFile(newf, newBody);
        }
        results = results.replace(match, "<a href='"+slug_name+".html'>"+title+"</a>")
    })
    return results;
}