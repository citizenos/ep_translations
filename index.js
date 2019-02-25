'use strict'

var cloneOrPull = require('git-clone-or-pull');
var path = require('path');
var fs = require('fs');

var languages = {};
var settings = {};
var savePath = path.join(process.cwd(),'node_modules', 'ep_translations', 'locales'); //defaults to node_module folder

var loadTranslations = function () {
    fs.readdir(savePath, function (err, files) {
        if (err) throw err;
        if (!files || !files.length) {
            return;
        }
        files.forEach(function (file) {
            if (file.indexOf('.json') > -1 && file !== 'source.json') {
                var lang = file.split('.')[0];
                fs.readFile(path.join(savePath, file), function (err, data) {
                    var languageData = JSON.parse(data);
                    Object.keys(languageData).forEach(function (key) {
                        if (languageData[key] == null || languageData[key] === '') delete languageData[key];
                    });
                    languages[lang] = languageData;
                });
            }
        });
    });
};

exports.loadSettings = function (hook_name, context) {
    settings = context.settings.ep_translations;
};

exports.clientVars = function (hook, context, callback) {
    if (settings.savePath) {
        savePath = settings.savePath;
    }
    if (settings.type === 'git') {
        var options = {
            path: savePath
        };
        if (settings.branch) {
            options.branch = settings.branch;
        }
        if (settings.implementation) {
            options.implementation = settings.implementation;
        }

        cloneOrPull(settings.path, options, function(err) {
            if (err) {
                console.error('ep_translations', err);
            }

            loadTranslations();
            // Use repo
        });
    } else {
        loadTranslations();
    }

    return callback({"ep_translations": {"languages": languages}});
};
