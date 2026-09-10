class DeliverInvitationJob < ApplicationJob
  queue_as :default

  def perform(client_id, token)
    client = Client.find(client_id)
    preview_path = Rails.root.join("tmp/mails", client.email)
    File.delete(preview_path) if Rails.env.development? && File.exist?(preview_path)
    ClientMailer.invitation(client, token).deliver_now
  end
end
