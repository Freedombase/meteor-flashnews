# freedombase:flashnews
Timed & localized flash messages for your Meteor app.

[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
![GitHub](https://img.shields.io/github/license/Freedombase/meteor-flashnews)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Freedombase/meteor-flashnews.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Freedombase/meteor-flashnews/context:javascript) ![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/Meteor-Community-Packages/template-package?label=latest&sort=semver) [![](https://img.shields.io/badge/semver-2.0.0-success)](http://semver.org/spec/v2.0.0.html) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Getting started

### Installation
```bash
meteor add freedombase:flashnews
```

## API

### APP_NEWS
```js
import { APP_NEWS } from 'freedombase:flashnews'
```

Constant for the global category of news. When put into `objectType` of a flashnews it will then be part of the global app news set. 

### Collection
```js
import { FlashNewsCollection } from 'freedombase:flashnews'
```

You can import the collection directly like this.

### Schema
```js
import { FlashNewsSchema } from 'freedombase:flashnews'
```
You can import the schema for the collection and use it in your own custom functions for validation or other purposes.

### Hooks
```js
import { beforeFlashNewsInsert, afterFlashNewsInsert, beforeFlashNewsDelete, afterFlashNewsDelete } from 'freedombase:flashnews'
```

Using `meteor/callback-hook`, you can set these hooks to be run before and after the provided insert method.
```js
beforeFlashNewsInsert.register((
  userId,
  content,
  defaultLanguage,
  startsAt,
  endsAt,
  objectType,
  objectId,
  onlyDisplayOn) => {
  // Here check the user's credentials and return true if to proceed or false if to return unauthorized error
  return !!userId
})
```

```js
afterFlashNewsInsert.register(({
    _id: newsId,
    content,
    defaultLanguage,
    userId,
    startsAt,
    endsAt,
    objectType,
    objectId,
    onlyDisplayOn
}) => {
  // Returns the details of the inserted news.
})
```

```js
beforeFlashNewsDelete.register((userId, news) => {
  // Here check the user's credentials and return true if to proceed or false if to return unauthorized error
  return userId === news.userId
})
```

```js
afterFlashNewsDelete.register((userId, news, deleteReturn) => {
  // ...
})

```

### Methods
#### `freedombase:flashnews-create`
Create a new flash news
* @param content {Object} An object with the different locales should have format like this: { en: 'First news', cs: 'První novinka' } or instead of strings can include object with your default structure for the given language.
* @param defaultLanguage {String} Default language of the news. This language will be used when the requested language is not available.
* @param startsAt {Date} The starting date when the news should be displayed, by default it is the creation date.
* @param endsAt {Date} Add a date when the news should stop being displayed, undefined by default.
* @param objectType {String} APP_NEWS by default, but you can set here your own and in combination with objectId you can for example create custom news feed for groups.
* @param objectId {String} Use in combination with objectType to specify a specific object under which to display the news.
* @param onlyDisplayOn {String[]} Only display content to languages specified in this array. If the language does not match any in this array it will not show the news.

#### `freedombase:flashnews-delete`
Delete the flash news
* @param newsId {String} The ID of the flash news to be deleted

### Subscriptions
#### `freedombase:flashnews-getMain`
Gets current flash news for the site
* @param limit {Number} Limit for the return, defaults to 3
* @param language {String} Requested language of the news, defaults to `en`
@returns {Mongo.Cursor}

#### `freedombase:flashnews-getFor`
Gets current flash news for the given object
* @param objectType {String}
* @param objectId {String}
* @param limit {Number} Limit for the return, defaults to 5
* @param language {String} Requested language of the news, defaults to `en`
@returns {Mongo.Cursor}

### FlashNews methods
Once you retrieve the news, you can call the following methods on the document.
### `getContent`
Takes in the language you want to display the news in and returns the content given all the constraints set to it.
If the language you have requested is not available then it will use the default language, unless you have set `onlyDisplayOn`.

```js
// subscription freedombase:flashnews-getMain
const userLanguage = 'en'
const news = FlashNewsCollection.find().fetch()
const newsList = news.map((item) => {
  return item.getContent(userLanguage)
})
```

### `availableLanguages`
Lists all the available languages for the current news based on the keys in `content`.

## Contributors ✨

Thanks go to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/StorytellerCZ"><img src="https://avatars2.githubusercontent.com/u/1715235?v=4" width="100px;" alt="Jan Dvorak"/><br /><sub><b>Jan Dvorak</b></sub></a><br /><a href="https://github.com/Meteor Community Packages/template-package/commits?author=StorytellerCZ" title="Code">💻</a> <a href="https://github.com/Meteor Community Packages/template-package/commits?author=StorytellerCZ" title="Documentation">📖</a> <a href="#maintenance-StorytellerCZ" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
