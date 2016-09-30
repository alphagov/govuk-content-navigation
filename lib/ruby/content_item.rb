require_relative "data_import"

class ContentItem
  def self.fetch(base_path)
    ContentItem.new(DataImport.get_document(base_path))
  end

  def initialize(content_item)
    @content_item = content_item.to_h
  end

  def taxons
    content_item.dig("links", "taxons")
  end

  def metadata
    {
      "public_updated_at" => content_item["public_updated_at"],
      "organisations" => content_item.dig("links", "organisations")
    }
  end

private

  attr_reader :content_item
end
