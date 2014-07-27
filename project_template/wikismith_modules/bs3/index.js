var marked = require('marked');
var highlight = require('highlight.js');
var ejs = require('ejs');
var trim = require('trim');
var gutil = require('gulp-util');
var xregexp = require('xregexp');
var gulp = require('gulp');
var es = require('event-stream');
var path = require('path');
var wiredep = require('wiredep');
var inject = require("gulp-inject");
var frontmatter = require("front-matter");
var fs = require("fs");

var renderer = new marked.Renderer();

// EXPORTED METHODS

function render(file) {
    var template = String(fs.readFileSync(path.join(__dirname, 'template.html')));

    var h = marked(file.body);;
    var h2 = endify_headings(h);
    var h3 = rowify_h3s(h2);
    //var h = leadify_h1s(h);

    //gutil.log(JSON.stringify(marked.lexer(file.body)))

    return ejs.render(template, {
        params: file.params,
        content: h3,
        ast: marked.lexer(file.body)
    });
}

function buildAssets(cb) {
    var fsrc = __dirname;
    var fdst = path.join(process.cwd(), 'build', 'bs3');

    var bower_options = {
        directory:  path.join(fsrc, 'bower_components'),
        bowerJson:  require(path.join(fsrc, 'bower.json'))
    }

    var bower_js = wiredep(bower_options).js || 'undefined';
    var bower_css = wiredep(bower_options).css || 'undefined';

    var bower_assets = es.merge(
        gulp.src(bower_js).pipe(gulp.dest(path.join(fdst,'bower','js'))),
        gulp.src(bower_css).pipe(gulp.dest(path.join(fdst,'bower','css')))
    );

    var app_assets = es.merge(
        gulp.src([fsrc+'/js/**/*.js']).pipe(gulp.dest(path.join(fdst,'js'))),
        gulp.src([fsrc+'/css/**/*.css']).pipe(gulp.dest(path.join(fdst,'css')))
    );

    gulp.src(path.join(__dirname, 'template.html'))
        .pipe(inject(es.merge(bower_assets),
            {
                ignorePath: '/build/',
                starttag: '<!-- bower:{{ext}} -->'
            }))
        .pipe(inject(es.merge(app_assets),
            {
                ignorePath: '/build/'
            }))
        .pipe(gulp.dest(path.join(__dirname)))
        .on('end', function() {
            cb()
            })



}

// PRIVATE

function customizeMarked() {
    renderer.heading = function (text, level) {
        var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        if (level==1)
        {
            return '<h'+level+' class="page-header" id="md-'+escapedText+'">' + text + '</h' + level + '>';
        }
        else
        {
            return '<h'+level+' id="md-'+escapedText+'">' + text + '</h' + level + '>';
        }
    }

    marked.setOptions({
        renderer: renderer,
        highlight: function (code) {
            return require('highlight.js').highlightAuto(code).value;
        }
    });
}

function leadify_h1s(html) {
    return html;
    var re = xregexp.XRegExp;
    var lRegex = re('(?<body><h1.*?)(?<pstart>(<p)(<prest>.*?</p>)(?<tail>(<!-- h[1-9] -->|<!-- end -->))','sgi')
    html = re.replace(html,lRegex,"${body}${pstart} class='lead' ${prest}${tail}");
    return html;
}

function endify_headings(html) {
    var re = xregexp.XRegExp;
    var heading = re('<(?<heading>h[1-9])','sgi');
    html = html + '<!-- end -->';
    html = re.replace(html, heading, '<!-- ${heading} --><${heading}' )
    return html
}

function rowify_h3s(html) {
    var re = xregexp.XRegExp;

    var rowRegex = re('(?<body><h3.*?)(?<tail>(<!-- h[12] -->|<!-- end -->))','sgi')
    var colRegex = re('(?<body><h3.*?)(?<tail>(<!-- h[123] -->|<!-- end -->))','sgi')

    html = re.replace(html,rowRegex,"<div class='row'>${body}</div>${tail}");
    html = re.replace(html,colRegex,"<div class='col-sm-4'>${body}</div>${tail}");
    return html;
}

customizeMarked();

module.exports = {
    render: render,
    build_module_assets: buildAssets
}
