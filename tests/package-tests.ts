import { Tinytest } from 'meteor/tinytest'
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { beforeFlashNewsInsert, afterFlashNewsInsert, FlashNewsCollection, APP_NEWS } from 'meteor/freedombase:flashnews'

if (Meteor.isServer) {
  Meteor.methods({
    'clearDB': () => {
      FlashNewsCollection.remove({})
      Meteor.users.remove({})
    }
  })
}

Tinytest.add('freedombase:flashnews - adding', function (test) {
  // afterFlashNewsInsert.register((result) => {
  //   test.isNotNull(result._id)
  // })
  beforeFlashNewsInsert.register((userId, content, startsAt, endsAt, objectType, objectId, onlyDisplayIn, onlyDisplayOn) => {
    return !!userId
  })

  if (Meteor.isClient) {
    // Clear DB
    Meteor.logout()
    Meteor.call('clearDB', () => {
      // Fail on adding without a user
      test.throws(Meteor.call('freedombase:flashnews-create', { en: 'fail' }))

      // Add with user and only one language
      Accounts.createUser({ username: 'test-user', email: 'no-reply@meteor.com', password: 'test1234' })
      const userId = Meteor.userId()
      Meteor.call('freedombase:flashnews-create', { en: 'Hello universe!' }, (error, result) => {
        test.isUndefined(error)
        test.isNotUndefined(result)
      })
      test.isNotUndefined(userId)

      // Add with multiple languages
      Meteor.call('freedombase:flashnews-create', { en: 'Hello universe! 2', cs: 'Ahoj vesmire! 2' }, (error, result) => {
        test.isUndefined(error)
        test.isNotUndefined(result)
      })

      // Add with onlyDisplayOn
      Meteor.call('freedombase:flashnews-create', { en: 'Hello universe! 3', cs: 'Ahoj vesmire! 3' }, 'en', new Date(), undefined, APP_NEWS, undefined, undefined, ['cs'], (error, result) => {
        test.isUndefined(error)
        test.isNotUndefined(result)
      })

      // Add with onlyDisplayIn
      Meteor.call('freedombase:flashnews-create', { en: 'Hello universe! 3', cs: 'Ahoj vesmire! 3' }, 'en', new Date(), undefined, APP_NEWS, undefined, undefined, undefined, ['cs'], (error, result) => {
        test.isUndefined(error)
        test.isNotUndefined(result)
      })

      Meteor.call('freedombase:flashnews-create', { en: 'Hello universe! 4', cs: 'Ahoj vesmire! 4', jp: 'Should not display' }, 'en', new Date(), undefined, APP_NEWS, undefined, undefined, undefined, ['en', 'cs'], (error, result) => {
        test.isUndefined(error)
        test.isNotUndefined(result)
      })

      // Add to display in the future
      const future = new Date(new Date().setDate(new Date().getDate() + 1))
      Meteor.call('freedombase:flashnews-create', { en: 'Hello from the future!', cs: 'Ahoj z budoucnosti!' }, 'en', future, (error, result) => {
        test.isUndefined(error)
        test.isNotUndefined(result)
      })
    })
  }
})

Tinytest.add('freedombase:flashnews - subscription & content', (test) => {
  if (Meteor.isServer) {
    const count = FlashNewsCollection.find().count()
    test.equal(count, 6)
  }
})
