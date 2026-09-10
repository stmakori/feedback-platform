require "test_helper"

class Client::DashboardsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get client_dashboards_show_url
    assert_response :success
  end
end
