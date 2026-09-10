require "test_helper"

class Admin::DashboardsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get admin_dashboards_show_url
    assert_response :success
  end
end
