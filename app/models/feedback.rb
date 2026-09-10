class Feedback < ApplicationRecord
  belongs_to :client
  belongs_to :business
  has_many_attached :photos
  has_one_attached :voice_recording
  validates :body, presence: true, unless: -> { photos.attached? || voice_recording.attached? }
  validate :business_matches_client

  private

  def business_matches_client
    errors.add(:business, "must match client") if client && business_id != client.business_id
  end
end
