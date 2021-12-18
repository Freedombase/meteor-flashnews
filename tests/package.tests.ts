/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import {
  beforeFlashNewsInsert,
  FlashNewsCollection,
  APP_NEWS
} from 'meteor/freedombase:flashnews'
import { assert, expect } from 'chai'

let userId

Meteor.methods({
  'loginUser': function() {
    this.setUserId(userId)
  }
})

describe('freedombase:flashnews', function() {
  before('Prepare', function() {
    if (Meteor.isServer) {
      FlashNewsCollection.remove({})
      Meteor.users.remove({})

      beforeFlashNewsInsert.register((userId, content, startsAt, endsAt, objectType, objectId, onlyDisplayIn, onlyDisplayOn) => {
        return !!userId
      })
    }

    const userReturn = Accounts.createUser({ username: 'test', email: 'test@meteor.io', password: 'test1234' })
    if (Meteor.isServer) {
      userId = userReturn
    } else {
      userId = Meteor.userId()
      Meteor.logout()
    }
  })

  describe('before test check', function() {
    it('userId is set', function() {
      assert.isNotNull(userId)
    })
  })
  describe('adding', function() {
    it('fail on create', function() {
      // Fail on adding without a user
      expect(Meteor.call('freedombase:flashnews-create', { en: 'fail' })).to.throw(Meteor.Error)
    })

    if (Meteor.isServer) {
      it('create', function () {
        if (Meteor.isServer) {
          Meteor.call('loginUser')
        } else {
          Meteor.loginWithPassword({ username: 'test' })
        }

        Meteor.call('freedombase:flashnews-create', { en: 'Hello universe!' }, 'en', (error, result) => {
          assert.isUndefined(error)
          assert.isDefined(result)
        })

        // Add with multiple languages
        Meteor.call('freedombase:flashnews-create', { en: 'Hello universe! 2', cs: 'Ahoj vesmire! 2' }, 'en', (error, result) => {
          assert.isUndefined(error)
          assert.isDefined(result)
        })

        // Add with onlyDisplayOn
        Meteor.call('freedombase:flashnews-create', { en: 'Hello universe! 3', cs: 'Ahoj vesmire! 3' }, 'en', new Date(), undefined, APP_NEWS, undefined, undefined, ['cs'], (error, result) => {
          assert.isUndefined(error)
          assert.isDefined(result)
        })

        // Add with onlyDisplayIn
        Meteor.call('freedombase:flashnews-create', { en: 'Hello universe! 3', cs: 'Ahoj vesmire! 3' }, 'en', new Date(), undefined, APP_NEWS, undefined, undefined, undefined, ['cs'], (error, result) => {
          assert.isUndefined(error)
          assert.isDefined(result)
        })

        Meteor.call('freedombase:flashnews-create', { en: 'Hello universe! 4', cs: 'Ahoj vesmire! 4', jp: 'Should not display' }, 'en', new Date(), undefined, APP_NEWS, undefined, undefined, undefined, ['en', 'cs'], (error, result) => {
          assert.isUndefined(error)
          assert.isDefined(result)
        })

        // Add to display in the future
        const future = new Date(new Date().setDate(new Date().getDate() + 1))
        Meteor.call('freedombase:flashnews-create', { en: 'Hello from the future!', cs: 'Ahoj z budoucnosti!' }, 'en', future, (error, result) => {
          assert.isUndefined(error)
          assert.isDefined(result)
        })

        if (Meteor.isServer) {
          const count = FlashNewsCollection.find().count()
          assert.equal(count, 6)
        }

      })
    }
  })

})
