class Admin::FeedbacksController < ApplicationController
  before_action :require_admin!

  def index
    @feedbacks = Current.business.feedbacks.includes(:client).order(created_at: :desc)
  end

  def show
    @feedback = Current.business.feedbacks.includes(:client).find(params[:id])
  end
end
