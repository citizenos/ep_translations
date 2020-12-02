'use strict';

const cloneOrPull = require('git-clone-or-pull');
const path = require('path');
const fs = require('fs');

const languages = {};
let settings = {};
// defaults to node_module folder
let savePath = path.join(process.cwd(), 'node_modules', 'ep_translations', 'locales');

const loadTranslations = async () => {
  fs.readdir(savePath, (err, files) => {
    if (err) throw new Error(err);
    if (!files || !files.length) {
      return;
    }
    let i = 0;
    let called = false;
    const filtered = files.filter((file) => {
      if (file.indexOf('.json') > -1 && file !== 'source.json') {
        return file;
      }
    });

    filtered.forEach((file) => {
      const lang = file.split('.')[0];
      fs.readFile(path.join(savePath, file), (err, data) => {
        try {
          const languageData = JSON.parse(data);
          Object.keys(languageData).forEach((key) => {
            if (languageData[key] == null || languageData[key] === '') delete languageData[key];
          });
          languages[lang] = languageData;
          i++;
          if (i === files.length && !called) {
            called = true;
            return true;
          }
        } catch (err) {
          console.error('ep_translations', file, err);
          throw new Error(err);
        }
      });
    });
  });
};

exports.loadSettings = async (hook, context) => {
  settings = context.settings.ep_translations;
  if (settings.savePath) {
    savePath = settings.savePath;
  }
  if (settings.type === 'git') {
    const options = {
      path: savePath,
    };
    if (settings.branch) {
      options.branch = settings.branch;
    }
    if (settings.implementation) {
      options.implementation = settings.implementation;
    }

    await cloneOrPull(settings.path, options, async (err, res) => {
      if (err) {
        console.error('ep_translations', err, res);
      }

      return await loadTranslations();
    });
  } else {
    return await loadTranslations();
  }
};

exports.clientVars = (hook, context, cb) => {
  return cb({ep_translations: { languages }});
};
