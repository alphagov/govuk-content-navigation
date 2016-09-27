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

GdsApi.configure do |config|
  config.hash_response_for_requests = true
end
