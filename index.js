'use strict';

const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const languages = {};
let settings = {};
// defaults to node_module folder
let savePath = path.join(process.cwd(), 'node_modules', 'ep_translations', 'locales');

const cloneOrPull = async (url, options) => {
  const git = simpleGit(options.path);
  const initialiseRepo = async (git) => {
    await git.init();
    return git.addRemote('origin', url);
  };

  const isRepo = await git.checkIsRepo();
  if (!isRepo) await initialiseRepo(git);

  git.fetch();
};

const loadTranslations = async () => {
  const files = fs.readdirSync(savePath);
  if (!files || !files.length) {
    return;
  }
  const filtered = files.filter((file) => {
    if (file.indexOf('.json') > -1 && file !== 'source.json') {
      return file;
    }
  });
  let i = 0;
  let called = false;
  filtered.forEach(async (file) => {
    const lang = file.split('.')[0];
    const data = await fs.readFileSync(path.join(savePath, file));
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
};

exports.loadSettings = async (hook, context) => {
  try {
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

      await cloneOrPull(settings.path, options);

      return await loadTranslations();
    } else {
      return await loadTranslations();
    }
  } catch (err) {
    console.log('ep_translations ERROR', err);
  }
};

exports.clientVars = (hook, context, cb) => cb({ep_translations: {languages}}); // eslint-disable-line camelcase, max-len
