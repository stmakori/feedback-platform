RailsAdmin.config do |config|
  config.asset_source = :sprockets

  config.authenticate_with do
    warden.authenticate! scope: :user
  end
  config.current_user_method(&:current_user)

  config.authorize_with do
    # /system sees every business, so business admins are not enough: see User#platform_admin?.
    redirect_to main_app.root_path, alert: "Not authorized." unless current_user&.platform_admin?
  end

  config.actions do
    dashboard
    index
    new
    export
    bulk_delete
    show
    edit
    delete
    show_in_app
  end
end
