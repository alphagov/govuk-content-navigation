var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var expressNunjucks = require('express-nunjucks');
var app = express();

var metadata = getMetadata();

router.get('/', function (req, res) {

  res.render('index');

});

router.get('/:url', function (req, res) {
  var url = req.params["url"];
  var content;
  directory = __dirname + '/content/';
  contentFile = url + '.html';

  formatsArray = ['answer',
                  'detailed_guidance',
                  'statistics_anouncement',
                  'transaction',
                  'whitehall/consultation',
                  'whitehall/news_article',
                  'whitehall/publication'];

  //formatsArray = getDirectories(directory);

  for (var format in formatsArray) {
    filePath = directory + formatsArray[format] + '/' + contentFile;
    if (fileExists(filePath)) {
      filename = filePath;
    }
  }

  fs.readFile(filename, function(err, data) {
    if (err) {
      throw err;
    }
    content = data.toString();
    breadcrumb = getBreadcrumb(url);

    res.render('content', { content: content, breadcrumb: breadcrumb });
  });

});


function getMetadata() {
  fs.readFile('app/data/metadata_and_taxons.json', function(err, data){
    if (err){
      console.log('Failed to read metadata and taxons.');
    }
    metadata = JSON.parse(data);
  });
}

function getBreadcrumb(page) {
  // Pick the first taxon to generate a breadcrumb from
  taxonForPage = metadata['taxons_for_content'][page][0];

  taxonAncestors = [
    {
      title: metadata['taxon_information'][taxonForPage]['title'],
      basePath: taxonForPage,
    }
  ];

  taxonParents = metadata['ancestors_of_taxon'][taxonForPage];

  while (taxonParents && taxonParents.length > 0) {
    // Pick the first parent to use in the breadcrumb
    ancestor = taxonParents[0];

    taxonAncestors.push(
      {
        title: ancestor.title,
        basePath: ancestor.base_path,
      }
    );

    taxonParents = ancestor.links.parent;
  }

  return taxonAncestors.reverse();
}

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

function fileExists(filePath) {
  try
  {
    return fs.statSync(filePath).isFile();
  }
  catch (err)
  {
    return false;
  }
}

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

// add your routes here

module.exports = router;
