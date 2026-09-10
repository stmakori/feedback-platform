class Admin::ClientsController < ApplicationController
	before_action :require_admin!
	before_action :set_client, only: [:show, :edit, :update, :destroy, :invite]

	def index
		@clients = Current.business.clients.order(:name)
	end

	def new
		@client = Current.business.clients.new
	end

	def create
		@client = Current.business.clients.new(client_params)
		return redirect_to admin_clients_path, notice: "Client added." if @client.save
		render :new, status: :unprocessable_entity
	end

	def show; end
	def edit; end

	def update
		return redirect_to admin_client_path(@client), notice: "Client updated." if @client.update(client_params)
		render :edit, status: :unprocessable_entity
	end

	def destroy
		@client.destroy
		redirect_to admin_clients_path, notice: "Client removed."
	end

	def invite
		raw_token = SecureRandom.urlsafe_base64(32)
		@client.update!(invitation_token_digest: Digest::SHA256.hexdigest(raw_token), invitation_sent_at: Time.current, invitation_expires_at: 7.days.from_now)
		DeliverInvitationJob.perform_later(@client.id, raw_token)
		redirect_to admin_clients_path, notice: "Invitation queued."
	end

	private

	def set_client
		@client = Current.business.clients.find(params[:id])
	end

	def client_params
		params.require(:client).permit(:name, :email, :phone)
	end
end
