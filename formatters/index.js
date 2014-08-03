var ejs = require('ejs');
var fs = require('fs');
var path = require('path');

function page_snippet(file) {
    var template = String(fs.readFileSync(path.join(__dirname, 'page_snippet.html')));

    return ejs.render(template, {
        url: file.url,
        params: file.params
    });
}

module.exports = {
    page_snippet: page_snippet
}