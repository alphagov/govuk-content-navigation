"""
This will add dates to the files in content.

Usage:
    add_dates.py
"""

from docopt import docopt
from bs4 import BeautifulSoup
from helpers.path_helpers import *
import arrow
import json
import fnmatch
import os

def main():
    matches = []
    for root, dirnames, filenames in os.walk(app_directory("content/")):
        for filename in fnmatch.filter(filenames, '*.html'):
            matches.append(os.path.join(root, filename))
    for match in matches:
        content_file = match.rsplit('/')[-1]
        url = content_file.replace('_', '/')[:-5]
        if get_timestamp(url):
            timestamp = get_timestamp(url)
            add_date_to_file(match, timestamp)
            print("adding date - {}".format(match))
        else:
            print('-----not matching {}'.format(match))

def get_timestamp(url):
    with open(app_directory("data/taxonomy_data.json")) as json_metadata:
        metadata = json.load(json_metadata)
        time = metadata["document_metadata"][url]["public_updated_at"]
        timestamp = arrow.get(time).humanize()
        return timestamp


def add_date_to_file(filePath, timestamp):
    with open(filePath, 'r+') as content:
        soup = BeautifulSoup(content.read(), "html.parser")
        h1 = soup.h1
        timestamp_tag = soup.new_tag("span")
        timestamp_tag["class"] = "hack-datestamp"
        timestamp_tag.append("Last updated: {}".format(timestamp))
        h1.insert_after(timestamp_tag)
        content.seek(0)
        content.write(soup.prettify().encode('utf8'))
        content.truncate()


if __name__ == '__main__':

    arguments = docopt(__doc__)
    main()
