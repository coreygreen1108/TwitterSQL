'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
module.exports = function makeRouterWithSockets (io, client) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT tweets.id, name, content FROM users inner join tweets on tweets.userid = users.id', function (err, result) {
    var tweets = result.rows;
    // console.log(tweets);
    res.render('index', { title: 'Twitter.js', tweets: tweets});
  });
}

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next) {
    client.query('SELECT name, content FROM users inner join tweets on tweets.userid = users.id WHERE name=$1', [req.params.username], function (err, result) {
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
    client.query('SELECT id FROM users WHERE name=$1', [tweeter], function (err, result) {
    var tweeterID = result.rows[0].id;
    console.log(tweeterID);
    });

    
   

    // var text = req.body.text;
    // client.query('INSERT INTO tweets (userId, content) VALUES ($1, $2)', [10, 'I love SQL!'], function (err, data) {* ... 
    // });
    // //var newTweet = tweetBank.add(, req.body.text);
    // io.sockets.emit('new_tweet', newTweet);
    // res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
