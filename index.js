const bodyParser = require("body-parser");
const app        = require("express")();
const fetch      = require("node-fetch");
const path       = require('path');
const moment = require('moment');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'pug'); 

app.listen(3000, () => console.log("Server ready"));

const mongo = require("./mongo");
const apiUrl = 'http://hn.algolia.com/api/v1/search_by_date?query=nodejs'

let getNewsFeed = async () => {
  // setInterval(()=> {
  let jsonRes = await fetch(apiUrl).then(res => res.json());
  // })
  return jsonRes.hits;
}

let prettyDate = (date) => {

  return moment(date).calendar(null, {
    sameDay: 'h\:mm a',
    lastDay: '[Yesterday]',
    lastWeek: 'MMM DD',
    sameElse: 'MMM DD'
  });
}

app.get("*/setData", async (req, res) => {

  let newsFeedJson    = await getNewsFeed();
  let newsFeedFromDb  = await mongo.setInitial(newsFeedJson)

  if (typeof newsFeedFromDb == "string")
    return res.json({ status: "error", msg: newsFeedFromDb });

  res.json({ status: "ok", msg: "data inserted to db", "data": newsFeedFromDb.ops });
});

app.get("*/health", (req, res) => res.sendStatus(200));


app.get("*/", async (req, res) => {

    let feed = await mongo.getFeed();
    res.render('index', { feed, prettyDate });
})

