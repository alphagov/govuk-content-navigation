class TaxonDocumentFetcher
  attr_reader :all_documents

  def initialize(all_documents)
    @all_documents = Set.new(all_documents)
  end

  def fetch_for_taxon(taxon_content_id, taxon_base_path)
    response = GdsApi.with_retries(maximum_number_of_attempts: 2) do
      DataImport.rummager.search(
        filter_taxons: taxon_content_id,
        fields: %w(title description link format public_timestamp),
        count: 1000
      ).to_h
    end

    before_size = response["results"].size

    response = filter_response(response)

    after_size = response["results"].size
    puts "filtered out #{before_size - after_size} results for #{taxon_base_path}"

    response
  end

private

  def filter_response(response)
    response["results"] = response["results"].select { |result| all_documents.include? result["link"] }
    response
  end
end
