require_relative "lib/ruby/taxonomy_data"

begin
  require 'rspec/core/rake_task'
  RSpec::Core::RakeTask.new(:spec)
rescue LoadError
end

task default: [:taxonomy_data]

task :taxonomy_data do
  TaxonomyData.new.build
end

task :validate do
  TaxonomyData.new.validate
end

task "lint" do
  sh "bundle exec govuk-lint-ruby --format clang Rakefile lib/ruby"
end

