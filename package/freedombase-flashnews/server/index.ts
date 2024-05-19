import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import {
  afterFlashNewsDelete,
  afterFlashNewsInsert,
  APP_NEWS,
  beforeFlashNewsDelete,
  beforeFlashNewsInsert,
  currentFlashNewsSelector,
  FlashNewsCollection,
  FlashNewsSchema,
  setSanitizationFunction
} from '../common'

export {
  afterFlashNewsInsert,
  beforeFlashNewsInsert,
  setSanitizationFunction,
  FlashNewsSchema,
  currentFlashNewsSelector,
  APP_NEWS,
  FlashNewsCollection,
  beforeFlashNewsDelete,
  afterFlashNewsDelete
}

export type { FlashNewsType } from '../common'

/**
 * Gets current flash news for the site
 * @param limit {Number}
 * @param language {String}
 * @returns {Mongo.Cursor}
 */
Meteor.publish(
  'freedombase:flashnews-getMain',
  async function (limit = 3, language = 'en', clientTime?: Date) {
    this.unblock()
    check(limit, Match.Maybe(Number))
    check(language, Match.Maybe(String))
    check(clientTime, Match.Maybe(Date))
    return FlashNewsCollection.find(
      {
        ...currentFlashNewsSelector(clientTime, language),
        objectType: APP_NEWS
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
 * @param clientTime {Date}
 * @returns {Mongo.Cursor}
 */
Meteor.publish(
  'freedombase:flashnews-getFor',
  function (
    objectType: String,
    objectId: String,
    limit = 5,
    language = 'en',
    clientTime?: Date
  ) {
    this.unblock()
    check(objectType, String)
    check(objectId, Match.Maybe(String))
    check(limit, Match.Maybe(Number))
    check(language, Match.Maybe(String))
    check(clientTime, Match.Maybe(Date))

    return FlashNewsCollection.find(
      {
        ...currentFlashNewsSelector(clientTime, language),
        objectType,
        objectId
      },
      { limit, sort: { startsAt: -1, createdAt: -1 } }
    )
  }
)

// Indexes
FlashNewsCollection.createIndexAsync({
  objectType: 1,
  objectId: 1,
  startsAt: -1,
  endsAt: -1,
  onlyDisplayOn: 1
})
FlashNewsCollection.createIndexAsync({
  objectType: 1,
  objectId: 1,
  endsAt: -1,
  onlyDisplayOn: 1
})
FlashNewsCollection.createIndexAsync({
  objectType: 1,
  startsAt: -1,
  endsAt: -1,
  onlyDisplayOn: 1
})
