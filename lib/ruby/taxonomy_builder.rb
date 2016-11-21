require_relative "data_import"

class TaxonomyBuilder
  attr_reader :taxon_base_paths
  attr_reader :taxon_information
  attr_reader :ancestors_of_taxons

  def initialize(taxon_base_paths)
    @taxon_base_paths = taxon_base_paths
    @taxon_information = {}
    @taxon_children = {}
    @ancestors_of_taxons = {}

    taxon_base_paths.each do |base_path|
      document = DataImport.get_document(base_path)
      get_parent_taxons(document)
    end
  end

  def all_taxons
    taxon_information.keys
  end

  def ancestors_for(base_path)
    ancestors_of_taxons[base_path]
  end

  def children_for(base_path)
    taxon_children[base_path]
  end

  def taxon_children
    @taxon_children.each_with_object({}) do |(k, v), o|
      o[k] = v.to_a
    end
  end

private

  def get_parent_taxons(document)
    @taxon_children[document["base_path"]] ||= Set.new
    taxon_information[document["base_path"]] =
      {
        "title" => document["title"],
        "content_id" => document["content_id"],
        "description" => document["description"]
      }
    current_parents = document.to_h.dig("links", "parent_taxons")
    unless current_parents
      page = DataImport.get_document(document.to_h['base_path'])
      current_parents = page.to_h.dig("links", "parent_taxons")
    end
    ancestors_of_taxons[document["base_path"]] = current_parents

    unless current_parents.nil?
      current_parents.each do |parent|
        @taxon_children[parent["base_path"]] ||= Set.new
        @taxon_children[parent["base_path"]] << document["base_path"]
        get_parent_taxons(parent)
      end
    end
  end
end
