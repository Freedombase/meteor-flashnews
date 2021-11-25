import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import {
  APP_NEWS,
  FlashNewsCollection,
  afterFlashNewsInsert,
  beforeFlashNewsInsert,
  setSanitizationFunction,
  FlashNewsSchema,
  currentFlashNewsSelector
} from '../common'

export {
  afterFlashNewsInsert,
  beforeFlashNewsInsert,
  setSanitizationFunction,
  FlashNewsSchema,
  currentFlashNewsSelector,
  APP_NEWS,
  FlashNewsCollection
}

/**
 * Gets current flash news for the site
 * @param limit {Number}
 * @param language {String}
 * @return {Mongo.Cursor}
 */
Meteor.publish(
  'freedombase:flashnews-getMain',
  (limit = 3, language = 'en') => {
    check(limit, Match.Optional(Number))
    check(language, Match.Optional(String))
    return FlashNewsCollection.find(
      {
        ...currentFlashNewsSelector,
        objectType: APP_NEWS,
        $or: [
          { onlyDisplayOn: { $in: [language] } },
          { onlyDisplayOn: { $exists: false } }
        ]
      },
      { limit, sort: { startsAt: -1, createdAt: -1 } }
    )
  }
)
/**
 * Gets current flash news for the given object
 * @param objectType {String}
 * @param objectId {String}
 * @param limit {Number}
 * @param language {String}
 * @returns {Mongo.Cursor}
 */
Meteor.publish(
  'freedombase:flashnews-getFor',
  function (objectType: String, objectId: String, limit = 5, language = 'en') {
    check(objectType, String)
    check(objectId, String)
    check(limit, Match.Optional(Number))
    check(language, Match.Optional(String))
    return FlashNewsCollection.find({
      ...currentFlashNewsSelector,
      onlyDisplayOn: { $nin: [language] },
      objectType,
      objectId
    })
  }
)
