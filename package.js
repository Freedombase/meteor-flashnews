/* global Package */
Package.describe({
  name: 'freedombase:flashnews',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Timed flash messages for your Meteor app ',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/Freedombase/meteor-flashnews',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom('2.0')
  api.use(['ecmascript', 'typescript', 'mongo'], 'server')
  api.use(['aldeed:collection2@3.4.1', 'aldeed:schema-index@3.0.0'], 'server')
  api.mainModule('./server/index.ts', 'server')
})

Package.onTest(function (api) {
  api.use('ecmascript')
  api.use('tinytest')
  api.use('template-package')
  api.mainModule('./tests/package-tests-client.ts', 'client')
  api.mainModule('./tests/package-tests-server.ts', 'server')
})
