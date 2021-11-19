import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
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
 * @return {Mongo.Cursor}
 */
Meteor.publish('freedombase:flashnews-getMain', (limit = 3) => {
  check(limit, Number)
  return FlashNewsCollection.find(
    {
      ...currentFlashNewsSelector,
      objectType: APP_NEWS
    },
    { limit }
  )
})
/**
 * Gets current flash news for the given object
 * @param objectType {String}
 * @param objectId {String}
 * @param limit {Number}
 * @returns {Mongo.Cursor}
 */
Meteor.publish(
  'freedombase:flashnews-getFor',
  (objectType: String, objectId: String, limit = 5) => {
    check(objectType, String)
    check(objectId, String)
    check(limit, Number)
    return FlashNewsCollection.find({
      ...currentFlashNewsSelector,
      objectType,
      objectId
    })
  }
)
