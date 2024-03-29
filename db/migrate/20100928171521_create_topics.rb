class CreateTopics < ActiveRecord::Migration
  def self.up
    create_table :topics do |t|
      t.string :title
      t.belongs_to :user
      t.text :content
      t.integer :replies_count, :default => 0
      t.string :language, :default => 'en'
      t.integer :from_request
      t.timestamps
    end
    
    add_index :topics, :user_id
  end

  def self.down
    drop_table :topics
  end
end
