/* global Package */
Package.describe({
  name: 'freedombase:flashnews',
  version: '0.6.0',
  // Brief, one-line summary of the package.
  summary: 'Timed and localized flash messages for your Meteor app ',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/Freedombase/meteor-flashnews',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: '../../README.md'
})

Package.onUse(function (api) {
  api.versionsFrom(['2.8.1', '3.0-beta.0'])
  api.use(['ecmascript', 'typescript', 'mongo', 'callback-hook'])
  api.use([
    'aldeed:collection2@4.0.0-beta.6',
    'socialize:base-model@1.1.7'
  ])
  api.mainModule('common.ts', 'client')
  api.mainModule('./server/index.ts', 'server')
})
