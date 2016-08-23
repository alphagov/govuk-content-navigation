require "gds_api/content_store"
require "gds_api/config"
require 'gds_api/rummager'
require "pathname"
require 'pp'
require 'set'
require 'json'


task default: [:generate_json]

task :generate_json do
  taxons_for_content = {}
  all_taxons = Set.new
  taxon_information = {}
  ancestors_of_taxon = {}
  documents_in_taxon = {}

  get_files.each do |base_path|
    links = content_store.content_item!("/#{base_path}")["links"]
    taxons = links["taxons"] || links["alpha_taxons"]
    taxons_for_content[base_path] = []
    if taxons
      taxons.each do |taxon|
        all_taxons.add(taxon["base_path"])
        taxons_for_content[base_path] << taxon["base_path"]
        taxon_information[taxon["base_path"]] = { "title" => taxon["title"], "content_id" => taxon["content_id"] }
      end
    end
  end

  all_taxons.each do |taxon|
    links = content_store.content_item!("/#{taxon}")["links"]
    #using parent until Mo's ticket is done instead of parent_taxon
    ancestors_of_taxon[taxon] = links["parent"]
    documents_in_taxon[taxon] = get_documents_by_taxon(taxon_information[taxon]['content_id'])
  end

  #pp documents_in_taxon

  puts(
    JSON.pretty_generate(
      "taxons_for_content" => taxons_for_content,
      "ancestors_of_taxon" => ancestors_of_taxon,
      "taxon_information" => taxon_information,
      "documents_in_taxon" => documents_in_taxon
    )
  )

end

def content_store
  GdsApi::ContentStore.new('https://www.gov.uk/api')
end

def rummager
  GdsApi::Rummager.new('https://www.gov.uk/api')
end

def get_documents_by_taxon(taxon_content_id)
  rummager.search(
    filter_taxons: taxon_content_id,
    fields: %w(title description link format public_timestamp)
  ).to_h
end

def get_files
  Dir.glob('app/content/**/*.html').map do |path|
    path = Pathname.new(path)
    path.sub_ext('').basename.to_s.tr('_', '/')
  end
end

module GdsApi
  class Rummager < Base
    # Unified search
    #
    # Perform a search
    #
    # @param query [Hash] A valid search query. See Rummager documentation for options.
    #
    # @see https://github.com/alphagov/rummager/blob/master/docs/unified-search-api.md
    def search(args)
      request_url = "#{base_url}/search.json?#{Rack::Utils.build_nested_query(args)}"
      get_json!(request_url)
    end
  end
end

task "lint" do
  sh "bundle exec govuk-lint-ruby --format clang Rakefile"
end
