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

### Importing new content

The content in the prototype comes from inventories of education pages on
GOV.UK.

There are several steps to importing new content into the prototype:

0. Tag all the content to taxons using [content
   tagger](https://github.com/alphagov/content-tagger).
0. Create a list of content base paths in CSV format, with a single column
   heading `Link`. Save this as `content.csv` in the `bin` folder.
0. From within `bin`, run `format_finder.py` to fetch format information from
   the search API.  This will save a file called `link_formats.csv`.
0. Run `fetch_main_content.py` to scrape the `main` html and store it in
   `app/content`. This uses the data from the previous step to organise the
   pages by format (the format directory is ignored by the prototype when
   rendering pages but this makes it easier to work with). See
   `failed_pages.txt` for a list of pages that encountered redirects and 404s.
0. Run `bundle exec rake` to fetch taxon and content page metadata (e.g. which
   pages link to which taxons). This will be saved in
   `app/data/metadata_and_taxons.json`.
0. Run `add_dates.py` to add date information to the fetched content, based on
   values in `metadata_and_taxons.json`.

#### Fetching Taxon Data

We fetch only the taxons we need to render the breadcrumbs of pages we have
html for, even if there are other sibling/child taxons available.

This means we don't ever render an "empty" topic page with no content
associated with it.

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
