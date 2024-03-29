require 'spec_helper'

describe TopicRequestsController do

  it "should deny access to non signed in users" do
    get :new
    response.should be_redirect
  end

  context "a regular user" do

    before(:each) do
      @user = Factory(:user)
      sign_in @user
    end

    it "should be able to create a new topic request" do
      get :new
      assigns(:topic_request).new_record?.should be_true
      response.should_not be_redirect
    end

    it "should be able to create a topic request assigned to current user" do
      post :create, :topic_request => {
        :title => 'title',
        :content => 'content',
        :anonymous_post => false
      }
      response.should redirect_to('/')

      TopicRequest.last.user.should == @user
      TopicRequest.last.votes.should == 1
    end

    it "notifies admins about the topic request" do
      User.should_receive(:notify_about_topic_request!)
      post :create, :topic_request => {
        :title => 'title',
        :content => 'content',
        :anonymous_post => false
      }
    end

  end
end
