'use strict'

var cloneOrPull = require('git-clone-or-pull');
var path = require('path');
var fs = require('fs');

var languages = {};
var settings = {};
var savePath = path.join(process.cwd(), 'src', 'ep_translations');

var loadTranslations = function () {
    fs.readdir(savePath, function (err, files) {
        console.log('languages', files);

        files.forEach(function (file) {
            if (file.indexOf('.json') > -1 && file !== 'source.json') {
                var lang = file.split('.')[0];
                fs.readFile(path.join(savePath, file), function (err, data) {
                    languages[lang] = JSON.parse(data);
                });
            }
        });
    });
};

exports.loadSettings = function (hook_name, context) {
    settings = context.settings.ep_translations;
};

exports.clientVars = function (hook, context, callback) {
    if (settings.mode === 'git') {
        cloneOrPull(settings.path, savePath, function(err) {
            if (err) {
                console.log(err);
            }

            loadTranslations();
            // Use repo
        });
    } else {
        loadTranslations();
    }

    return callback({"ep_translations": {"languages": languages}});
};
