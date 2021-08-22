import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { FlashNewsCollection } from '../common'

const currentFlashNewsSelector = {
  $or: [{ startsAt: null }, { startsAt: { $gte: new Date() } }],
  endsAt: { $lte: new Date() }
}

Meteor.publish({
  /**
   * Gets current flash news for the site
   */
  'freedombase:flashnews-getMain': () => {
    return FlashNewsCollection.find({ ...currentFlashNewsSelector, objectType: null })
  },
  /**
   * Gets current flash news for the given object
   * @param objectType {String}
   * @param objectId {String}
   */
  'freedombase:flashnews-getFor': (objectType: String, objectId: String) => {
    check(objectType, String)
    check(objectId, String)
    return FlashNewsCollection.find({ ...currentFlashNewsSelector, objectType, objectId })
  }
})
