require "test_helper"

# Tenant isolation and back-office access: the guarantees the README promises.
class AccessControlTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup { @previous_platform_admins = ENV["PLATFORM_ADMIN_EMAILS"] }
  teardown { ENV["PLATFORM_ADMIN_EMAILS"] = @previous_platform_admins }

  test "a business admin cannot open another business's client" do
    sign_in users(:one)
    get admin_client_url(clients(:two))
    assert_response :not_found
  end

  test "a business admin cannot open another business's feedback" do
    sign_in users(:one)
    get admin_feedback_url(feedbacks(:two))
    assert_response :not_found
  end

  test "a business admin's inbox lists only their own business's feedback" do
    sign_in users(:one)
    get admin_feedbacks_url
    assert_response :success
    assert_select "a[href=?]", admin_feedback_path(feedbacks(:one))
    assert_select "a[href=?]", admin_feedback_path(feedbacks(:two)), count: 0
  end

  test "a client cannot open another client's feedback" do
    sign_in users(:two)
    get client_feedback_url(feedbacks(:one))
    assert_response :not_found
  end

  test "the back office requires sign-in" do
    get rails_admin_url
    assert_redirected_to new_user_session_url
  end

  test "a business admin who is not a platform owner cannot use the back office" do
    ENV["PLATFORM_ADMIN_EMAILS"] = "owner@example.com"
    sign_in users(:one)
    get rails_admin_url
    assert_redirected_to "http://www.example.com/" # the app root, not the engine's /system/
  end

  test "a platform owner can use the back office" do
    ENV["PLATFORM_ADMIN_EMAILS"] = "someone@example.com, #{users(:one).email.upcase}"
    sign_in users(:one)
    get rails_admin_url
    assert_response :success
  end

  test "a client is never a platform owner, even if listed" do
    ENV["PLATFORM_ADMIN_EMAILS"] = users(:two).email
    sign_in users(:two)
    get rails_admin_url
    assert_redirected_to "http://www.example.com/" # the app root, not the engine's /system/
  end
end
