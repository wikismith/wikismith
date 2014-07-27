module.exports = {
    render: function(file) {
        return '<html><body><pre>'+String(file.contents)+'</pre></body></html>';
    },

    build_module_assets: function(cb) {
        cb();
    }

}
