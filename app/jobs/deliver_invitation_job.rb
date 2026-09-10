class DeliverInvitationJob < ApplicationJob
  queue_as :default

  def perform(client_id, token)
    client = Client.find(client_id)
    ClientMailer.invitation(client, token).deliver_now
  end
end