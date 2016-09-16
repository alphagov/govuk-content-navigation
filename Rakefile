require_relative "lib/ruby/data_import"
require "pathname"
require 'pp'
require 'set'
require 'json'

METADATA_FILENAME = 'app/data/metadata_and_taxons.json'.freeze

task default: [:import_links]

task :import_links do
  taxons_for_content = {}
  all_taxons = Set.new
  taxon_information = {}
  ancestors_of_taxon = {}
  documents_in_taxon = {}

  get_files.each do |base_path|
    links = DataImport.get_document(base_path)["links"]
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
    puts "Processing #{taxon}"
    links = DataImport.get_document("/#{taxon}")["links"]
    ancestors_of_taxon[taxon] = links["parent_taxons"]
    documents_in_taxon[taxon] = DataImport.get_documents_by_taxon(taxon_information[taxon]['content_id'])
  end

  children_of_taxon = DataImport::TaxonomyFetcher.new(all_taxons).fetch

  File.write(
    METADATA_FILENAME,
    JSON.pretty_generate(
      "taxons_for_content" => taxons_for_content,
      "ancestors_of_taxon" => ancestors_of_taxon,
      "children_of_taxon" => children_of_taxon,
      "taxon_information" => taxon_information,
      "documents_in_taxon" => documents_in_taxon
    )
  )

  puts "💾 > #{METADATA_FILENAME}"
end

task :validate do
  data = JSON.parse(File.read(METADATA_FILENAME))
  missing_taxons = data['taxons_for_content'].select { |_base_path, taxons| taxons.empty? }.keys
  unless missing_taxons.empty?
    puts "Pages with missing taxons:"
    missing_taxons.each { |base_path| puts "\t#{base_path}\n\t\t = #{DataImport.find_redirects(base_path)}\n" }
    puts ""
  end

  orphaned_taxons = data['ancestors_of_taxon'].select { |_taxon, ancestors| ancestors.nil? || ancestors.empty? }.keys
  unless orphaned_taxons.empty?
    puts "Taxons with no ancestors:"
    orphaned_taxons.each { |taxon| puts "\t#{taxon}" }
    puts ""
  end
end

task "lint" do
  sh "bundle exec govuk-lint-ruby --format clang Rakefile lib/ruby"
end

def get_files
  Dir.glob('app/content/**/*.html').map do |path|
    path = Pathname.new(path)
    path.sub_ext('').basename.to_s.tr('_', '/')
  end
end
