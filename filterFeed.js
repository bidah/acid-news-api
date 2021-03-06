const uniqBy = require('lodash.uniqby');

var store;

let filterTitle = (item) => {

  store = item
    .filter(item => {
      if(!item.story_title && !item.title) return false

      return true
    })
    .map(item => {
      if(!!item.story_title) item.title = item.story_title;

      return item;
    })
}

let filterUrl = (item) => {

  store = item.map(item => {
      if(!!item.story_url) item.url = item.story_url;

      return item;
    })
}

let filterRepeated = (items) => {
  return uniqBy(items, 'title')
}

module.exports = function ({item = [], byTitle = false, byUrl = false, byRepeated = true} = {}) {

  if(byTitle) filterTitle(item);
  if(byUrl) filterUrl(item);
  if(byRepeated) filterRepeated(item);

  return store;
}


