# GOV.UK Navigation Prototype 2016

This app serves up prototype navigation flows for the work-in-progress GOV.UK navigation.

See also the previous prototype: [https://github.com/alphagov/govuk-navigation-prototype](govuk-navigation-prototype).

## Nomenclature

- **Taxon**: a single node within the taxonomy

## Technical documentation
This is a node app built using the govuk_prototype_kit. 

The data for the prototype comes from a cached JSON file that is based on data from the content store and rummager.
You can generate this with `bundle exec rake`.

The main part of the content pages are HTML taken from the live site.

### Dependencies

- [alphagov/content-store](Content store) - provides taxon data
- [alphagov/rummager](Rummager) - provides data about pages tagged to the new taxonomy

### Running the application

Run `npm start`

Open the app at http://localhost:3000/

## Licence

[MIT License](LICENCE)
