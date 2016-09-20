require "gds_api/content_store"
require "gds_api/config"
require 'gds_api/rummager'

module DataImport
  def self.content_store
    GdsApi::ContentStore.new('https://www-origin.staging.publishing.service.gov.uk/api')
  end

  def self.rummager
    GdsApi::Rummager.new('https://www-origin.staging.publishing.service.gov.uk/api')
  end

  def self.get_document(base_path)
    GdsApi.with_retries(maximum_number_of_attempts: 2) do
      true_base_path = find_redirects(base_path)
      puts "Processing #{base_path}"
      puts "(Redirected to #{true_base_path})" if true_base_path != base_path
      content_store.content_item!("/#{true_base_path}")
    end
  end

  def self.get_documents_by_taxon(taxon_content_id)
    GdsApi.with_retries(maximum_number_of_attempts: 2) do
      rummager.search(
        filter_taxons: taxon_content_id,
        fields: %w(title description link format public_timestamp),
        count: 1000
      ).to_h
    end
  end

  # Some of our source data has been redirected - in this case,
  # we just follow the redirects when fetching link data from the API so
  # that our content still has tags. We can remove the old content later.
  def self.find_redirects(base_path)
    http = Net::HTTP.new('www-origin.staging.publishing.service.gov.uk', 443)
    http.use_ssl = true
    response = http.request_head("/#{base_path}")

    if response.is_a?(Net::HTTPRedirection)
      find_redirects(response.fetch('Location').gsub(/^(https:\/\/.*\.gov\.uk)?\//, ""))
    else
      base_path
    end
  end

  class TaxonomyFetcher
    attr_reader :children_for_taxons

    def initialize(seed_taxons)
      @unprocessed = seed_taxons.to_a
      @children_for_taxons = {}
    end

    def fetch
      while (taxon = unprocessed.pop)
        children = fetch_children(taxon)
        set_children(taxon, children)
        children.each do |child_taxon|
          if unseen?(child_taxon)
            unprocessed << child_taxon
          end
        end
      end

      children_for_taxons
    end

  private

    attr_reader :taxons
    attr_reader :unprocessed

    def fetch_children(taxon)
      children = GdsApi.with_retries(maximum_number_of_attempts: 2) do
        DataImport.content_store.content_item!(taxon).dig("links", "child_taxons") || []
      end

      children.map { |child| child["base_path"] }
    end

    def set_children(taxon, children)
      children_for_taxons[taxon] = children
    end

    def unseen?(taxon)
      children_for_taxons[taxon].nil?
    end
  end
end

module GdsApi
  def self.with_retries(maximum_number_of_attempts:)
    attempts = 0
    begin
      attempts += 1
      yield
    rescue Timeout::Error, GdsApi::TimedOutException => e
      raise e if attempts >= maximum_number_of_attempts
      sleep sleep_time_after_attempt(attempts)
      retry
    end
  end

  # If attempt 1 fails, it will wait 0.03 seconds before trying again
  # If attempt 2 fails, it will wait 0.09 seconds before trying again
  # If attempt 3 fails, it will wait 0.27 seconds before trying again
  # If attempt 4 fails, it will wait 0.81 seconds before trying again
  # If attempt 5 fails, it will wait 2.43 seconds before trying again
  # If attempt 6 fails, it will wait 7.29 seconds before trying again
  def self.sleep_time_after_attempt(current_attempt)
    (3.0**current_attempt) / 100
  end
end
