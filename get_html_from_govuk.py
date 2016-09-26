"""
This will traverse the govuk mirror for the files listed as links in
 Alex's CSV to be used in the prototype.  It will parse the html to
 to extract the content within the main tags and save this to the
 target directory, which should be the content prototype.

Usage:
    get_html_files_from_mirror.py <target_directory> [<list_of_links>]
"""

from docopt import docopt
from bs4 import BeautifulSoup
import os
import csv
import re
import time
import requests
import ast


def main(target_directory, list_of_links=[]):
    if list_of_links:
        urls_and_formats = get_list(list_of_links)
    else:
        urls_and_formats = get_urls_and_formats()
    base = 'https://'
    for url, format in urls_and_formats:
        time.sleep(5)
        filePath = '{}{}'.format(base, url)
        print('filePath', filePath)
        res = requests.get(filePath)
        soup = BeautifulSoup(res.text, 'html.parser')
        main_html = soup.main
        save_file(filePath, format, main_html, target_directory, base)


def save_file(file_path,
              govuk_format,
              main_html,
              target_directory,
              base):
    base = base + "www.gov.uk/"
    whitehall_formats = ['collection',
                         'consultation',
                         'detailed_guidance',
                         'document_collection',
                         'news_article',
                         'organisation',
                         'speech',
                         'statistical_data_set',
                         'publication']
    filename = re.sub(base, '', file_path)
    filename = re.sub('/', '_', filename)
    print('filename', filename)
    print('govuk_format', govuk_format)
    if govuk_format in whitehall_formats:
        print('whitehall', govuk_format)
        govuk_format = 'whitehall/{}'.format(govuk_format)
    else:
        print('---not there')

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


def get_list(list_of_links):
    with open(list_of_links, 'r') as ins:
        for line in ins:
            array_of_links = line
    array_of_links = ast.literal_eval(array_of_links)
    return array_of_links


def get_urls_and_formats():
    urls_and_formats = []
    with open('content_for_prototype.csv') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            format_of_file = row['Format']
            link = '{}'.format(row['Link'][19:])
            folders = link.split('/')[:-1]
            folders = '/'.join(folders)
            if folders != '':
                folders = '{}/'.format(folders)
            link = link.split('/')[-1]
            urls_and_formats.append([folders, link, format_of_file])
    csvfile.close()
    return urls_and_formats


if __name__ == '__main__':

    arguments = docopt(__doc__)
    list_of_links = arguments['<list_of_links>']
    target_directory = arguments['<target_directory>']
    main(target_directory, list_of_links)
