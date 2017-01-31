# GOV.UK Navigation Prototype 2016

This app serves up prototype navigation flows for the work-in-progress GOV.UK
navigation.

The `master` branch is deployed to https://govuk-nav-prototype.herokuapp.com/.

See also the previous prototype:
[https://github.com/alphagov/govuk-navigation-prototype](govuk-navigation-prototype).

## Nomenclature

- **Taxon**: a single node within the taxonomy

## Technical documentation

This is a node app built using the govuk_prototype_kit.

All the data for the prototype comes from a pre-built JSON file and scraped
HTML data from GOV.UK.

### Installation

We use `nvm` to manage node.js versions. Follow the steps below to install and
use it:

- Install `nvm` (`brew install nvm`)
- follow the post-install instructions for `nvm`
- go into the project directory
- run `nvm install`
- run `nvm use` to verify everything is working.

You can now install the dependencies with:

```
npm install
```

### Importing new content

The content in the prototype comes from inventories of education pages on
GOV.UK.

#### Prerequisites

  - Working installs of Python 2 and Ruby 2.
  - A Python virtual env set up for this project. See
    https://virtualenvwrapper.readthedocs.io/en/latest/


#### Instructions

Before you import new content, delete the old content from `app/content`.
Furthermore, check if the taxonomy has changed. If there are new taxons, of base
paths have changed, fetch the new taxonomy from `content-tagger` and replace
`/lib/ruby/data.taxons.csv` with it.

There are several steps to importing new content into the prototype:

0. Tag all the content to taxons using [content
   tagger](https://github.com/alphagov/content-tagger).
0. Create a list of content base paths in CSV format, with a single column
   heading `Link`. Save this as `content.csv` in the `lib/python/data` folder.
   The `taxonomy:export_base_paths` rake task in `content-tagger` can be used
   to derive a list of paths from an entire taxonomy.
0. Run `lib/data_import.sh <environment>`, where `<environment>` is either
   staging or production. This will determine where taxonomy data is retrieved
   from.
0. Enter http auth credentials when requested.

The script executes the following:

* format_finder.py
    * This will fetch format information from the search API, saving the output
      in a file called `lib/python/data/link_formats.csv`.
* fetch_main_content.py
    * Scrapes the `main` tag html of each page from the GOV.UK mirror and store
      it in `app/content`.  This uses the data from the previous step to organise
      the pages by format (the format directory is ignored by the prototype when
      rendering pages but this makes it easier to work with). See
      `failed_pages.txt` for a list of pages that encountered redirects and 404s.
* Rakefile default task
    * Fetches taxon and content page metadata (e.g. which pages link to which
      taxons). This will be saved in `app/data/metadata_and_taxons.json`.
* add_dates.py
    * Adds date information to the fetched content, based on values in
      `app/data/metadata_and_taxons.json`.

#### Fetching content lists for topic pages

This information comes from rummager. We ignore any results we don't have html
for, to avoid dead links.

#### Redirected content

When we import content we're currently skipping redirected pages.

In most cases it's fine to use the tags from the original inventory with the
page the url is redirected to, but sometimes the pages are redirected to more
generic information.

#### Checking the content

- `bundle exec rake validate` checks that all pages have taxons associated with
  them
- [linkchecker](https://github.com/wummel/linkchecker) crawls for dead links

  ```
  pip install LinkChecker
  linkchecker 'http://localhost:3000'
  ```

### Dependencies

- [Content store](https://github.com/alphagov/content-store) - provides taxon
  data
- [Rummager](https://github.com/alphagov/rummager) - provides data about pages
  tagged to the new taxonomy

### Running the application

Run `npm start`

Open the app at http://localhost:3000/

## Licence

[MIT License](LICENCE)

