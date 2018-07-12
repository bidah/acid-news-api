const bodyParser = require("body-parser");
const app = require("express")();
const fetch = require("node-fetch");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, () => console.log("Server ready"));

const mongo = require("./mongo");

const apiUrl = 'http://hn.algolia.com/api/v1/search_by_date?query=nodejs'

let getNewsFeed = async () => {
  // setInterval(()=> {
  let jsonRes = await fetch(apiUrl).then(res => res.json());
  // })
  return jsonRes.hits;
} 

app.get("*/setData", async (req, res) => {

  let newsFeedJson    = await getNewsFeed();
  let newsFeedFromDb  = await mongo.setInitial(newsFeedJson)

  if (typeof newsFeedFromDb == "string")
    return res.json({ status: "error", msg: newsFeedFromDb });

  res.json({ status: "ok", msg: "data inserted to db", "data": newsFeedFromDb.ops });
});

app.get("*/health", (req, res) => res.sendStatus(200));

app.get("*/", (req, res) => {

})

