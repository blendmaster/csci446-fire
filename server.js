(function(){
  var http, url, fs, path, mime, redis, error, fourohfour;
  http = require('http');
  url = require('url');
  fs = require('fs');
  path = require('path');
  mime = require('mime');
  redis = require('redis');
  error = function(err, res){
    console.error(err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    return res.end("Something has gone horribly wrong!");
  };
  fourohfour = function(res){
    res.writeHead(404, {
      'Content-Type': 'text/plain'
    });
    return res.end("Resource not found");
  };
  http.createServer(function(req, res){
    var method, pathname, filename;
    method = req.method;
    pathname = url.parse(req.url).pathname;
    console.log("request " + method + " " + pathname);
    if (method === 'GET') {
      if (pathname === '/scores') {
        console.log("scores requested");
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        return res.end('scores');
      } else {
        filename = path.join('public', pathname);
        return path.exists(filename, function(exists){
          if (!exists) {
            return fourohfour(res);
          }
          return fs.stat(filename, function(err, stat){
            if (err) {
              return error(err, res);
            }
            if (stat.isDirectory()) {
              filename += 'index.html';
            }
            return fs.readFile(filename, function(err, file){
              if (err) {
                return error(err, res);
              }
              res.writeHead(200, {
                'Content-Type': mime.lookup(filename)
              });
              return res.end(file, 'binary');
            });
          });
        });
      }
    } else if (method === 'POST') {
      return fourohfour(res(pathname !== 'score' ? (console.log("scores updated"), res.writeHead(200, {
        'Content-Type': 'text/plain'
      }), res.end('scores updated')) : void 8));
    } else {
      return fourohfour(res);
    }
  }).listen(1337);
  console.log('Server started!');
}).call(this);
