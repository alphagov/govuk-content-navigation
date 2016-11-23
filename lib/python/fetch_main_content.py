"""
This will traverse the govuk mirror for the files listed as links in
 Alex's CSV to be used in the prototype.  It will parse the html to
 to extract the content within the main html tags and save this to the
 target directory, which should be the content prototype.

Usage:
    fetch_main_content.py
"""

from docopt import docopt
from bs4 import BeautifulSoup
from helpers.path_helpers import *

import fnmatch
import os
import csv
import re
import requests

def main():
    excluded_format = 'manual_section'
    links_and_formats = get_links_and_formats()
    failed = []

    print("*" * 100)

    print("Links and formats", links_and_formats)

    base = 'https://www-origin.staging.publishing.service.gov.uk/'
    target_directory = app_directory("content")
    for base_path, format in links_and_formats:
        url = '{}{}'.format(base, base_path)
        filePath = '{}.html'.format(re.sub('/', '_', base_path))

        res = requests.get(url, allow_redirects=False)
        if res.status_code != 200:
            failed.append('{}, code: {}\n'.format(url, res.status_code))
            continue

        soup = BeautifulSoup(res.text, 'html.parser')
        main_html = soup.main
        if format != excluded_format:
            save_file(filePath, format, main_html, target_directory)

    with open(lib_directory("python/data/failed_pages.txt", "w")) as f:
        f.writelines(failed)


def save_file(filename,
              govuk_format,
              main_html,
              target_directory):
    whitehall_formats = ['collection',
                         'consultation',
                         'detailed_guidance',
                         'document_collection',
                         'news_article',
                         'organisation',
                         'speech',
                         'statistical_data_set',
                         'publication']
    print('filename', filename)
    print('govuk_format', govuk_format)
    if govuk_format in whitehall_formats:
        print('whitehall', govuk_format)
        govuk_format = 'whitehall/{}'.format(govuk_format)
    else:
        print('not whitehall', govuk_format)

    target_directory = '{}{}'.format(target_directory, govuk_format)
    print('target directory', target_directory)
    if not os.path.exists(target_directory):
        os.makedirs(target_directory)
    target_file_path = '{}/{}'.format(target_directory, filename)
    if not os.path.isfile(target_file_path):
        print('-------------------save--------------------------')
        save_html = open(target_file_path, 'w')
        save_html.write((main_html.prettify().encode('utf8')))
        save_html.close


def save_list_of_no_matches(log_directory, not_matching):
    not_matching_formatted = []
    for match in not_matching:
        match[0] = match[0][34:]
        not_matching_formatted.append(match)
    not_matching_formatted = str(not_matching_formatted)
    filename = "no_matches.txt"
    no_matches_list = open('{}/{}'.format(log_directory, filename), 'w')
    no_matches_list.write(not_matching_formatted)
    no_matches_list.close


def list_difference(matches, no_matches):
    return [item for item in no_matches if item not in matches]


def get_links_and_formats():
    files_and_folders = []
    with open(lib_directory("python/data/link_formats.csv")) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            print('row', row)
            format_of_file = row['Format']
            print('format', format_of_file)
            link = row['Link'][19:]
            print('link', link)
            files_and_folders.append([link, format_of_file])
    csvfile.close()
    return files_and_folders


def return_matches(files_and_folders):
    matches = []
    no_matches = []
    for file_from_csv in files_and_folders:
        filePath = '{}{}{}'.format(directory, file_from_csv[0], file_from_csv[1])
        print('filePath', filePath)
        no_matches.append([filePath, file_from_csv[2]])
        for root, dirnames, filenames in os.walk('{}{}'.format(directory, file_from_csv[0])):
            for filename in fnmatch.filter(filenames, file_from_csv[1]):
                print('match', filename)
                matches.append([os.path.join(root, filename), file_from_csv[2]])
    return matches, no_matches


if __name__ == '__main__':

    arguments = docopt(__doc__)
    main()
