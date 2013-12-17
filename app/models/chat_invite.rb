class ChatInvite < ActiveRecord::Base
  attr_accessible :user_id, :chat_room_id, :checked, :inviter
  validates_uniqueness_of :user_id, :scope => [:chat_room_id]
  belongs_to :user
  belongs_to :chat_room
end
