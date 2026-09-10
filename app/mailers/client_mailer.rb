class ClientMailer < ApplicationMailer
  def invitation(client, token)
    @client = client
    @invitation_url = invitation_url(token: token, host: ENV.fetch("APP_HOST", "localhost:3000"))
    mail(to: client.email, subject: "Your feedback portal invitation")
  end
end
