require "test_helper"

class InvitationsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get invitations_show_url
    assert_response :success
  end

  test "should get update" do
    get invitations_update_url
    assert_response :success
  end
end
