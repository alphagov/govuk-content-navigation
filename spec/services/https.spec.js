"use strict";

var nock = require('nock');
var https = require('../../app/services/https');

describe('https', function () {
  it('can GET JSON', function (done) {
    nock('https://example.gov.uk')
      .get('/json')
      .reply(200, {
        foo: 'bar'
      });

    https.get({
      host: 'example.gov.uk',
      path: '/json'
    })
      .then(function (response) {
        expect(response).toEqual({
          foo: 'bar'
        });
      })
      .then(done);
  });

  it('fails gracefully when response is not JSON', function (done) {
    nock('https://example.gov.uk')
      .get('/not-json')
      .reply(200, 'foo');

    https.get({
      host: 'example.gov.uk',
      path: '/not-json'
    })
      .then(function () {
        // We shouldn't get here
        fail();
      })
      .catch(function (error) {
        expect(error).toMatch(/Could not parse response as JSON/);
      })
      .then(done);
  });

  it('fails gracefully when response is non-2XX', function (done) {
    nock('https://example.gov.uk')
      .get('/not-found')
      .reply(404);

    https.get({
      host: 'example.gov.uk',
      path: '/not-found'
    })
      .then(function () {
        // We shouldn't get here
        fail();
      })
      .catch(function (error) {
        expect(error).toMatch(/404/);
      })
      .then(done);
  });
});
