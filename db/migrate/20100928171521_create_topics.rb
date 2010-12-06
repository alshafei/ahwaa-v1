class CreateTopics < ActiveRecord::Migration
  def self.up
    create_table :topics do |t|
      t.string :title
      t.belongs_to :user
      t.text :content
      t.integer :replies_count, :default => 0
      t.string :cached_slug
      t.timestamps
    end
    
    add_index :topics, :user_id
    add_index :topics, :cached_slug
  end

  def self.down
    drop_table :topics
  end
end
