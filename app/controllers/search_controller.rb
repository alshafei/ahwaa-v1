class SearchController < ApplicationController
  skip_before_filter :authenticate_user!

  respond_to :json, :js

  def topics
    @results = if Rails.env == 'production'
      Topic.search_tank(params[:query])
    else
      Topic.where("title LIKE :input",{:input => "%#{params[:query]}%"}).paginate(:page => 1)
    end
    respond_with(@results)
  end

end
