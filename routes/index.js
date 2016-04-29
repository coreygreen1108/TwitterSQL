'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
module.exports = function makeRouterWithSockets (io, client) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT tweets.id, name, content FROM users inner join tweets on tweets.userid = users.id ORDER BY tweets.id DESC', function (err, result) {
    var tweets = result.rows;
    // console.log(tweets);
    res.render('index', { title: 'Twitter.js', showForm: true, tweets: tweets});
  });
}

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next) {
    client.query('SELECT name, content FROM users inner join tweets on tweets.userid = users.id WHERE name=$1 ORDER BY tweets.id DESC', [req.params.username], function (err, result) {
    var tweets = result.rows;
    //console.log(tweets);
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweets,
      showForm: true,
      username: req.params.username
    });
  });
});
  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    var id = Number(req.params.id);
     client.query('SELECT name, content FROM users inner join tweets on tweets.userid = users.id WHERE tweets.id =' + id, function (err, result) {
    var tweets = result.rows;
    //console.log(tweets);
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweets // an array of only one element ;-)
      });
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var tweeter = req.body.name;
    //Get user ID from a USERS name. 
    client.query('INSERT INTO users (name) VALUES ($1) WHERE NOT EXISTS (SELECT * FROM users WHERE name = $1) RETURNING *', [tweeter], function (err, result) {
    //if(err) handle new user.
    var tweeterID = result.rows[0].id;
    var text = req.body.text;
        client.query('INSERT INTO tweets (userId, content) VALUES ($1, $2) RETURNING tweets.id', [tweeterID, text], function (err, data) {
        var newTweetID = data.rows[0].id;
        io.sockets.emit('new_tweet', {name: tweeter, id: newTweetID, text: text});
        res.redirect('/');
        });
    //console.log(tweeterID);
    });
});

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
