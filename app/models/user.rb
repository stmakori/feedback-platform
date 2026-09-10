class User < ApplicationRecord
  belongs_to :business, optional: true
  has_one :client, dependent: :nullify
  enum :role, { admin: 0, client: 1 }

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
