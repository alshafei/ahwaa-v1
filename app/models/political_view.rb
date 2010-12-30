class PoliticalView < ActiveRecord::Base

  def name
    I18n.t("catalogs.political_view.#{i18n_name}")
  end

  def to_s
    name
  end

  def self.all_with_all_option
    all + [Struct.new(:id, :name).new('all', I18n.t('catalogs.options.all'))]
  end
  
end
