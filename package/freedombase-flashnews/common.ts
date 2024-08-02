import SimpleSchema from 'meteor/aldeed:simple-schema'
import { BaseModel } from 'meteor/socialize:base-model'
import { Hook } from 'meteor/callback-hook'
import { Match, check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import 'meteor/aldeed:collection2/dynamic'

Collection2.load()

export const APP_NEWS = 'meteorAppNews'

// TODO fix via https://github.com/peerlibrary/meteor-reactive-publish
export const currentFlashNewsSelector = (_now?: Date, language?: string) => {
  let now = _now
  if (now || Meteor.isClient) {
    const twoWeeks = 1000 * 60 * 60 * 24 * 14
    const twoWeeksAgo = new Date(new Date().getTime() - twoWeeks)

    if (Meteor.isClient && !now) now = new Date()
    return {
      startsAt: { $lte: now, $gte: twoWeeksAgo },
      $and: [
        {
          $or: [
            { endsAt: { $gte: new Date() } },
            { endsAt: null },
            { endsAt: { $exists: false } },
          ],
        },
        {
          $or: [
            { onlyDisplayOn: { $in: [language] } },
            { onlyDisplayOn: { $exists: false } },
            { onlyDisplayOn: [] },
            { onlyDisplayOn: null },
          ],
        },
      ],
    }
  }
  return {
    $or: [
      { endsAt: { $gte: new Date() } },
      { endsAt: null },
      { endsAt: { $exists: false } },
    ],
  }
}

/**
 * Sanitization function that can be set
 * @param textInput {String}
 * @returns {String}
 */
let sanitizationFunction = (textInput: string) => {
  if (!textInput) return ''
  return textInput.trim()
}

/**
 * Sets sanitization function for FlashNews input.
 * @param func {function}
 */
export const setSanitizationFunction = (func: (input: string) => string) => {
  if (typeof func === 'function') sanitizationFunction = func
}

export type FlashNewsType = {
  _id: string
  defaultLanguage: string
  createdBy: string
  createdAt: Date
  startsAt?: Date
  endsAt?: Date
  objectType?: string
  objectId?: string
  content: string | { content: object; html: string; text: string }
  onlyDisplayOn?: string[]
  getContent: (language: string) => string | object
  availableLanguages: () => string[]
}

export const FlashNewsCollection = new Mongo.Collection<FlashNewsType>(
  'freedombase:flashnews',
)

export const FlashNewsSchema = new SimpleSchema({
  content: {
    type: Object,
    blackbox: true,
    /*
     * The object looks like:
     * {
     *   en: { String | Object }
     *   cs: { String | Object }
     *   ja: { String | Object }
     * }
     **/
  },
  defaultLanguage: {
    type: String,
    defaultValue: 'en',
  },
  createdBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (this.isInsert) {
        return Meteor.userId()
      }
      return undefined
    },
    // denyUpdate: true
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date()
      }
      return this.unset()
    },
    // denyUpdate: true
  },
  startsAt: {
    type: Date,
    optional: true,
    autoValue() {
      const createdAt = this.field('createdAt')
      const startsAt = this.field('startsAt')
      if (this.isInsert && !startsAt.isSet) {
        return createdAt.value
      }
    },
  },
  endsAt: {
    type: Date,
    optional: true,
  },
  objectType: {
    type: String,
    optional: true,
    autoValue() {
      const type = this.field('objectType')
      if (this.isUpsert && !type.isSet) return APP_NEWS
    },
  },
  objectId: {
    type: String,
    optional: true,
  },
  onlyDisplayOn: {
    type: Array,
    optional: true,
  },
  'onlyDisplayOn.$': {
    type: String,
  },
})
// Attach the schema to the collection
FlashNewsCollection.attachSchema(FlashNewsSchema)

export class FlashNewsModel extends BaseModel {
  /**
   * Takes in the language you want to display the news in and returns the content given all the constraints set to it.
   * @param language {String}
   * @returns {String | Object}
   */
  getContent(language: string) {
    // If content in current language is not set in onlyDisplayOn then return null
    if (
      this.onlyDisplayOn?.length > 0 &&
      !this.onlyDisplayOn.includes(language)
    )
      return null
    // If it is set that
    const availableLanguages = this.availableLanguages()
    if (!availableLanguages.includes(language)) {
      // TODO account for similar languages and locales like cs <> sk, de-DE <> de-AU
      return this.content[this.defaultLanguage]
    }
    const content = this.content[language]
    return content || this.content[this.defaultLanguage]
  }

  /**
   * Lists all the available languages for the current news.
   * @returns {String[]}
   */
  availableLanguages() {
    return Object.keys(this.content)
  }
}

FlashNewsModel.attachCollection(FlashNewsCollection)

// Hooks for methods
export const beforeFlashNewsInsert = new Hook()
export const afterFlashNewsInsert = new Hook()

export const beforeFlashNewsDelete = new Hook()
export const afterFlashNewsDelete = new Hook()

//
// Methods to insert new flash news
//
Meteor.methods({
  /**
   * Create a new flash news
   * @param _content {Object} An object with the different locales should have format like this: { en: 'First news', cs: 'První novinka' } or instead of strings can include object with your default structure for the given language.
   * @param defaultLanguage {String} Default language of the news. This language will be used when the requested language is not available.
   * @param startsAt {Date} The starting date when the news should be displayed, by default it is the creation date.
   * @param endsAt {Date} Add a date when the news should stop being displayed, undefined by default.
   * @param objectType {String} APP_NEWS by default, but you can set here your own and in combination with objectId you can for example create custom news feed for groups.
   * @param objectId {String} Use in combination with objectType to specify a specific object under which to display the news.
   * @param onlyDisplayOn {String[]} Only display content to languages specified in this array. If the language does not match any in this array it will not show the news.
   */
  'freedombase:flashnews-create': async function (
    _content: string | { content: object; html: string; text: string },
    defaultLanguage: string,
    startsAt = new Date(),
    endsAt = undefined,
    objectType = APP_NEWS,
    objectId = undefined,
    onlyDisplayOn = undefined,
  ) {
    check(_content, Match.OneOfType(String, Object))
    check(defaultLanguage, String)
    check(startsAt, Date)
    check(endsAt, Match.Maybe(Date))
    check(objectType, Match.Maybe(String))
    check(objectId, Match.Maybe(String))
    check(onlyDisplayOn, Match.Maybe([String]))
    const userId = this.userId

    if (!userId)
      throw new Meteor.Error(403, 'User is required to create a flash news!')

    let stop = false
    let content = _content
    beforeFlashNewsInsert.forEachAsync((hook) => {
      const result = hook(
        userId,
        content,
        defaultLanguage,
        startsAt,
        endsAt,
        objectType,
        objectId,
        onlyDisplayOn,
      )
      if (!result) stop = true
    })
    if (stop) {
      throw new Meteor.Error(403, 'Unauthorized')
    }

    // Sanitize input
    if (typeof content === 'string') {
      content = sanitizationFunction(content)
    }

    const newsId = await FlashNewsCollection.insertAsync({
      createdBy: userId,
      content,
      defaultLanguage,
      startsAt,
      endsAt,
      objectType,
      objectId,
      onlyDisplayOn,
    })

    afterFlashNewsInsert.forEachAsync((hook) => {
      const insertObject = {
        _id: newsId,
        content,
        defaultLanguage,
        createdBy: userId,
        startsAt,
        endsAt,
        objectType,
        objectId,
        onlyDisplayOn,
      }
      hook(insertObject)
    })

    return newsId
  },
  /**
   * Delete the flash news
   * @param newsId {String}
   */
  'freedombase:flashnews-delete': async function (newsId: string) {
    check(newsId, String)
    const userId = this.userId
    if (!userId)
      throw new Meteor.Error(403, 'User is required to delete a flash news!')

    const news = await FlashNewsCollection.findOneAsync(
      { _id: newsId },
      {
        projection: {
          _id: 1,
          objectType: 1,
          objectId: 1,
          endsAt: 1,
          createdAt: 1,
          onlyDisplayOn: 1,
        },
      },
    )
    if (!news) throw new Meteor.Error('404', 'News not found!')

    let stop = false
    beforeFlashNewsDelete.forEachAsync((hook) => {
      const result = hook(userId, news)
      if (!result) stop = true
    })
    if (stop) {
      throw new Meteor.Error(403, 'Unauthorized')
    }

    const deleteReturn = await FlashNewsCollection.removeAsync({ _id: newsId })

    afterFlashNewsDelete.forEachAsync((hook) => {
      hook(userId, news, deleteReturn)
    })

    return deleteReturn
  },
})
