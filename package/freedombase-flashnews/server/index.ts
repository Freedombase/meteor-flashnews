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

export type { FlashNewsType } from '../common'

// Indexes creation
FlashNewsCollection.createIndexAsync({ objectType: 1, endsAt: -1, onlyDisplayOn: 1 })
FlashNewsCollection.createIndexAsync({ objectType: 1, startsAt: -1, endsAt: -1, onlyDisplayOn: 1 })
FlashNewsCollection.createIndexAsync({ objectId: 1, objectType: 1, endsAt: -1, onlyDisplayOn: 1 })
FlashNewsCollection.createIndexAsync({ objectId: 1, objectType: 1, startsAt: -1, endsAt: -1, onlyDisplayOn: 1 })
FlashNewsCollection.createIndexAsync({ objectId: 1, objectType: 1 })

/**
 * Gets current flash news for the site
 * @param limit {Number}
 * @param language {String}
 * @returns {Mongo.Cursor}
 */
Meteor.publish(
  'freedombase:flashnews-getMain',
  async (limit = 3, language = 'en', clientTime?: Date) => {
    check(limit, Match.Maybe(Number))
    check(language, Match.Maybe(String))
    check(clientTime, Match.Maybe(Date))
    return FlashNewsCollection.find(
      {
        objectType: APP_NEWS,
        ...currentFlashNewsSelector(clientTime),
        $or: [
          { onlyDisplayOn: { $in: [language] } },
          { onlyDisplayOn: { $exists: false } },
          { onlyDisplayOn: null }
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
 * @param clientTime {Date}
 * @returns {Mongo.Cursor}
 */
Meteor.publish(
  'freedombase:flashnews-getFor',
  (
    objectType: String,
    objectId: String,
    limit = 5,
    language = 'en',
    clientTime?: Date
  ) => {
    check(objectType, String)
    check(objectId, Match.Maybe(String))
    check(limit, Match.Maybe(Number))
    check(language, Match.Maybe(String))
    check(clientTime, Match.Maybe(Date))
    return FlashNewsCollection.find(
      {
        objectId,
        objectType,
        ...currentFlashNewsSelector(clientTime),
        $or: [
          { onlyDisplayOn: { $in: [language] } },
          { onlyDisplayOn: { $exists: false } },
          { onlyDisplayOn: null }
        ]
      },
      { limit, sort: { startsAt: -1, createdAt: -1 } }
    )
  }
)
