# Changelog

## Next - Unreleased

### Breaking changes

### New features

### Fixes

### Deprecated

## v0.4.0 - 2021-12-18

### Fixes

* Fixed typo in error

### New features

* Moved tests into their own testing app and re-structured the repository for this
* GitHub Actions for running test has been added

## v0.3.1 - 2021-12-01
### New features

* Added JSDocs to more functions for better documentation
* Updated README with documentation

### Fixes

* Copied `onlyDisplayOn` logic to `freedombase:flashnews-getFor` subscription

## v0.3.0 - 2021-11-25

### Fixes

* Fix a switched `$gte` and `$lte` in `currentFlashNewsSelector`

### New features

* Added `onlyDisplayIn` and `onlyDisplayOn` to the schema and updated the `getContent` method on document and publications to allow showing flashnews only in designated language or for a particular language. These are arrays to allow for multiple languages to be specified.
* Added `defaultLanguage` to `freedombase:flashnews-create` that existed previously, but now supplements `onlyDisplayIn` when the display language does not equals any of the defined languages by showing content in the default language.
* Added some initial tests

## v0.2.1 - 2021-11-24

### Fixes

* Sorting of news according to date start


## v0.2.0 - 2021-11-23

### Breaking changes & New features

* Added option to make news localized
* Now includes `socialize:base-model`

## v0.1.0 - 2021-11-19

* Initial testing release
