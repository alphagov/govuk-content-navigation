require "gds_api/content_store"
require "gds_api/config"
require "pathname"
require 'pp'
require 'set'
require 'json'

task :default => [:generate_json]

task :generate_json do
  taxons_for_content = {}
  all_taxons = Set.new
  taxon_information = {}
  ancestors_of_taxon = {}
  #content_for_taxons = {}
  #puts content_store.content_item!('/complain-ofsted-report').to_h
  get_files.each do |base_path|
    links = content_store.content_item!("/#{base_path}")["links"]
    taxons = links["taxons"] || links["alpha_taxons"]
    taxons_for_content[base_path] = []
    if taxons
      taxons.each do |taxon|
        all_taxons.add(taxon["base_path"])
        taxons_for_content[base_path] << taxon["base_path"]
        taxon_information[taxon["base_path"]] = {"title" => taxon["title"], "content_id" => taxon["content_id"]}
      end
    end
  end

  all_taxons.each do |taxon|
    links = content_store.content_item!("/#{taxon}")["links"]
    #using parent until Mo's ticket is done instead of parent_taxon
    ancestors_of_taxon[taxon] = links["parent"]
  end

  puts(
    JSON.pretty_generate(
      {
        "taxons_for_content" => taxons_for_content,
        "ancestors_of_taxon" => ancestors_of_taxon,
        "taxon_information" => taxon_information
      }
    )
  )
  #pp taxons_for_content


end

def content_store
    GdsApi::ContentStore.new('https://www.gov.uk/api')
end

def get_files
    Dir.glob('app/content/**/*.html').map do |path|
        path = Pathname.new(path)
        slug = path.sub_ext('').basename.to_s.gsub('_', '/')
    end
end