class CreateRatings < ActiveRecord::Migration
  def self.up
    create_table :ratings do |t|
      t.belongs_to :user
      t.belongs_to :reply
      t.integer :vote

      t.timestamps
    end
  end

  def self.down
    drop_table :ratings
  end
end
