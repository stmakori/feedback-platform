require "test_helper"

class Client::FeedbacksControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get client_feedbacks_index_url
    assert_response :success
  end

  test "should get new" do
    get client_feedbacks_new_url
    assert_response :success
  end

  test "should get create" do
    get client_feedbacks_create_url
    assert_response :success
  end

  test "should get show" do
    get client_feedbacks_show_url
    assert_response :success
  end
end
