const http = require('http');
const mime = require('mime-types');
const url = require('url');
const util = require('util');

const fs = require('mz/fs');
const zhuixinfan = require('./zhuixinfan');

function do_not_found(res) {
    res.writeHead(404);
    res.end();
}

const port = process.env.PORT || 8866;
console.log(`Listen to http://localhost:${port}`);

http.createServer(async function (req, res) {
    const req_obj = url.parse(req.url, true);

    let pathname = req_obj.pathname;
    if (pathname === '/') {
        pathname = '/index.html';
    } else if (pathname === '/rss') {
        let xml = '';

        try {
            xml = await zhuixinfan.get_rss_string();
        } catch (err) {
            console.error('err:', err);
            // catch error type?
        }

        if (!xml) {
            do_not_found();
            return;
        }

        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(xml, 'utf8'),
            'Content-Type': 'application/rss+xml'
        });
        res.end(xml);
        return;
    }

    src = util.format('%s%s', 'public', pathname);
    fs.readFile(src).then(function (data) {
        res.writeHead(200, {
            'Content-Length': data.length,
            'Content-Type': mime.lookup(pathname) || 'application/octet-stream',
        });
        res.end(data);
    }).catch(function(err) {
        return do_not_found(res);
    });
    
}).listen(port);