const bodyParser    = require("body-parser");
const app           = require("express")();
const fetch         = require("node-fetch");
const redis         = require('redis');
const { promisify } = require('util');
const filter        = require('./filterFeed');
const apiUrl        = 'http://hn.algolia.com/api/v1/search?query=startups'
var redisClient;

if (process.env.REDISTOGO_URL) {

  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  redisClient = redis.createClient(rtg.port, rtg.hostname);

  redisClient.auth(rtg.auth.split(":")[1]);
} else {

  redisClient = redis.createClient();
}

const redisClientGet = promisify(redisClient.get).bind(redisClient)
const redisClientSet = promisify(redisClient.set).bind(redisClient)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all("/*", function(req, res, next) {
  res.setHeader(
    "X-AUTH-TOKEN",
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, x-auth-token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  next();
});

app.listen(5000, () => console.log("Server ready"));

let handleErrors = (fn) => fn.catch((e) => {
  console.log('Promise error: ', e)
  return {
    status: 'error',
    msg: e
  }
})

redisClient.on('ready', async () => {

  console.log("redisClient --> ready");
  await setData();
  checkForNewItems(); //every hour
});

//TODO: check for new items every time we reload the home.
var checkForNewItems = () => {

  setInterval(async () => {

    let redisNewsFeed = await handleErrors(redisClientGet('news-feed'))
    let apiNewsFeed = await handleErrors(
      fetch(apiUrl)
        .then(res => res.json())
        .then(resJson => JSON.stringify(resJson))
    )

    if (apiNewsFeed != redisNewsFeed)
      setData();

  }, 3600000)
}

let getNewsFeed = async () => {

  return await handleErrors(
    fetch(apiUrl)
      .then(res => res.json())
      .then(resJson => JSON.stringify(resJson.hits))
  )
}

let setData = async () => {

  let newsFeedJson = await handleErrors(getNewsFeed());

  await handleErrors(
    redisClientSet('news-feed', newsFeedJson)
  )
  console.log('setData --> setting data again at: ', new Date)
}

// routes
app.get("*/health", (req, res) => res.sendStatus(200));

app.get("*/getData", async (req, res) => {

  let feed = await handleErrors(redisClientGet('news-feed')).then(res => JSON.parse(res))

  res.json({status: 'ok', res: filter({item: feed, byTitle: true, byUrl: true})})
})

app.get("*/item/points/:id", async ({ params: {id} } = req, res) => {

  let redisPoints = await redisClientGet(id)
  
  if (redisPoints != null)
    return res.json({status: 'ok', res: redisPoints})
  
  let points = await handleErrors(fetch('http://hn.algolia.com/api/v1/items/' + id))
    .then(res => res.json())
    .then(resJson => resJson.points)

  
  await redisClientSet(id, points, 'NX', 'EX', 300)
  redisPoints = await redisClientGet(id)
  res.json({status: 'ok', res: redisPoints})
})

// app.post("*/item/setReadLater", async ({ body: { user, itemId } } = req, res) => {
//
//   let redisUser = await redisClientGet(user)
//   if(redisUser == null)
//     await redisClientSet(user, '[]')
//
//   let userList = await redisClientGet(user)
//     .then(list => JSON.parse(list))
//     .then(listArr => [...listArr, itemId])
//     .then(listArr => JSON.stringify(listArr))
//
//   await redisClientSet(redisUser, userList)
//  
//   res.json({status: 'ok', res: 'readList has been saved'})
// })
//

console.log('process env: ', process.env.NODE_ENV)

