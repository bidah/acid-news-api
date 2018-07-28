const bodyParser  = require("body-parser");
const app         = require("express")();
const fetch       = require("node-fetch");
const path        = require('path');
const moment      = require('moment');
const redis       = require('redis');
const mongo       = require("./mongo");
const apiUrl      = 'http://hn.algolia.com/api/v1/search_by_date?query=nodejs'
const redisClient = redis.createClient({host : 'localhost', port : 6379});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all("/*", function(req, res, next) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers, x-auth-token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  next();
});

app.listen(3001, () => console.log("Server ready"));

redisClient.on('ready',() => {
 console.log("Redis is ready");
 redisClient.set('testing', JSON.stringify({one: 1}))
});

(function checkForNewItems() {
  setInterval(async ()=> {
    let jsonRes = await fetch(apiUrl).then(res => res.json());
    await mongo.setNewItems(jsonRes.hits);
  }, 3600000)
})()

let filterByTitleAndUrl = (feedArr) => {
  return filterFeedByUrl(filterFeedByTitle(feedArr));
}

let filterFeedByTitle = (feedArr) => {

  return feedArr
    .filter(item => {
      if(!item.story_title && !item.title) return false

      return true
    })
    .map(item => {
      if(!!item.story_title) item.title = item.story_title;

      return item;
    })
}

let filterFeedByUrl = (feedArr) => {

  return feedArr
    .map(item => {
      if(!!item.story_url) item.url = item.story_url;

      return item;
    })
}

let getNewsFeed = async () => {

  let jsonRes = await fetch(apiUrl).then(res => res.json());
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


let setData = () => {
  var counter = 0;
  return async function () {
    if(counter) return Promise.resolve('ok');
    let newsFeedJson    = await getNewsFeed();
    let newsFeedFromDb  = await mongo.setInitial(newsFeedJson)
    counter++
    console.log('set data only once')
  }
}

// routes
app.get("*/health", (req, res) => res.sendStatus(200));

app.get("*/setData", async (req, res) => {

  let newsFeedJson    = await getNewsFeed();
  let newsFeedFromDb  = await mongo.setInitial(newsFeedJson)

  if (typeof newsFeedFromDb == "string")
    return res.json({ status: "error", msg: newsFeedFromDb });

  res.json({ status: "ok", msg: "data inserted to db", "data": newsFeedFromDb.ops });
});

app.get("*/delete/:itemId", async (req, res) => {

    await mongo.deleteItem(req.params.itemId).catch(err => {
      console.log('error in deleteItem --> ', err)
    })

    res.redirect('/')
})

let refSetData = setData()
app.get("*/getData", async (req, res) => {
    
    await refSetData();

    let feed = await mongo.getFeed().catch(err => {
      console.log('error in getFeed --> ', err)
    });

    res.json({status: 'ok', res: filterByTitleAndUrl(feed)})
})

console.log('process env: ', process.env.NODE_ENV)

