require 'gds_api/content_store'
require 'gds_api/config'
require 'gds_api/rummager'
require_relative 'gds_api'

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
end
