class CreateRoomUsers < ActiveRecord::Migration
  def self.up
    create_table :room_users do |t|
      t.integer :user_id
      t.integer :chat_room_id

      t.timestamps
    end
  end

  def self.down
    drop_table :room_users
  end
end
