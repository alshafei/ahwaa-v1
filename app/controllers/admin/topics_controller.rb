class Admin::TopicsController < ApplicationController
  layout 'admin'
  before_filter :find_topic, :only => [:edit, :update, :destroy]

  def index
    @topics = Topic.paginate(:page => params[:page])
  end

  def new
    @topic = Topic.new(params[:topic])
  end

  def create
    @topic = Topic.new(params[:topic])
    @topic.save
    respond_with(@topic, :location => [:admin, :topics])
  end

  def edit
  end

  def update
    @topic.update_attributes(params[:topic])
    respond_with(@topic, :location => [:admin, :topics])
  end

  def destroy
    @topic.destroy
    respond_with(@topic, :location => [:admin, :topics])
  end

  private

  def find_topic
    @topic = Topic.find(params[:id])
  end
end
