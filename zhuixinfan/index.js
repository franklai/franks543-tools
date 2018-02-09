const axios = require('axios');
const Parser = require('rss-parser');
const RSS = require('rss');

const sanitize_title = (input) => {
  input = input.replace(/\[[0-9+A-Z+]+\]/g, '');
  input = input.replace('&nbsp;', '');
  return input;
};

const get_rss_content = async (url, title) => {
  const parser = new Parser();
  const resp = await axios(url);

  let feed = await parser.parseString(resp.data);

  const content = feed.items[0].content;
  const pattern = new RegExp('<br />【中字版】(.*?)<br />&nbsp;种子:&nbsp;<a href="(magnet:.*?)"', 'g');

  let matched;
  const items = [];
  while ((matched = pattern.exec(content)) !== null) {
    let [dummy ,title, magnet] = matched;

    items.push({
      title: sanitize_title(title),
      url: magnet, 
    });
  }

  return {
    url: url,
    title: title,
    items: items,
  }
};

const get_magnet_only_btih = (link) => {
  const pattern = new RegExp('(magnet:?xt=urn:btih:[0-9a-f]+)');

  const matched = pattern.exec(link);
  if (matched) {
    return matched[1];
  } else {
    return '';
  }
}

const get_rss = (founds) => {
  const feed = new RSS({
    title: '追新番 magnet RSS Feed',
    feed_url: 'https://franks543-tools.azurewebsites.net/rss',
    site_url: 'https://franks543-tools.azurewebsites.net',
  });

  founds.forEach((drama) => {

    drama.items.forEach((item) => {
      feed.item({
        title: item.title,
        description: item.url,
        url: item.url,
        guid: get_magnet_only_btih(item.url),
      });
    })
  });

  return feed.xml({indent: true});
}

const get_rss_string = async () => {
  const dramas = [
    ['99.9 Season 2', 'http://www.zhuixinfan.com/main.php?mod=rss&pid=839'],
    ['BG', 'http://www.zhuixinfan.com/main.php?mod=rss&pid=843'],
    ['Unnatural', 'http://www.zhuixinfan.com/main.php?mod=rss&pid=836'],
  ];

  const founds = [];
  for (const drama of dramas) {
    const [title, link] = drama;
    let result = await get_rss_content(link, title);
    founds.push(result);
  }

  return get_rss(founds);
};

exports.get_rss_string = get_rss_string;

if (require.main === module) {
  (async () => {
    const rss = await get_rss_string();
    console.log(rss);
  })();
}

// vim: expandtab tabstop=2 shiftwidth=2
