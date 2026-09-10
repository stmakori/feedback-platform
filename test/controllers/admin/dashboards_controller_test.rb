require "test_helper"

class Admin::DashboardsControllerTest < ActionDispatch::IntegrationTest
  test "requires an admin session" do
    get admin_dashboard_url
    assert_redirected_to new_user_session_url
  end
end
