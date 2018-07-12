// const mongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

var DB;
// const url = "mongodb://localhost:27017/db";

// mongoClient.connect(
//   url,
//   (e, db) => (e ? console.log(e) : (DB = db))
// );
//

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  DB = db.db('db')
});

const count = 0;
module.exports = {

  setInitial(news) {
    if (count) return;

    return new Promise((resolve, reject) => {
      DB.collection("newsFeed")
        .count()
        .then(num => {
          debugger;
          if (num) return resolve("already created seed data");
          DB.collection("newsFeed")
            .insertMany(news)
            .then(() => {
              DB.collection("newsFeed")
                .find()
                .toArray((e, num) => {
                  if (e) return reject(e);
                  else return resolve(num);
                });
            });
        });
    });
  }
}
