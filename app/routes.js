var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var expressNunjucks = require('express-nunjucks');
var Promise = require("bluebird");
var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(fs.readFile);

var metadata = getMetadata();

router.get('/', function (req, res) {

  res.render('index');

});

router.get(/\/.+/, function (req, res) {
  var url = req.url;
  url = url.slice(1, url.length); // base path without leading slash
  var basename = url.replace(/\//g, '_');

  var content;
  directory = __dirname + '/content/';

  var globPage = glob(directory + "/**/" + basename + ".html");

  globPage.then(function (file){
    var filePath = file[0];
    return filePath;
  }).then(function(filePath) {
    readFile(filePath).then(function(data) {
      content = data.toString();
      breadcrumb = getBreadcrumb(url);
      res.render('content', { content: content, breadcrumb: breadcrumb });
    },
    function (e) {
      res.render('content', {content: 'Page not found'});
    });
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
  var taxonForPage = metadata['taxons_for_content'][page];

  if(taxonForPage.length === 0) {
    return null;
  }

  var firstTaxon = taxonForPage[0];

  taxonAncestors = [
    {
      title: metadata['taxon_information'][firstTaxon]['title'],
      basePath: firstTaxon,
    }
  ];

  taxonParents = metadata['ancestors_of_taxon'][firstTaxon];

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

module.exports = router;
