class Topic < ActiveRecord::Base
  acts_as_taggable

  # TODO: attr_accessible

  # include Tanker

  # tankit 'lgbt' do
  #   indexes :title
  #   indexes :content
  #   indexes :tag_list
  # end

  belongs_to :user
  has_many :replies, :dependent => :destroy, :conditions => "contextual_index IS NOT NULL"
  has_many :all_replies, :class_name => "Reply", :dependent => :destroy
  has_many :users, :through => :replies
  has_many :topic_experts, :dependent => :destroy
  has_many :experts, :through => :topic_experts
  has_many :subscriptions
  has_many :subscribers, :through => :subscriptions, :source => :user
  has_many :stream_messages, :dependent => :destroy
  has_many :visited_topics, :dependent => :destroy
  has_many :notifications

  validates :title, :presence => true
  validates :content, :presence => true
  validates :user_id, :presence => true

  before_create :generate_author_notification
  # after_save :update_tank_indexes, :if => 'Rails.env.production?'
  # after_destroy :delete_tank_indexes, :if => 'Rails.env.production?'
  after_create :ensure_topic_request_deletion, :if => "from_request.present?"

  scope :by_tags_in, lambda {|ids| where(:id => ids).limit(4).map(&:tags).flatten[0..4].map{|t| t.taggings }.flatten.uniq[0..4].map{|t| t.taggable}.uniq }
  scope :by_language, lambda { |lang| where("language = :lang", :lang => lang) }
  scope :by_replies_count, lambda { |*lang| by_language(lang.first || 'en').order("replies_count DESC") }
  scope :newest, lambda { |*lang| by_language(lang.first || 'en').order("created_at DESC") }
  scope :popular, lambda { |*lang| by_replies_count(lang.first || 'en').limit(5) }
  scope :featured, lambda { |*lang| by_language(lang.first || 'en').where(:featured => true).order("created_at DESC") }

  def topic_id
    self.id
  end

  # Check if the user already thanked the post
  def thanked_by?(user)
    result = self.notifications.where(:sender_id => user.id)
    !result.empty?
  end

  def not_blocked

  end

  # Notifies all subscribers to this topic about a new response
  def notify_subscribers_about_new_response(reply)
   subscribers.each do |user|
      user.with_user_locale do
        UserMailer.reply_notification(user.id, reply.id).deliver!
      end unless user == reply.user
    end
  end

  def notify_author_about_new_response(reply)
    user.with_user_locale do
      UserMailer.author_reply_notification(user, reply).deliver!
    end if reply.topic.should_notify_author? && user != reply.user
  end

  def should_notify_author?
    author_subscription.present?
  end

  def unsubscribe_author!
    update_attribute(:author_subscription, nil)
  end

  def recent_participants
    all_replies.map { |r| r.anonymous? ? nil : r.user }.uniq[0...9]
  end

  def subscribed?(user)
    subscribers.include?(user)
  end

  def self.per_page
    10
  end

  # Return a list of topics of interest for the user selected
  def self.of_interest_for(user)
    self.by_tags_in((user.subscriptions + user.visited_topics.limit(4)).map(&:topic_id).uniq).map(&:topic_id)
  end

  # Creates an instance from the request attributes
  def self.build_from_request(request_id)
    topic_request = TopicRequest.find_by_id(request_id)
    return new unless topic_request
    topic = new(topic_request.attributes.slice("title", "content", "language", "user_id", "original_title", "original_content"))
    topic.from_request = request_id
    topic.is_anonymous = 1 if topic_request.anonymous_post?
    topic
  end

  def author_username
    is_anonymous ? Reply.human_attribute_name(:anonymous) : user.username
  end

  # URL for the avatar of the user, or default image if anonymous
  def author_avatar
    is_anonymous ? Avatar.default.url : user.profile.avatar.url
  end

  # Finds related topics by tag
  def related_topics
    Topic.where(:language => language).tagged_with(tags.map(&:name), :any => true).reject { |t| t == self }
  end

  # Finds most active users in the topic
  def most_active_users
    ids = replies.not_anonymous.count(:user_id,
                        :group => :user_id,
                        :order => "count_user_id DESC",
                        :limit => (4 - experts.length)).keys
    User.find(ids.compact)
  end

  # Get topic users leaderboard
  def leaderboard
    (experts + most_active_users).uniq
  end

  def generate_author_notification
    self.author_subscription = Digest::SHA1.hexdigest([Time.now.to_i, rand(1000), rand(100)].join('--'))
  end

  private

  def ensure_topic_request_deletion
    TopicRequest.find_by_id(from_request).try(:destroy)
  end

end
