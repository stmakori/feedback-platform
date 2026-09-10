class InvitationsController < ApplicationController
  def show
    @client = find_client
    return render :expired, status: :gone unless @client&.invitation_pending?
  end

  def update
    @client = find_client
    return render :expired, status: :gone unless @client&.invitation_pending?

    user = User.new(email: @client.email, password: params[:password], password_confirmation: params[:password_confirmation], role: :client, business: @client.business)
    if user.save
      @client.update!(user: user, invitation_token_digest: nil, invitation_accepted_at: Time.current)
      sign_in(user)
      redirect_to client_dashboard_path
    else
      render :show, status: :unprocessable_entity
    end
  end

  private

  def find_client
    digest = Digest::SHA256.hexdigest(params[:token].to_s)
    Client.find_by(invitation_token_digest: digest)
  end
end
