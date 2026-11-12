class User < ApplicationRecord
  belongs_to :business, optional: true
  has_one :client, dependent: :nullify
  enum :role, { admin: 0, client: 1 }

  # Only platform owners may use the RailsAdmin back office at /system, because it sees every
  # business. Business admins are not platform owners. List owners by email in
  # PLATFORM_ADMIN_EMAILS (comma-separated).
  def self.platform_admin_emails
    ENV.fetch("PLATFORM_ADMIN_EMAILS", "").split(",").map { |address| address.strip.downcase }.reject(&:empty?)
  end

  def platform_admin?
    admin? && self.class.platform_admin_emails.include?(email.to_s.downcase)
  end

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
