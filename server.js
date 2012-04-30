(function(){
  var http, url, fs, path, mime, redis, error, fourohfour, that, u, db;
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
  try {
    if (that = process.env.REDISTOGO_URL) {
      u = url.parse(that);
    }
    db = redis.createClient(u.port, u ? u.protocol + "//" + u.auth + "@" + u.hostname : void 8);
    db.on('error', function(it){
      return console.error(it);
    });
  } catch (e) {
    console.log("couldn't connect to redis!");
    console.log(e.message);
    process.exit(1);
  }
  db.get('scores', function(err, scores){
    if (err) {
      console.error("couldn't fetch scores!");
      process.exit(1);
    }
    if (scores == null) {
      console.log("bootstrapping high scores");
      return db.set('scores', [
        {
          name: 'mario',
          score: 384
        }, {
          name: 'luigi',
          score: 253
        }, {
          name: 'wario',
          score: 231
        }, {
          name: 'bowser',
          score: 133
        }, {
          name: 'toad',
          score: 27
        }
      ], function(err, reply){
        if (err) {
          console.error("couldn't bootstrap scores!");
          return process.exit(1);
        }
      });
    }
  });
  http.createServer(function(req, res){
    var method, pathname, filename, content;
    method = req.method;
    pathname = url.parse(req.url).pathname;
    if (method === 'GET') {
      if (pathname === '/scores') {
        return db.get('scores', function(err, scores){
          if (err) {
            return error(err, res);
          }
          res.writeHead(200, {
            'Content-Type': 'application/json'
          });
          return res.end(scores);
        });
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
    } else if (method === 'POST' && pathname === 'score') {
      req.setEncoding('utf8');
      content = '';
      req.addListener('data', function(it){
        return content += it;
      });
      return req.addListener('end', function(){
        var scores;
        try {
          scores = JSON.parse(content);
        } catch (e) {
          return error(e, res);
        }
        return db.set('scores', JSON.stringify(scores), function(err, reply){
          if (err) {
            return error(err, res);
          }
          res.writeHead(200, {
            'Content-Type': 'text/plain'
          });
          return res.end('scores updated');
        });
      });
    } else {
      return fourohfour(res);
    }
  }).listen(process.env.PORT || 1337);
  console.log('Server started!');
}).call(this);
