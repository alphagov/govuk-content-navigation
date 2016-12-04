require_relative "./data_import"
require_relative "./taxonomy_builder"
require_relative "./taxon_document_fetcher"
require_relative "./content_item"

require 'json'
require 'pathname'
require 'pp'
require 'set'
require 'csv'

class TaxonomyData
  FILENAME = 'app/data/taxonomy_data.json'.freeze

  def build
    all_taxons = Set.new
    taxons_for_content = {}
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

    # Ensure the set of taxons includes all taxons we want present in the
    # prototype, not just the ones that have documents tagged to them.
    CSV.read("lib/ruby/data/taxons.csv", headers: true).each do |row|
      next unless row["Link"]
      all_taxons.add(row["Link"])
    end

    # Visiting descendents of each taxon
    builder = TaxonomyBuilder.new(all_taxons)
    document_fetcher = TaxonDocumentFetcher.new(all_documents_in_prototype.map { |link| "/#{link}" })

    builder.all_taxons.each do |taxon_base_path|
      content_id = builder.taxon_information.dig(taxon_base_path, "content_id")
      documents_in_taxon[taxon_base_path] = document_fetcher.fetch_for_taxon(content_id, taxon_base_path)
    end

    taxon_information = {}
    all_taxons.each do |taxon_base_path|
      document = DataImport.get_document(taxon_base_path)

      taxon_information[taxon_base_path] =
        {
          "title" => document["title"],
          "content_id" => document["content_id"],
          "description" => document["description"]
        }
    end

    taxonomy_data = {
      "taxons_for_content" => taxons_for_content,
      "ancestors_of_taxon" => builder.ancestors_of_taxon,
      "children_of_taxon"  => builder.taxon_children,
      "taxon_information"  => taxon_information,
      "documents_in_taxon" => documents_in_taxon,
      "document_metadata"  => document_metadata
    }

    File.write FILENAME, JSON.pretty_generate(taxonomy_data)
    puts "💾 > #{FILENAME}"
  end

  def validate
    data = JSON.parse(File.read(FILENAME))
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

private

  def get_files
    content_files = File.join(File.dirname(__FILE__), "../../app/content/**/*.html")
    Dir.glob(content_files).map do |path|
      path = Pathname.new(path)
      path.sub_ext('').basename.to_s.tr('_', '/')
    end
  end
end
