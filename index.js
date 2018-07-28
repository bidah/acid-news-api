const bodyParser    = require("body-parser");
const app           = require("express")();
const fetch         = require("node-fetch");
const path          = require('path');
const moment        = require('moment');
const redis         = require('redis');
const mongo         = require("./mongo");
const { promisify } = require('util');

const apiUrl        = 'http://hn.algolia.com/api/v1/search_by_date?query=nodejs'

const redisClient = redis.createClient({host : 'localhost', port : 6379});
const redisClientGet = promisify(redisClient.get).bind(redisClient)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all("/*", function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");

  next();
});

let handleErrors = (fn) => fn.catch((e) => console.log('promise error: ', e))

app.listen(3001, () => console.log("Server ready"));

redisClient.on('ready',() => {
  console.log("Redis is ready");
  setData();
});

var checkForNewItems = () => {

  setInterval(async () => {

    let redisNewsFeed = await handleErrors(redisClientGet('news-feed'))
    let apiResNewsFeed = await handleErrors(fetch(apiUrl).then(res => res.json()))

    if (JSON.stringify(jsonRes) != redisNewsFeed)
      setData();

  }, 3600000)
}

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

let setData = async () => {

  let newsFeedJson = await handleErrors(getNewsFeed());
  redisClient.set('news-feed', JSON.stringify(newsFeedJson))
  console.log('setData --> setting data again.')
}

// routes
app.get("*/health", (req, res) => res.sendStatus(200));

app.get("*/getData", async (req, res) => {
    
    let feed = await handleErrors(redisClientGet('news-feed'))
    
    res.json({status: 'ok', res: filterByTitleAndUrl(JSON.parse(feed))})
})

console.log('process env: ', process.env.NODE_ENV)

