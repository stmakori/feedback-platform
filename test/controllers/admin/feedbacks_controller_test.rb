require "test_helper"

class Admin::FeedbacksControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get admin_feedbacks_index_url
    assert_response :success
  end

  test "should get show" do
    get admin_feedbacks_show_url
    assert_response :success
  end
end
