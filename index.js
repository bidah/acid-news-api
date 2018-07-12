const bodyParser = require("body-parser");
const app = require("express")();
const fetch = require("node-fetch");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, () => console.log("Server ready"));

const mongo = require("./mongo");

// var mongo = require("./mongo");
//
const apiUrl = 'http://hn.algolia.com/api/v1/search_by_date?query=nodejs'

let getNewsFeed = async () => {
  // setInterval(()=> {
  let jsonRes = await fetch(apiUrl).then(res => res.json());
  // })
  return jsonRes;
} 

app.get("*/setData", async (req, res) => {

  let newsFeedJson = await this.getNewsFeed();

  let newsFeedFromDb  = await mongo.setInitial(newsFeedJson)

  if (typeof newsFeedFromDb == "string")
    return res.json({ status: "error", msg: res });

  // success
  res.json({ status: "ok", newsFeedFromDb });
});

app.get("*/health", (req, res) => res.sendStatus(200));

