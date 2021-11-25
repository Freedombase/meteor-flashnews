import SimpleSchema from 'simpl-schema'
import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { Hook } from 'meteor/callback-hook'
import { BaseModel } from 'meteor/socialize:base-model'

export const APP_NEWS = 'meteorAppNews'

export const currentFlashNewsSelector = {
  $and: [
    {
      $or: [{ startsAt: { $gte: new Date() } }, { endsAt: { $exists: false } }]
    },
    {
      $or: [
        { endsAt: { $lte: new Date() } },
        { endsAt: null },
        { endsAt: { $exists: false } }
      ]
    }
  ]
}

/**
 * Sanitization function that can be set
 * @param textInput {String}
 * @returns {String}
 */
let sanitizationFunction = (textInput: String) => {
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

export const FlashNewsCollection = new Mongo.Collection('freedombase:flashnews')

export type FlashNewsType = {
  _id: String
  defaultLanguage: String
  createdBy: String
  createdAt: Date
  startsAt?: Date
  endsAt?: Date
  objectType?: String
  objectId?: String
  content: Object
  onlyDisplayIn?: String[]
  onlyDisplayOn?: String[]
  getContent: (language: String) => String | Object
  availableLanguages: () => String[]
}

export const FlashNewsSchema = new SimpleSchema({
  content: {
    type: Object,
    blackbox: true
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
    defaultValue: 'en'
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
    denyUpdate: true
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date()
      }
      return this.unset()
    },
    denyUpdate: true
  },
  startsAt: {
    type: Date,
    optional: true,
    index: -1,
    autoValue() {
      const createdAt = this.field('createdAt')
      const startsAt = this.field('startsAt')
      if (this.isInsert && !startsAt.isSet) {
        return createdAt.value
      }
    }
  },
  endsAt: {
    type: Date,
    index: true,
    optional: true
  },
  objectType: {
    type: String,
    optional: true,
    index: true,
    autoValue() {
      const type = this.field('objectType')
      if (this.isUpsert && !type.isSet) return APP_NEWS
    }
  },
  objectId: {
    type: String,
    optional: true,
    index: true
  },
  onlyDisplayIn: {
    type: Array,
    optional: true
  },
  'onlyDisplayIn.$': {
    type: String
  },
  onlyDisplayOn: {
    type: Array,
    optional: true
  },
  'onlyDisplayOn.$': {
    type: String
  }
})
// Attach the schema to the collection
FlashNewsCollection.attachSchema(FlashNewsSchema)

export class FlashNewsModel extends BaseModel {
  getContent(language: string) {
    // If content in current language is not set in onlyDisplayOn then return null
    if (this.onlyDisplayOn && !this.onlyDisplayOn.includes(language)) return null
    // If it is set that
    if (this.onlyDisplayIn && !this.onlyDisplayIn.includes(language)) return this.content[this.defaultLanguage]
    const content = this.content[language]
    return content || this.content[this.defaultLanguage]
  }

  availableLanguages() {
    return Object.keys(this.content)
  }
}

FlashNewsModel.attachCollection(FlashNewsCollection)

// Hooks for methods
export const beforeFlashNewsInsert = new Hook()
export const afterFlashNewsInsert = new Hook()
//
// Methods to insert new flash news
//
Meteor.methods({
  'freedombase:flashnews-create': function (
    content,
    defaultLanguage,
    startsAt = new Date(),
    endsAt = undefined,
    objectType = APP_NEWS,
    objectId = undefined,
    onlyDisplayIn,
    onlyDisplayOn
  ) {
    check(content, Object)
    check(defaultLanguage, Match.Maybe(String))
    check(startsAt, Date)
    check(endsAt, Match.Maybe(Date))
    check(objectType, Match.Maybe(String))
    check(objectId, Match.Maybe(String))
    check(onlyDisplayIn, Match.Maybe([String]))
    check(onlyDisplayOn, Match.Maybe([String]))
    const userId = this.userId

    let stop = false
    beforeFlashNewsInsert.forEach((hook) => {
      const result = hook(
        userId,
        content,
        defaultLanguage,
        startsAt,
        endsAt,
        objectType,
        objectId,
        onlyDisplayIn,
        onlyDisplayOn
      )
      if (!result) stop = true
    })
    if (stop) {
      throw new Meteor.Error('not-authorized', 'Unathorized')
    }

    // Sanitize input
    if (typeof content === 'string') {
      content = sanitizationFunction(content)
    }

    const newsId = FlashNewsCollection.insert({
      userId,
      content,
      defaultLanguage,
      startsAt,
      endsAt,
      objectType,
      objectId,
      onlyDisplayIn,
      onlyDisplayOn
    })

    afterFlashNewsInsert.forEach((hook) => {
      const insertObject = {
        _id: newsId,
        content,
        defaultLanguage,
        userId,
        startsAt,
        endsAt,
        objectType,
        objectId,
        onlyDisplayIn,
        onlyDisplayOn
      }
      hook(insertObject)
    })

    return newsId
  }
})
