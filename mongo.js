const ObjectId = require("mongodb").ObjectID;
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var URL = 'mongodb://localhost:27017';
var DB;

MongoClient.connect(URL, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  DB = db.db('db').collection("newsFeed")
});

const COUNT = 0;

module.exports = {

  async setInitial(news) {
    if (COUNT) return;

    let newsNum = await DB.count()

    if (newsNum) return Promise.resolve("already created seed data");

    return await DB.insertMany(news)
  },

  getFeed() {
    return DB.find({}).toArray()
  },

  deleteItem(itemId) {

    return DB.updateOne(
      { _id: ObjectId(itemId) },
      { $set: { "userHasDeletedItem": true } }
    );
  }
}
