const ObjectId = require("mongodb").ObjectID;
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = 'mongodb://localhost:27017';
var DB;

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  DB = db.db('db')
});

const count = 0;

module.exports = {

  async setInitial(news) {
    if (count) return;

    let newsNum = await DB.collection("newsFeed").count()

    if (newsNum) return Promise.resolve("already created seed data");

    return await DB.collection("newsFeed").insertMany(news)
  }
}
