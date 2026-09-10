class Client::DashboardsController < ApplicationController
  before_action :require_client!

  def show
    @feedbacks = current_user.client.feedbacks.order(created_at: :desc).limit(10)
  end
end
