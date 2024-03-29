class ApplicationController < ActionController::Base
  include UrlHelper
  self.responder = ApplicationResponder
  respond_to :html

  before_filter :authenticate_user!
  before_filter :set_locale
  #before_filter :secure_with_ssl
  before_filter :hall_of_fame
  helper_method :current_user, :logged_in?, :rtl?

  rescue_from ActiveRecord::RecordNotFound, :with => :record_not_found

  protect_from_forgery

  # Wether there's a user logged in
  def logged_in?
    !current_user.nil?
  end

  def subdomain_present?
    request.subdomain.present? && request.subdomain != "www"
  end

  # Retrieves current logged in user from the session
  def current_user
    @current_user ||= User.find_by_id(session[:current_user])
  end

  protected

  def sign_out_current_user
    session[:current_user] = @current_user = nil
  end

  def rtl?
    I18n.locale.to_s == 'ar'
  end

  # Include selected locale in links
  # def default_url_options(options = {})
  #   {:locale => I18n.locale}
  # end

  private

  def hall_of_fame
    @fame_helpful = Rating.select('reply_id, user_id, sum(vote) as sum_vote').joins(:user).where("user_id <> 1 AND users.deleted = false").order('sum_vote desc').group(:reply_id).limit(1).first.try(:reply).try(:user)
    @fame_active = Reply.select('user_id, count(user_id) as replies_count').joins(:user).where("user_id <> 1 AND users.deleted = false").group(:user_id).order('replies_count desc').limit(1).first.try(:user)
    @fame_topics = Topic.select('user_id, count(user_id) as topics_count').joins(:user).where("user_id <> 1 AND users.deleted = false").group(:user_id).order('topics_count desc').limit(1).first.try(:user)
    @fame_points = ScoreBoard.select('user_id').joins(:user).where("user_id <> 1 AND users.deleted = false").order("current_points DESC").limit(1).first.try(:user)
  end

  def record_not_found
    render :file => "#{Rails.root}/public/404.#{I18n.locale}.html", :layout => false
  end

   def secure_with_ssl
      if subdomain_present? && request.subdomain == 'www'
         redirect_to :protocol => 'https'
       elsif !subdomain_present?
        redirect_to :protocol => 'https'
      end
    end

  # [Callback] sets locale or in the locale param or defaults to en
  def set_locale
    locale = request.subdomains.first
    locale = (logged_in? ?
              current_user.profile.language :
              browser_language) if locale.blank? || !I18n.available_locales.include?(locale.to_sym)
    I18n.locale = locale
  end

  def browser_language
    request.env['HTTP_ACCEPT_LANGUAGE'] =~ /ar/i ? 'ar' : 'en'
  end

  def emoticons(text)
    text.gsub!("o:)", "<img src='/images/smileys/angel.gif' border='0' />")
    text.gsub!(":3", "<img src='/images/smileys/colonthree.gif' border='0' />")
    text.gsub!("o.O", "<img src='/images/smileys/confused.gif' border='0' />")
    text.gsub!(":'(", "<img src='/images/smileys/cry.gif' border='0' />")
    text.gsub!("3:)", "<img src='/images/smileys/devil.gif' border='0' />")
    text.gsub!(":(", "<img src='/images/smileys/frown.gif' border='0' />")
    text.gsub!(":O", "<img src='/images/smileys/gasp.gif' border='0' />")
    text.gsub!("8)", "<img src='/images/smileys/glasses.gif' border='0' />")
    text.gsub!(":D", "<img src='/images/smileys/grin.gif' border='0' />")
    text.gsub!(">:(", "<img src='/images/smileys/grumpy.gif' border='0' />")
    text.gsub!("<3", "<img src='/images/smileys/heart.gif' border='0' />")
    text.gsub!("^_^", "<img src='/images/smileys/kiki.gif' border='0' />")
    text.gsub!(":*", "<img src='/images/smileys/kiss.gif' border='0' />")
    text.gsub!(":v", "<img src='/images/smileys/pacman.gif' border='0' />")
    text.gsub!(":)", "<img src='/images/smileys/smile.gif' border='0' />")
    text.gsub!("-_-", "<img src='/images/smileys/squint.gif' border='0' />")
    text.gsub!("8|", "<img src='/images/smileys/sunglasses.gif' border='0' />")
    text.gsub!(":p", "<img src='/images/smileys/tongue.gif' border='0' />")
    text.gsub!(" :/ ", "<img src='/images/smileys/unsure.gif' border='0' />")
    text.gsub!("@:O", "<img src='/images/smileys/upset.gif' border='0' />")
    text.gsub!(";)", "<img src='/images/smileys/wink.gif' border='0' />")
  end

  def authenticate_user!
    unless logged_in?
      flash[:alert] = t('flash.application.not_logged_in')
      respond_to do |format|
        format.json { render :json => {}, :location => root_path, :status => :unauthorized }
        format.html { redirect_to root_path }
      end
    end
  end

  def user_available_chats
    @available_chats = []
    ChatRoom.all.each do |chat|
      if chat.private == false || chat.private == nil
        unless chat.room_users.find_by_user_id(current_user.id)
          @available_chats << chat
        end
      else
        if chat.room_users.find_by_user_id(current_user.id)
          @available_chats << chat
        end
      end
    end

    return @available_chats
  end

  # Validate admin authentication if route is within the /admin path
  def authenticate_admin!
    if self.class.name =~ /Admin/ && current_user.is_mod?
      redirect_to admin_flagged_replies_path
      false
    elsif self.class.name =~ /Admin/ && !current_user.is_admin?
      flash[:alert] = t('flash.application.should_be_admin')
      (redirect_to :back rescue redirect_to root_path)
      false
    else
      true
    end
  end
  # Validate admin authentication if route is within the /admin path
  def authenticate_mod!
    if self.class.name =~ /Admin/ && current_user.is_admin?
      true
    elsif self.class.name =~ /Admin/ && !current_user.is_mod?
      flash[:alert] = t('flash.application.should_be_admin')
      (redirect_to :back rescue redirect_to root_path)
      false
    else
      true
    end
  end
end
