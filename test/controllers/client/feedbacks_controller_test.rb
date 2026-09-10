require "test_helper"

class Client::FeedbacksControllerTest < ActionDispatch::IntegrationTest
  test "index requires a client session" do
    get client_feedbacks_url
    assert_redirected_to new_user_session_url
  end

  test "new requires a client session" do
    get new_client_feedback_url
    assert_redirected_to new_user_session_url
  end

  test "create requires a client session" do
    post client_feedbacks_url, params: { feedback: { body: "Hello" } }
    assert_redirected_to new_user_session_url
  end

  test "show requires a client session" do
    get client_feedback_url(1)
    assert_redirected_to new_user_session_url
  end
end
