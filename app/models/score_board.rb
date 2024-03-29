class ScoreBoard < ActiveRecord::Base

  belongs_to :user
  validates_presence_of :user_id
  validates_presence_of :current_points
  validates_numericality_of :current_points

  belongs_to :level, :class_name => "Level", :foreign_key => :current_level_id
  belongs_to :badge, :class_name => "Badge", :foreign_key => :current_badge_id
  belongs_to :prize, :class_name => "Prize", :foreign_key => :current_prize_id

  before_validation :set_default_current_points, :if => "current_points.nil?"
  before_update :update_current_rewards

  private

  # callback called whenever current points is nil
  def set_default_current_points 
    self.current_points = 0
  end

  # callback that updates the rewards when the score board is updated 
  def update_current_rewards
    [Level, Badge, Prize].each do |klass|
      from, to = self.changes[:current_points]
      new_reward = klass.where(:amount_points_of_required => ((from)..(to))).order('amount_points_of_required DESC').first
      self.send("current_#{klass.to_s.underscore}_id=", new_reward.id) if new_reward
    end if self.changes.has_key?(:current_points)
  end
end
