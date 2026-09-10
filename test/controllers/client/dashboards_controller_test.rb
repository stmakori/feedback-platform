require "test_helper"

class Client::DashboardsControllerTest < ActionDispatch::IntegrationTest
  test "requires a client session" do
    get client_dashboard_url
    assert_redirected_to new_user_session_url
  end
end
