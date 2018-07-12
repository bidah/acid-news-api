const mongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

mongoClient.connect(
  process.env.MONGO_HOST,
  (e, db) => (e ? console.log(e) : (DB = db))
);

module.exports = {
}
