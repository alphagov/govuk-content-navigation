require 'json'
require 'pathname'
require 'pp'
require 'set'
require 'jshint'
require 'jshint/reporters'
require 'jshint/cli'
require_relative "lib/ruby/data_import"
require_relative "lib/ruby/taxonomy_builder"
require_relative "lib/ruby/taxon_document_fetcher"
require_relative "lib/ruby/content_item"

begin
  require 'rspec/core/rake_task'
  RSpec::Core::RakeTask.new(:spec)
end

METADATA_FILENAME = 'app/data/metadata_and_taxons.json'.freeze

task default: [:import_links]

task :import_links do
  taxons_for_content = {}
  all_taxons = Set.new
  documents_in_taxon = {}
  document_metadata = {}
  all_documents_in_prototype = []

  get_files.each do |base_path|
    all_documents_in_prototype << base_path
    document = ContentItem.fetch(base_path)
    document_metadata[base_path] = document.metadata
    taxons = document.taxons
    taxons_for_content[base_path] = []
    if taxons
      taxons.each do |taxon|
        all_taxons.add(taxon["base_path"])
        taxons_for_content[base_path] << taxon["base_path"]
      end
    end
  end

  puts "Working with #{all_documents_in_prototype.size} documents in prototype. Fetching taxons..."

  # Visiting descendents of each taxon
  builder = TaxonomyBuilder.new(all_taxons)
  document_fetcher = TaxonDocumentFetcher.new(all_documents_in_prototype.map { |link| "/#{link}" })

  builder.all_taxons.each do |taxon_base_path|
    content_id = builder.taxon_information.dig(taxon_base_path, "content_id")
    documents_in_taxon[taxon_base_path] = document_fetcher.fetch_for_taxon(content_id)
  end

  File.write(
    METADATA_FILENAME,
    JSON.pretty_generate(
      "taxons_for_content" => taxons_for_content,
      "ancestors_of_taxon" => builder.ancestors_of_taxons,
      "children_of_taxon" => builder.taxon_children,
      "taxon_information" => builder.taxon_information,
      "documents_in_taxon" => documents_in_taxon,
      "document_metadata" => document_metadata
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

task :lint do
  # Run the ruby linter
  sh "bundle exec govuk-lint-ruby --format clang Rakefile lib/ruby"

  # Run the JavaScript linter
  Jshint::Cli::run(:Default, nil, nil)
  fail if linter.errors.any? { |_, errors| errors.any? }
end

def get_files
  Dir.glob('app/content/**/*.html').map do |path|
    path = Pathname.new(path)
    path.sub_ext('').basename.to_s.tr('_', '/')
  end
end
