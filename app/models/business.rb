class Business < ApplicationRecord
	has_many :users, dependent: :destroy
	has_many :clients, dependent: :destroy
	has_many :feedbacks, dependent: :destroy
	validates :name, :email, presence: true
	normalizes :email, with: ->(email) { email.strip.downcase }
end
