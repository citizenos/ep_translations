'use strict'

exports.aceInitialized = function (hook, name) {
  var translations = window.html10n.translations;
  window.html10n.translations = translations;

  var languages = window.clientVars.ep_translations.languages;
  var lc = Object.keys(languages);

  $.each(lc, function (key, lang) {
    $.extend(window.html10n.loader.langs[lang], languages[lang]);
  });

  window.html10n.build(lc, function (err, done) {
    if (err) {
      throw err;
    }

    var language = document.cookie.match(/language=((\w{2,3})(-\w+)?)/);
    if (language) language = language[1];

    html10n.localize([language, navigator.language, navigator.userLanguage, 'en']);
    if ($('select').niceSelect) {
      $('select').niceSelect('update');
    }
  });
};

