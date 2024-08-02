import {
  APP_NEWS,
  FlashNewsCollection,
  beforeFlashNewsInsert,
} from 'meteor/freedombase:flashnews'
import { assert, expect } from 'chai'
import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'

let userId: string

// TODO migrate to async

if (Meteor.isTest) {
  Meteor.methods({
    loginUser: function () {
      console.info('Setting userId on server', userId)
      this.setUserId(userId)
    },
  })
}

describe('freedombase:flashnews', function () {
  before('Prepare', function () {
    if (Meteor.isServer) {
      FlashNewsCollection.remove({})
      Meteor.users.remove({})
    }

    beforeFlashNewsInsert.register(
      function (
        userId,
        content,
        startsAt,
        endsAt,
        objectType,
        objectId,
        onlyDisplayOn,
      ) {
        return !!userId
      },
    )

    if (Meteor.isServer) {
      userId = Accounts.createUser({
        username: 'test',
        email: 'test@meteor.io',
        password: 'test1234',
      })
    }
  })

  describe('before test check', function () {
    it('userId is set', function () {
      assert.isNotNull(userId)
    })
  })
  describe('adding', function () {
    it('fail on create', function () {
      // Fail on adding without a user
      if (Meteor.isServer) {
        expect(
          Meteor.call('freedombase:flashnews-create', { en: 'fail' }),
        ).to.throw(Meteor.Error)
      } else {
        const create1 = new Promise((resolve, reject) =>
          Meteor.call(
            'freedombase:flashnews-create',
            { en: 'fail' },
            (error, response) => {
              resolve(error)
            },
          ),
        )
        return create1.then(function (error) {
          expect(error).to.be.instanceOf(Meteor.Error)
        })
      }
    })

    it('create', function () {
      if (Meteor.isServer) {
        const method = Meteor.server.method_handlers.loginUser
        method.apply()
        expect(Meteor.userId(), 'To be logged in on server').to.be.instanceOf(
          String,
        )
      } else {
        const user = new Promise((resolve, reject) =>
          Meteor.loginWithPassword(
            { username: 'test' },
            'test1234',
            (error, response) => {
              if (error) reject()
              if (response) resolve(response)
            },
          ),
        )
        user.then(function (user) {
          expect(user, 'To be logged in on client').to.be.instanceOf(String)
          userId = user
        })
      }

      Meteor.call(
        'freedombase:flashnews-create',
        { en: 'Hello universe!' },
        'en',
        function (error, result) {
          assert.isUndefined(error)
          assert.isDefined(result)
        },
      )

      // Add with multiple languages
      Meteor.call(
        'freedombase:flashnews-create',
        { en: 'Hello universe! 2', cs: 'Ahoj vesmire! 2' },
        'en',
        function (error, result) {
          assert.isUndefined(error)
          assert.isDefined(result)
        },
      )

      // Add with onlyDisplayOn
      Meteor.call(
        'freedombase:flashnews-create',
        { en: 'Hello universe! 3', cs: 'Ahoj vesmire! 3' },
        'en',
        new Date(),
        undefined,
        APP_NEWS,
        undefined,
        ['cs'],
        function (error, result) {
          assert.isUndefined(error)
          assert.isDefined(result)
        },
      )

      // Add with onlyDisplayIn
      Meteor.call(
        'freedombase:flashnews-create',
        { en: 'Hello universe! 3', cs: 'Ahoj vesmire! 3' },
        'en',
        new Date(),
        undefined,
        APP_NEWS,
        undefined,
        undefined,
        undefined,
        ['cs'],
        function (error, result) {
          assert.isUndefined(error)
          assert.isDefined(result)
        },
      )

      Meteor.call(
        'freedombase:flashnews-create',
        {
          en: 'Hello universe! 4',
          cs: 'Ahoj vesmire! 4',
          jp: 'Should not display',
        },
        'en',
        new Date(),
        undefined,
        APP_NEWS,
        undefined,
        undefined,
        ['en', 'cs'],
        function (error, result) {
          assert.isUndefined(error)
          assert.isDefined(result)
        },
      )

      // Add to display in the future
      const future = new Date(new Date().setDate(new Date().getDate() + 1))
      Meteor.call(
        'freedombase:flashnews-create',
        { en: 'Hello from the future!', cs: 'Ahoj z budoucnosti!' },
        'en',
        future,
        function (error, result) {
          assert.isUndefined(error)
          assert.isDefined(result)
        },
      )

      if (Meteor.isServer) {
        const count = FlashNewsCollection.find().count()
        assert.equal(count, 6)
      }
    })
  })
})
