# Plugin to override etherpad and it's plugins translations

This plugin uses sepparate translations folder that contains files which override all other plugin translations.
As all plugins are translated sepparatly in each project, there might me cases where translations are missing for some languages.
Also sometimes translations might not be as accurate or look a little clumsy. This plugin can load translations from sepparate git repository on the go, or use static commited files that are stored in `/src/ep_translations` folder

for git config details look: https://github.com/strugee/node-git-clone-or-pull
Plugin config for using git
``` javascript
"ep_translations":{
    "type": "git",
    "path": "<path to git repo>",
    "branch" "<branch name>", //name of branch, if not set, default is master
    "implementation": "<name of implementation>" //if not set, default is nodegit
    "savePath": "/path/to/translaions/location" //by default is set to node_modules/ep_translations/locales
  }
```

## Credits

* [CitizenOS](https://citizenos.com) for funding the development 
