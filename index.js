'use strict';

const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs/promises');

const languages = {};
let settings = {};
// defaults to node_module folder
let savePath = path.join(process.cwd(), 'node_modules', 'ep_translations', 'locales');

const cloneOrPull = async (url, options) => {
  try {
    await fs.access(savePath);
} catch (err) {
    console.info('ep_translate no translations directory', err);
    try {
      await fs.mkdir(savePath, {recursive: true});
    } catch (err) {
      console.error('ep_translate PATH ERROR', err);
    }
}

  const git = simpleGit(savePath);
  const initialiseRepo = async (git) => {
    await git.init();
    return git.addRemote('origin', url);
  };

  const isRepo = await git.checkIsRepo();
  if (!isRepo) await initialiseRepo(git);
  await git.pull(options.remote || 'origin', options.branch || 'master');
};

const loadTranslations = async () => {
  const files = await fs.readdir(savePath);
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
    const data = await fs.readFile(path.join(savePath, file));
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
