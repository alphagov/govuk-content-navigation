#!/usr/bin/env ruby
#Taken from https://github.com/alphagov/govuk-navigation-prototype/blob/master/bin/generate_prototype_data.rb

require 'pry'
require 'net/http'
require 'json'
require 'date'
require 'yaml'

class GeneratePrototypeData
  def run
    dataset = {}
    errors  = {}

    taxon_slugs.each do |taxon_slug|
      with_error_handling(errors, taxon_slug) do
        puts "*** Start... #{taxon_slug} ***"
        puts "> Getting taxon document from content store..."
        taxon_document = taxon_document_for(taxon_slug)

        puts "> Getting the child taxons..."
        child_taxons = child_taxons_of(taxon_slug)

        puts "> Getting tagged content items..."
        content_items = content_items_tagged_to(taxon_slug)

        puts "> Getting timestamps, format, and display_type for each content item..."
        content_items.each do |content_item|
          puts "--> Fetching updated_at & public_updated_at for #{content_item["base_path"]}"
          add_timestamps_to(content_item)

          puts "--> Fetching search data for #{content_item["base_path"]}"
          add_format_info_to(content_item)
        end
        puts "*** END #{taxon_slug} ***"
        puts

        dataset[taxon_slug] = {
          base_path:       taxon_document["base_path"],
          title:           taxon_document["title"],
          parent:          taxon_document["links"]["parent"],
          children:        child_taxons,
          tagged_content:  content_items,
        }
      end
    end

    writable_data = JSON.dump dataset
    File.open("#{File.dirname(__FILE__)}/../app/data/taxonomy-data.json", 'wb') do |file|
      file.write(writable_data)
    end

    puts
    puts "Finished. Error summary:"
    puts "🙌  None reported ️️🙌 " if errors.empty?
    errors.each do |taxon_slug, error|
      puts "#{taxon_slug}: #{error}"
    end
  end

  def with_error_handling(errors, taxon_slug)
    begin
      yield
    rescue => e
      puts ">...something broke, continuing..."
      puts
      errors[taxon_slug] = e.inspect
    end
  end

  private
  def child_taxons_of(taxon_slug)
    children_endpoint = URI "#{hostname}/api/incoming-links/alpha-taxonomy/#{taxon_slug}?types[]=parent&#{DateTime.now}"
    JSON.parse(Net::HTTP.get children_endpoint)["parent"]
  end

  def content_items_tagged_to(taxon_slug)
    content_endpoint = URI "#{hostname}/api/incoming-links/alpha-taxonomy/#{taxon_slug}?types[]=taxons"
    JSON.parse(Net::HTTP.get content_endpoint)["taxons"]
  end

  def add_timestamps_to(content_item)
    content_item_endpoint = JSON.parse(Net::HTTP.get(URI(content_item["api_url"])))
    content_item["updated_at"] = content_item_endpoint["updated_at"]
    content_item["public_updated_at"] = content_item_endpoint["public_updated_at"]
  end

  def add_format_info_to(content_item)
    search_endpoint = URI "#{hostname}/api/search.json?filter_link=#{content_item["base_path"]}"
    search_result = JSON.parse(Net::HTTP.get search_endpoint)

    if search_result["results"].first
      content_item["display_type"] = search_result["results"].first["display_type"]
      content_item["format"] = search_result["results"].first["format"]
    end
  end

  def taxon_document_for(taxon_slug)
    taxon_endpoint = URI "#{hostname}/api/content/alpha-taxonomy/#{taxon_slug}"
    JSON.parse(Net::HTTP.get taxon_endpoint)
  end

  def taxon_slugs
    @taxon_slugs ||= YAML.load_file(File.expand_path(
      "../../app/data/taxon-slugs.yaml", __FILE__
    ))["taxon_slugs"]
  end

  def hostname
    "https://www.gov.uk"
  end
end

GeneratePrototypeData.new.run