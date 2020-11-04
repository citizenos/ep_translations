'use strict'

const cloneOrPull = require('git-clone-or-pull');
const path = require('path');
const fs = require('fs');

let languages = {};
let settings = {};
let savePath = path.join(process.cwd(),'node_modules', 'ep_translations', 'locales'); //defaults to node_module folder

const loadTranslations = async function (callback) {
    fs.readdir(savePath, function (err, files) {
        if (err) return reject(err);
        if (!files || !files.length) {
            return;
        }
        let i = 0;
        let called = false;
        const filtered = files.filter(function (file) {
            if (file.indexOf('.json') > -1 && file !== 'source.json') {
                return file;
            }
        });

        filtered.forEach(function (file) {
            const lang = file.split('.')[0];
            fs.readFile(path.join(savePath, file), function (err, data) {
                const languageData = JSON.parse(data);
                Object.keys(languageData).forEach(function (key) {
                    if (languageData[key] == null || languageData[key] === '') delete languageData[key];
                });
                languages[lang] = languageData;
                i++;
                if(i === files.length && !called) {
                    called = true;
                    callback();
                }
            });
        });
    });
};

exports.loadSettings = function (hook_name, context, cb) {
    settings = context.settings.ep_translations;
    if (settings.savePath) {
        savePath = settings.savePath;
    }
    if (settings.type === 'git') {
        let options = {
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

            loadTranslations(cb);
        });
    } else {
        loadTranslations(cb);
    }
};

exports.clientVars = async function (hook, context) {
    return {ep_translations: {languages}}
}
