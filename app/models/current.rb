class Current < ActiveSupport::CurrentAttributes
  attribute :user
  delegate :business, to: :user, allow_nil: true
end