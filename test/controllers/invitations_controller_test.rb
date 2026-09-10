require "test_helper"

class InvitationsControllerTest < ActionDispatch::IntegrationTest
  test "invalid invitation is rejected" do
    get invitation_url(token: "invalid")
    assert_response :gone
  end

  test "invalid invitation cannot be accepted" do
    patch invitation_url(token: "invalid"), params: { password: "password", password_confirmation: "password" }
    assert_response :gone
  end
end
