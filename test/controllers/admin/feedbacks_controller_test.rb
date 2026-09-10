require "test_helper"

class Admin::FeedbacksControllerTest < ActionDispatch::IntegrationTest
  test "index requires an admin session" do
    get admin_feedbacks_url
    assert_redirected_to new_user_session_url
  end

  test "show requires an admin session" do
    get admin_feedback_url(1)
    assert_redirected_to new_user_session_url
  end
end
