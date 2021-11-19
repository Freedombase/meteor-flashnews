import SimpleSchema from 'simpl-schema'
import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { Hook } from 'meteor/callback-hook'

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

export const FlashNewsSchema = new SimpleSchema({
  content: {
    type: SimpleSchema.oneOf(String, Object)
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
  }
})

FlashNewsCollection.attachSchema(FlashNewsSchema)

export const beforeFlashNewsInsert = new Hook()
export const afterFlashNewsInsert = new Hook()
//
// Methods to insert new flash news
//
Meteor.methods({
  'freedombase:flashnews-create': function (
    content,
    startsAt = new Date(),
    endsAt = undefined,
    objectType = APP_NEWS,
    objectId = undefined
  ) {
    check(content, Match.OneOf(String, Object))
    check(startsAt, Date)
    check(endsAt, Match.Optional(Date))
    check(objectType, Match.Optional(String))
    check(objectId, Match.Optional(String))
    const userId = this.userId

    let stop = false
    beforeFlashNewsInsert.forEach((hook) => {
      const result = hook(
        userId,
        content,
        startsAt,
        endsAt,
        objectType,
        objectId
      )
      if (!result) stop = true
    })
    if (stop) {
      throw new Meteor.Error('not-authorized')
    }

    // Sanitize input
    if (typeof content === 'string') {
      content = sanitizationFunction(content)
    }

    const newsId = FlashNewsCollection.insert({
      userId,
      content,
      startsAt,
      endsAt,
      objectType,
      objectId
    })

    afterFlashNewsInsert.forEach((hook) =>
      hook({
        _id: newsId,
        content,
        userId,
        startsAt,
        endsAt,
        objectType,
        objectId
      })
    )

    return newsId
  }
})
