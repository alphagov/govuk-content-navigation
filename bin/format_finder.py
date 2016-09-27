"""
Use the integration search API to figure out formats for a list of pages

Usage: USERNAME=??? PASSWORD=??? python format_finder.py
"""
import csv
import requests
from os import environ
from requests.auth import HTTPBasicAuth

INTEGRATION_USER = environ['USERNAME']
INTEGRATION_PASSWORD = environ['PASSWORD']

session = requests.Session()


def get_base_path(link):
    """
    Some links are redirects, so make a HEAD request to get the real base path.
    """
    response = session.head(link, allow_redirects=True)
    return response.url.replace('https://www.gov.uk', '')


with open('content.csv') as content_file:
    with open('link_formats.csv', 'wb') as format_file:
        reader = csv.DictReader(content_file)
        writer = csv.DictWriter(format_file, fieldnames=['Link', 'Format'])

        for row in reader:
            link = row['Link']
            base_path = get_base_path(link)
            print base_path

            url = 'http://www-origin.integration.publishing.service.gov.uk/api/search.json?filter_link={}&fields[]=format&debug=include_withdrawn'.format(base_path)
            response = session.get(
                url,
                auth=HTTPBasicAuth(INTEGRATION_USER, INTEGRATION_PASSWORD)
            )

            results = response.json()['results']
            if results:
                link_format = results[0]['format']
            else:
                # Not everything is in the search index :(
                link_format = '???'

            writer.writerow({'Link': link, 'Format': link_format})
