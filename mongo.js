const mongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

var DB;
const url = "mongodb://localhost:27017";

mongoClient.connect(
  url,
  (e, db) => (e ? console.log(e) : (DB = db))
);

const count = 0;
module.exports = {

  setInitial(news) {
    if (count) return;

    return new Promise((resolve, reject) => {
      DB.collection("newsFeed")
        .count()
        .then(num => {
          if (num) return resolve("already created seed data");

          DB.collection("newsFeed")
            .insertMany(JSON.parse(news))
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
