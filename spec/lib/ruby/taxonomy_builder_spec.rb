require 'spec_helper'
require 'json'
require_relative '../../../lib/ruby/taxonomy_builder'

describe TaxonomyBuilder do
  context "a taxon with multiple ancestors" do
    before do
      allow(DataImport).to receive(:get_document).with("foo").and_return(
        JSON.parse('{"analytics_identifier":null,"base_path":"/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2","content_id":"904cfd73-2707-47b8-8754-5765ec5a5b68","document_type":"taxon","first_published_at":"2016-09-08T10:39:50.000+00:00","format":"taxon","locale":"en","need_ids":[],"phase":"live","public_updated_at":"2016-09-15T09:28:35.000+00:00","publishing_app":"content-tagger","rendering_app":"collections","schema_name":"taxon","title":"Primary curriculum, key stage 1 and key stage 2","updated_at":"2016-09-16T10:30:11.539Z","withdrawn_notice":{},"links":{"parent_taxons":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance","base_path":"/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance","content_id":"ff9bcd45-4dac-4e9d-a78b-0e790e24a47c","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:29:27Z","schema_name":"taxon","title":"School curriculum, assessment and performance","web_url":"https://www.gov.uk/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance","links":{"parent_taxons":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18","base_path":"/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18","content_id":"7c75c541-403f-4cb1-9b34-4ddde816a80d","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:29:44Z","schema_name":"taxon","title":"School education (5 to 18 years)","web_url":"https://www.gov.uk/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18","links":{"parent_taxons":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","base_path":"/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","content_id":"c58fdadd-7743-46d6-9629-90bb3ccc4ef0","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:36:54Z","schema_name":"taxon","title":"Education, training and skills","web_url":"https://www.gov.uk/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","links":{}}]}}]}}],"child_taxons":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/phonics","base_path":"/alpha-taxonomy/phonics","content_id":"0d76003d-76ba-4af5-a19e-31ab3f8ba689","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:26:02Z","schema_name":"taxon","title":"Phonics","web_url":"https://www.gov.uk/alpha-taxonomy/phonics","links":{"parent_taxons":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/05aefd16-99ac-4d76-87c4-54c4123b3012-early-years-curriculum-0-to-5","base_path":"/alpha-taxonomy/05aefd16-99ac-4d76-87c4-54c4123b3012-early-years-curriculum-0-to-5","content_id":"07299ca5-bc4d-48dd-a3f1-edd3b170bb4a","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:25:51Z","schema_name":"taxon","title":"Early years curriculum (0 to 5 years)","web_url":"https://www.gov.uk/alpha-taxonomy/05aefd16-99ac-4d76-87c4-54c4123b3012-early-years-curriculum-0-to-5","links":{"parent_taxons":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","base_path":"/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","content_id":"c58fdadd-7743-46d6-9629-90bb3ccc4ef0","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:36:54Z","schema_name":"taxon","title":"Education, training and skills","web_url":"https://www.gov.uk/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","links":{}}]}},{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2","base_path":"/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2","content_id":"904cfd73-2707-47b8-8754-5765ec5a5b68","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:28:35Z","schema_name":"taxon","title":"Primary curriculum, key stage 1 and key stage 2","web_url":"https://www.gov.uk/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2","links":{}}]}}],"available_translations":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2","base_path":"/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2","content_id":"904cfd73-2707-47b8-8754-5765ec5a5b68","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:28:35Z","schema_name":"taxon","title":"Primary curriculum, key stage 1 and key stage 2","web_url":"https://www.gov.uk/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2"}]},"description":"","details":{"internal_name":"primary curriculum, key stage 1 and key stage 2","notes_for_editors":""}}')
      )
      allow(DataImport).to receive(:get_document).with("/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills").and_return(
        JSON.parse('{"analytics_identifier":null,"base_path":"/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","content_id":"c58fdadd-7743-46d6-9629-90bb3ccc4ef0","document_type":"taxon","first_published_at":"2016-09-08T10:37:27.000+00:00","format":"taxon","locale":"en","need_ids":[],"phase":"live","public_updated_at":"2016-09-15T09:36:54.000+00:00","publishing_app":"content-tagger","rendering_app":"collections","schema_name":"taxon","title":"Education, training and skills","updated_at":"2016-09-20T15:46:59.042Z","withdrawn_notice":{},"links":{"child_taxons":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/05aefd16-99ac-4d76-87c4-54c4123b3012-early-years-curriculum-0-to-5","base_path":"/alpha-taxonomy/05aefd16-99ac-4d76-87c4-54c4123b3012-early-years-curriculum-0-to-5","content_id":"07299ca5-bc4d-48dd-a3f1-edd3b170bb4a","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:25:51Z","schema_name":"taxon","title":"Early years curriculum (0 to 5 years)","web_url":"https://www.gov.uk/alpha-taxonomy/05aefd16-99ac-4d76-87c4-54c4123b3012-early-years-curriculum-0-to-5","links":{"parent_taxons":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","base_path":"/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","content_id":"c58fdadd-7743-46d6-9629-90bb3ccc4ef0","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:36:54Z","schema_name":"taxon","title":"Education, training and skills","web_url":"https://www.gov.uk/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","links":{}}]}},{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18","base_path":"/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18","content_id":"7c75c541-403f-4cb1-9b34-4ddde816a80d","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:29:44Z","schema_name":"taxon","title":"School education (5 to 18 years)","web_url":"https://www.gov.uk/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18","links":{"parent_taxons":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","base_path":"/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","content_id":"c58fdadd-7743-46d6-9629-90bb3ccc4ef0","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:36:54Z","schema_name":"taxon","title":"Education, training and skills","web_url":"https://www.gov.uk/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","links":{}}]}}],"available_translations":[{"analytics_identifier":null,"api_url":"https://www.gov.uk/api/content/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","base_path":"/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills","content_id":"c58fdadd-7743-46d6-9629-90bb3ccc4ef0","description":"","document_type":"taxon","locale":"en","public_updated_at":"2016-09-15T09:36:54Z","schema_name":"taxon","title":"Education, training and skills","web_url":"https://www.gov.uk/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills"}]},"description":"","details":{"internal_name":"education, training and skills","notes_for_editors":""}}')
      )
      @builder = TaxonomyBuilder.new(%w(foo))
    end

    it "fetches all the taxon information" do
      expect(@builder.all_taxons).to eq(
        [
          "/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2",
          "/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance",
          "/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18",
          "/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills"
        ]
      )
    end

    it "captures the parent -> child relationships" do
      expect(@builder.children_for("/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills")).to eq(%w(/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18))
      expect(@builder.children_for("/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18")).to eq(%w(/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance))
      expect(@builder.children_for("/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance")).to eq(%w(/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2))
      expect(@builder.children_for("/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2")).to eq([])
    end

    it "captures the child -> parents relationships" do
      expect(@builder.ancestors_for("/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills")).to be_nil
      expect(@builder.ancestors_for("/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18")).to eq([{
        "analytics_identifier"=>nil,
        "api_url"=> "https://www.gov.uk/api/content/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
        "base_path"=> "/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
        "content_id"=>"c58fdadd-7743-46d6-9629-90bb3ccc4ef0",
        "description"=>"",
        "document_type"=>"taxon",
        "locale"=>"en",
        "public_updated_at"=>"2016-09-15T09:36:54Z",
        "schema_name"=>"taxon",
        "title"=>"Education, training and skills",
        "web_url"=> "https://www.gov.uk/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
        "links"=>{},
      }])
      expect(@builder.ancestors_for("/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance")).to eq([{
        "analytics_identifier"=>nil,
        "api_url"=>
        "https://www.gov.uk/api/content/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18",
        "base_path"=>
        "/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18",
        "content_id"=>"7c75c541-403f-4cb1-9b34-4ddde816a80d",
        "description"=>"",
        "document_type"=>"taxon",
        "locale"=>"en",
        "public_updated_at"=>"2016-09-15T09:29:44Z",
        "schema_name"=>"taxon",
        "title"=>"School education (5 to 18 years)",
        "web_url"=>
        "https://www.gov.uk/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18",
        "links"=> {"parent_taxons"=>
          [
            {"analytics_identifier"=>nil,
            "api_url"=>
            "https://www.gov.uk/api/content/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
            "base_path"=>
            "/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
            "content_id"=>"c58fdadd-7743-46d6-9629-90bb3ccc4ef0",
            "description"=>"",
            "document_type"=>"taxon",
            "locale"=>"en",
            "public_updated_at"=>"2016-09-15T09:36:54Z",
            "schema_name"=>"taxon",
            "title"=>"Education, training and skills",
            "web_url"=>
            "https://www.gov.uk/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
            "links"=>{}
          }
      ]}}])
      expect(@builder.ancestors_for("/alpha-taxonomy/6f6f5609-9075-4762-9d98-3d649a26348b-primary-curriculum-key-stage-1-and-key-stage-2")).to eq([{
         "analytics_identifier"=>nil,
         "api_url"=>
          "https://www.gov.uk/api/content/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance",
         "base_path"=>
          "/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance",
         "content_id"=>"ff9bcd45-4dac-4e9d-a78b-0e790e24a47c",
         "description"=>"",
         "document_type"=>"taxon",
         "locale"=>"en",
         "public_updated_at"=>"2016-09-15T09:29:27Z",
         "schema_name"=>"taxon",
         "title"=>"School curriculum, assessment and performance",
         "web_url"=>
          "https://www.gov.uk/alpha-taxonomy/b33a69cf-ff92-47d1-b995-44d89acda8db-curriculum-qualifications-and-school-performance",
         "links"=>
          {"parent_taxons"=>
            [{"analytics_identifier"=>nil,
              "api_url"=>
               "https://www.gov.uk/api/content/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18",
              "base_path"=>
               "/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18",
              "content_id"=>"7c75c541-403f-4cb1-9b34-4ddde816a80d",
              "description"=>"",
              "document_type"=>"taxon",
              "locale"=>"en",
              "public_updated_at"=>"2016-09-15T09:29:44Z",
              "schema_name"=>"taxon",
              "title"=>"School education (5 to 18 years)",
              "web_url"=>
               "https://www.gov.uk/alpha-taxonomy/ca860c58-665d-491d-88ed-26bf2e76fe19-school-education-5-to-18",
              "links"=>
               {"parent_taxons"=>
                 [{"analytics_identifier"=>nil,
                   "api_url"=>
                    "https://www.gov.uk/api/content/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
                   "base_path"=>
                    "/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
                   "content_id"=>"c58fdadd-7743-46d6-9629-90bb3ccc4ef0",
                   "description"=>"",
                   "document_type"=>"taxon",
                   "locale"=>"en",
                   "public_updated_at"=>"2016-09-15T09:36:54Z",
                   "schema_name"=>"taxon",
                   "title"=>"Education, training and skills",
                   "web_url"=>
                    "https://www.gov.uk/alpha-taxonomy/2b5d0d82-a099-41fc-b40b-a71f2404dcde-education-training-and-skills",
                   "links"=>{}}]}}]}}]
      )
    end
  end
end
