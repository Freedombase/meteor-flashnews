# Changelog

## Next - Unreleased

### Breaking changes

### New features

### Fixes

### Deprecated

## v0.7.2 - 2024-05-04

### Fixes

* Added missing dependency list of `aldeed:simple-schema`

## v0.7.1 - 2024-05-04

### Fixes

* Added missing indexes

## v0.7.0 - 2024-04-28

### Breaking changes
* Replaced `simpl-schema` with `meteor/aldeed:simple-schema`

### Fixes
* Fix common display issues
* Added version range for Meteor `3.0-rc.0`

## v0.6.1 - 2024-01-02

### Fixes
* Add `ddp` dependency which is needed for properly working with Meteor 3.0

## v0.6.0 - 2023-12-30

### Breaking changes
* Removed `aldeed:schema-index` as its functionality has been replaced by Meteor default `createIndexAsync` method.
* Minimum Meteor version is now `2.8.1`
* Added version range for Meteor `3.0-beta.0`

### New features
* Added more granular index creation to account for the default publications and methods.

## v0.5.2 - 2023-03-08

### Breaking changes
* `currentFlashNewsSelector` has been updated to function

## v0.5.1 - 2022-05-05

### Fixes

* Fixed use of `userId` instead of `createdBy` in hook object.
* Throw if user is not signed in when calling `freedombase:flashnews-create`
* Updated test app
* Add missing limit and sort to `freedombase:flashnews-getFor` publication

## v0.5 - 2022-05-04

### Breaking changes

* Removed `onlyDisplayIn` as these values can be taken from `content` and what languages are defined there. As such all the methods, hooks, etc. have this property removed.

## v0.4.1 - 2022-05-03

### New features

* `FlashNewsType` is now exported on server as well

### Fixes

* Fix type definition

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
