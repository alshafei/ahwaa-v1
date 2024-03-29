class Subscription < ActiveRecord::Base
  belongs_to :topic
  belongs_to :user

  validates_presence_of :topic_id, :user_id
  validates_uniqueness_of :topic_id, :scope => :user_id

  before_create :generate_hash_key
  after_destroy :clean_stream

  private

  def generate_hash_key
    self.hash_key = Digest::SHA1.hexdigest([topic.id, user.email].join(Time.now.to_i.to_s))
  end

  def clean_stream
    topic.stream_messages.each do |message|
      users = message.stream_users.where(:user_id => self.user_id)
      users.destroy_all
    end
  end
end
