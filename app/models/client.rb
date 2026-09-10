class Client < ApplicationRecord
  belongs_to :business
  belongs_to :user, optional: true
  has_many :feedbacks, dependent: :destroy
  validates :name, :email, presence: true
  normalizes :email, with: ->(email) { email.strip.downcase }

  def invitation_pending?
    invitation_token_digest.present? && invitation_expires_at.present? && invitation_expires_at.future?
  end
end