import SimpleSchema from 'simpl-schema'
import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const FlashNewsCollection = new Mongo.Collection('freedombase:flashnews')

export const FlashNewsSchema = new SimpleSchema({
  content: {
    type: SimpleSchema.oneOf(String, Object)
  },
  createdBy: {
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (this.isInsert) {
        return Meteor.userId();
      }
      return undefined;
    },
    denyUpdate: true,
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      }
      return undefined;
    },
    index: -1,
    denyUpdate: true,
  },
  startsAt: {
    type: Date,
    optional: true,
    index: true
  },
  endsAt: {
    type: Date,
    index: true
  },
  objectType: {
    type: String,
    optional: true,
    index: true
  },
  objectId: {
    type: String,
    optional: true,
    index: true
  }
})

FlashNewsCollection.attachSchema(FlashNewsSchema)
