var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function (req, res) {

  res.render('index');

});

router.get('/content/:url', function (req, res) {
  var url = req.params["url"];
  var content;

  fs.readFile(__dirname + '/content/' + url + '.html', function(err, data) {
    if (err) {
      throw err;
    }

    content = data.toString();

    res.render('content', { content: content });
  });
});


// Example routes - feel free to delete these

// Passing data into a page

router.get('/examples/template-data', function (req, res) {

  res.render('examples/template-data', { 'name' : 'Foo' });

});

// Branching

router.get('/examples/over-18', function (req, res) {

  // get the answer from the query string (eg. ?over18=false)
  var over18 = req.query.over18;

  if (over18 == "false"){

    // redirect to the relevant page
    res.redirect("/examples/under-18");

  } else {

    // if over18 is any other value (or is missing) render the page requested
    res.render('examples/over-18');

  }

});

// add your routes here

module.exports = router;
