'use strict';

exports.aceInitialized = (hook, name) => {
  const translations = window.html10n.translations;
  window.html10n.translations = translations;

  const languages = window.clientVars.ep_translations.languages;
  const lc = Object.keys(languages);

  $.each(lc, (key, lang) => {
    $.extend(window.html10n.loader.langs[lang], languages[lang]);
  });

  window.html10n.build(lc, (err, done) => {
    if (err) {
      throw err;
    }

    let language = document.cookie.match(/language=((\w{2,3})(-\w+)?)/);
    if (language) language = language[1];

    html10n.localize([language, navigator.language, navigator.userLanguage, 'en']);
    if ($('select').niceSelect) {
      $('select').niceSelect('update');
    }
  });
};
