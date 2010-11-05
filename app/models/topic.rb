class Topic < ActiveRecord::Base
  acts_as_taggable

  # TODO: attr_accessible

  include Tanker

  tankit 'lgbt' do
    indexes :title
    indexes :content
    indexes :tag_list
  end

  belongs_to :user
  has_many :replies, :dependent => :destroy, :conditions => { :parent_id => nil }
  has_many :users, :through => :replies
  has_many :topic_experts, :dependent => :destroy
  has_many :experts, :through => :topic_experts

  validates :title, :presence => true
  validates :content, :presence => true
  validates :user_id, :presence => true

  after_save :update_tank_indexes, :if => 'Rails.env.production?'
  after_destroy :delete_tank_indexes, :if => 'Rails.env.production?'

  scope :popular, order("replies_count DESC").limit(5)

  def self.per_page
    10
  end

  # Finds most active users in the topic
  def most_active_users
    ids = replies.count(:user_id,
                        :group => :user_id,
                        :order => "count_user_id DESC",
                        :limit => (4 - experts.length)).keys
    User.find(ids)
  end

  # Get topic users leaderboard
  def leaderboard
    experts + most_active_users
  end

end
