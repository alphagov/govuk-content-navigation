"""
Use the integration search API to figure out formats for a list of pages

Usage: USERNAME=??? PASSWORD=??? python format_finder.py
"""
import csv
import time
import requests
from os import environ
from requests.auth import HTTPBasicAuth
from helpers.path_helpers import lib_directory

HTTP_AUTH_USER = environ['HTTP_AUTH_USER']
HTTP_AUTH_PASS = environ['HTTP_AUTH_PASS']

session = requests.Session()


with open(lib_directory("python/data/content.csv")) as content_file:
    with open(lib_directory("python/data/link_formats.csv"), 'wb') as format_file:
        reader = csv.DictReader(content_file)
        writer = csv.DictWriter(format_file, fieldnames=['Link', 'Format'])

        writer.writeheader()
        for row in reader:
            base_path = row['Link']

            if environ['DATA_ENVIRONMENT'] == 'production':
                host = 'https://www.gov.uk'
            else:
                host = 'https://www-origin.staging.publishing.service.gov.uk'

            link = '{}{}'.format(host, base_path)
            print base_path

            if environ['DATA_ENVIRONMENT'] == 'production':
                url = 'https://www.gov.uk/api/search.json?filter_link={}&fields[]=format&debug=include_withdrawn'.format(base_path)
            else:
                url = 'https://www-origin.staging.publishing.service.gov.uk/api/search.json?filter_link={}&fields[]=format&debug=include_withdrawn'.format(base_path)
            response = session.get(
                url,
                auth=HTTPBasicAuth(HTTP_AUTH_USER, HTTP_AUTH_PASS)
            )
            time.sleep(0.15)

            try:
                results = response.json()['results']
            except ValueError:
                print "Could not find results for {}".format(base_path)
                results = []

            if results:
                link_format = results[0]['format']
            else:
                # Not everything is in the search index :(
                link_format = '???'

            writer.writerow({'Link': link, 'Format': link_format})
