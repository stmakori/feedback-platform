class Admin::DashboardsController < ApplicationController
  before_action :require_admin!

  def show
    @clients = Current.business.clients.order(:name)
    @feedback_count = Current.business.feedbacks.count
  end
end
