class Client::FeedbacksController < ApplicationController
  before_action :require_client!
  before_action :set_feedback, only: :show

  def index
    @feedbacks = current_user.client.feedbacks.order(created_at: :desc)
  end

  def new
    @feedback = current_user.client.feedbacks.new
  end

  def create
    @feedback = current_user.client.feedbacks.new(feedback_params.merge(business: current_user.business))
    return redirect_to client_feedbacks_path, notice: "Feedback submitted." if @feedback.save
    render :new, status: :unprocessable_entity
  end

  def show
  end

  private

  def set_feedback
    @feedback = current_user.client.feedbacks.find(params[:id])
  end

  def feedback_params
    params.require(:feedback).permit(:body, :voice_recording, photos: [])
  end
end
