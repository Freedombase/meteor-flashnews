/* global Package */
Package.describe({
  name: 'freedombase:flashnews',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Timed and localized flash messages for your Meteor app ',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/Freedombase/meteor-flashnews',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: '../../README.md',
})

Package.onUse(function (api) {
  api.versionsFrom(['2.8.1', '3.0'])
  api.use(['ecmascript', 'typescript', 'mongo', 'ddp', 'callback-hook'])
  api.use([
    'aldeed:simple-schema@1.13.1 || 2.0.0',
    'aldeed:collection2@3.5.0 || 4.0.3',
    'aldeed:schema-deny@3.1.0 || 4.0.1',
    'socialize:base-model@1.1.7 || 2.0.0',
  ])
  api.mainModule('./common.ts', 'client')
  api.mainModule('./server/index.ts', 'server')
})
