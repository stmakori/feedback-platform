class ApplicationController < ActionController::Base
  before_action :set_current_user

  private

  def set_current_user
    Current.user = current_user if respond_to?(:current_user)
  end

  def require_admin!
    return redirect_to(new_user_session_path, alert: "Please sign in.") unless user_signed_in?
    redirect_to(root_path, alert: "You are not authorized.") unless current_user.admin?
  end

  def require_client!
    return redirect_to(new_user_session_path, alert: "Please sign in.") unless user_signed_in?
    redirect_to(root_path, alert: "You are not authorized.") unless current_user.client?
  end
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes
end
