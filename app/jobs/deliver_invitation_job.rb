class DeliverInvitationJob < ApplicationJob
  queue_as :default

  def perform(client_id, token)
    client = Client.find(client_id)
    remove_stale_preview(client.email) if Rails.env.development?
    ClientMailer.invitation(client, token).deliver_now
  end

  private

  # Development writes mail to tmp/mails/<recipient>. Delete the old preview so the newest
  # invitation is the one on disk. Match by name instead of building a path from the email,
  # so a crafted address such as "../x" can never reach a file outside tmp/mails.
  def remove_stale_preview(email)
    mail_dir = Rails.root.join("tmp/mails")
    return unless mail_dir.directory?

    mail_dir.children.find { |path| path.file? && path.basename.to_s == email }&.delete
  end
end
