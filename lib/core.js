var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var es = require('event-stream');
var fs = require('fs');
var path = require('path');
var frontmatter = require('front-matter');
var yaml = require('js-yaml');
var slugify = require('cozy-slug');
var parsetrace = require('parsetrace');
var ejs = require('ejs');
var time = require('time');

var bower = require('gulp-bower');
var npm = require('npm-install');

var throttle_duplicates = require('./throttle_duplicates');
var relate_stream = require('./relate_stream.js');

// EXPORTED METHODS

module.exports = {
    watch_pages: watch_pages,
    watch_themes: watch_themes,
    src_pages: src_pages,
    src_themes: src_themes,
    render_page: render_page,
    gulp_theme: gulp_theme,
    unfolder_index: unfolder_index,
    emit_pages: emit_pages,
    emit_dependent: emit_dependent,
    wiki: wiki,
    index_entry: index_entry,
    npm_install: npm_install,
    bower_install: bower_install,
	watch_themes_all: watch_themes_all
}

function emit_pages() {
    // given a module emit all the related pages
    return relate_stream( function(file1, stream) {
        src_pages()
            .pipe(es.map( function(file2,cb) {
                if (file2.params.theme == file1.theme) {
                    stream.emit('data', file2);
                }
            }));
    })
}

function emit_dependent() {
    // given a page emit all the related pages
    return relate_stream( function(file1, stream) {
        stream.emit('data',file1);
        src_pages()
            .pipe(es.map( function(file2,cb) {
                var data = String(file2.contents);
                var matches = data.match(/\[\[\[.*?\]\]\]/g) || [];
                matches.forEach( function(match) {
                    var slug_name =  slugify(match,"_").toLowerCase();
                    var newf = path.join(process.cwd(),'pages',slug_name,'index.md');
                    if (slug_name == file1.page) {
                        gutil.log("Emitting dependent page: "+file2.page);
                       stream.emit('data', file2);
                    }
                })
            }));
    })
}

function src_pages(page_dir) {
    page_dir = typeof page_dir !== 'undefined' ? page_dir : 'pages';
    return gulp.src(page_dir+"/**/index.md")
        .pipe(decoratePage())
}

function src_themes(theme_dir) {
    theme_dir = typeof theme_dir !== 'undefined' ? theme_dir : 'themes';
    return gulp.src(theme_dir+"/*/gulpfile.js")
        .pipe(decorateModule())
}

function watch_pages(page_dir) {
    page_dir = typeof page_dir !== 'undefined' ? page_dir : 'pages';
    return watch({glob:'./'+page_dir+'/**/*', emitOnGlob: false})
        .pipe(get_page_index())
        .pipe(throttle_duplicates('path',1000))
        .pipe(decoratePage())
}


function watch_themes_all(theme_dir) {
    theme_dir = typeof theme_dir !== 'undefined' ? theme_dir : 'themes';
    return watch({glob:[theme_dir+'/*/*/*', theme_dir+'/*/*'], emitOnGlob: false})
        .pipe(get_module_gulpfile())
        .pipe(throttle_duplicates('path',1000))
        .pipe(decorateModule())
}

function watch_themes(theme_dir) {
    theme_dir = typeof theme_dir !== 'undefined' ? theme_dir : 'themes';
    return watch({glob:[ theme_dir+'/*/*.*', theme_dir+'/*/src/**/*'], emitOnGlob: false})
        .pipe(get_module_gulpfile())
        .pipe(throttle_duplicates('path',1000))
        .pipe(decorateModule())
}

function unfolder_index(page_dir) {
    page_dir = typeof page_dir !== 'undefined' ? page_dir : 'pages';
    return es.map(function (file, cb) {
        if (file.page=='index') {
            var cwd = path.join(process.cwd(),page_dir)
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

function gulp_theme() {

    return es.map(function (file, cb) {
        gutil.log("Build Module: "+file.theme);
        var call_back = function() {
            cb(null, file)
        };
        module_path = file.path;
        delete require.cache[require.resolve(module_path)]
        var gulpfile = require(module_path);
        try {
            gulpfile(call_back);
        }
        catch (error) {
            gutil.log(gutil.colors.red("Error Building "+file.theme));
            gutil.log(error.message);
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
        file.theme = path.dirname(file.path).split(path.sep).slice(-1)[0]
        cb(null, file);
    });
}

function get_page_index(page_dir) {
    // Converts pages/page1/foo_page/bar/jazz -> wikismith_themes/foo_page/index.md
    page_dir = typeof page_dir !== 'undefined' ? page_dir : 'pages';
    return get_index_helper(page_dir, 'index.md');
}

function get_module_gulpfile(theme_dir) {
    // Converts wikismith_themes/foo_module/bar/jazz -> wikismith_themes/foo_module/index.js
    theme_dir = typeof theme_dir !== 'undefined' ? theme_dir : 'themes';
    return get_index_helper(theme_dir, 'gulpfile.js');
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

function pageContent(file, theme_dir) {
    theme_dir = typeof theme_dir !== 'undefined' ? theme_dir : 'themes';
    try {
        if (file.paramserror)
        {
            throw file.params.error;
        }
        else
        {
            var module_name = file.params.theme || 'minimum'
            var modulePath = path.join(process.cwd(), theme_dir, module_name, 'index.js');
            delete require.cache[require.resolve(modulePath)]
            var wikismith_module = require(modulePath);
            var h1 = wikismith_module(file);
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
        "<p class='lead'>Failed to render page <%=file.page%> with module <%=file.params.theme%></p>",
        "<div class='error-box'><%-error.name%>: <%=error.message.split('\\n').slice(-1)[0]%></div>",
        "<%if (parsetrace.match('ejs.js')) {%>",
        "<h3>EJS Error</h3>",
        "<pre><%=error.message%></pre>",
        "<%}%>",
        "<h3>Stack Trace</h3>",
        "<pre><%-parsetrace%></pre>",
        "</body></html>"].join("\n")

    try
    {
        var pt = parsetrace(error, { sources: true }).toString();
    }
    catch (e2)
    {
        var pt = error.stack;
    }

    return ejs.render(template_data, {
        file: file,
        error: error,
        parsetrace: pt,
        wikismith_error: wikismith_error
    });

}

function npm_install() {
    return es.map( function(file, cb) {
        var fcb = function() {
            cb(undefined, file);
        }
        var packageDir = path.dirname(file.path);
        npm(packageDir, fcb);
    });
}

function bower_install() {
    return es.map( function(file, cb) {
            var module_path = path.dirname(file.path);
            bower({cwd: module_path});
            cb(undefined ,file);
        });
}

function index_entry(page_dir) {
    page_dir = typeof page_dir !== 'undefined' ? page_dir : 'pages';
    return es.map( function(file1, cb) {
        data = file1.contents;
        var results = String(data);
        var matches = results.match(/\[\[\[.*?\]\]\]/g) || [];
        matches.forEach( function(match) {
            var title = match.replace("[[[",'').replace("]]]",'')
            var slug_name =  slugify(match,"_").toLowerCase();
            var newfldr = path.join(process.cwd(),page_dir,slug_name);
            var newf = path.join(process.cwd(),page_dir,slug_name,'index.md');
            if (fs.existsSync(newf) == false) {
                if (fs.existsSync(newfldr) == false) {
                    fs.mkdirSync(newfldr);
                }
                gutil.log(gutil.colors.yellow('Creating New File: '+ '/pages/'+ slug_name+'/index.md'));
                // Create Fontmatter
                var attrs = file1.params;
                attrs.title = title;
                attrs.subtitle = 'This is my new posts subtitle';
                attrs.excerpt = 'This is my new posts excerpt'
                attrs.created = new time.Date().toString()
                var newBody = "---\n"+yaml.dump(attrs, {flowlevel: 10})+"---\n"
                fs.writeFile(newf, newBody);
                var f = {
                    url: '/'+slug_name+'/index.html',
                    slug: slug_name,
                    path: newf,
                    page: path.dirname(newf.path).split(path.sep).slice(-1)[0],
                    params: attrs,
                    body: ''
                }
            }
            else {
                var fm = frontmatter(String(fs.readFileSync(newf)));
                var f = {
                    url: '/'+slug_name+'/index.html',
                    slug: slug_name,
                    path: newf,
                    page: path.dirname(newf.path).split(path.sep).slice(-1)[0],
                    params: fm.attributes,
                    body: fm.body
                }

            }
            results = results.replace(match, formatter(file1.theme).page_snippet(f));
        })
        file1.contents = new Buffer(results);
        cb(undefined, file1);
    })
}

function wiki(page_dir) {
    page_dir = typeof page_dir !== 'undefined' ? page_dir : 'pages';
    return es.map( function(file1, cb) {
        data = file1.contents;
        var results = String(data);
        var matches = results.match(/\[\[.*?\]\]/g) || [];
        matches.forEach( function(match) {
            var title = match.replace("[[",'').replace("]]",'')
            var slug_name =  slugify(match,"_").toLowerCase();
            var newfldr = path.join(process.cwd(),page_dir,slug_name);
            var newf = path.join(process.cwd(),page_dir,slug_name,'index.md');
            if (fs.existsSync(newf) == false) {
                if (fs.existsSync(newfldr) == false) {
                    fs.mkdirSync(newfldr);
                }
                gutil.log(gutil.colors.yellow('Creating New File: '+ '/pages/'+ slug_name+'/index.md'));
                // Create Fontmatter
                var attrs = file1.params;
                attrs.title = title;
                attrs.subtitle = '';
                attrs.created = new time.Date().toString();
                var newBody = "---\n"+yaml.dump(attrs, {flowlevel: 10})+"---\n"
                fs.writeFile(newf, newBody);
            }
            results = results.replace(match, "<a href='/"+slug_name+"/index.html'>"+title+"</a>")
        })
        file1.contents = new Buffer(results);
        cb(undefined, file1);
    })
}

function formatter(theme) {
    var formatter = require('../formatters/index.js');
    return formatter;

//    module_path = path.join('wikismith_themes', process.cwd()
//    delete require.cache[require.resolve(module_path)]
//    var gulpfile = require(module_path);
//    try {
//        gulpfile(call_back);
//    }
//    catch (error) {
//        gutil.log(gutil.colors.red("Error Building "+file.theme));
//        gutil.beep();
//        call_back();
//    }

}