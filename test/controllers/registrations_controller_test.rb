require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "renders the sign-in page" do
    get new_user_session_url
    assert_response :success
  end

  test "creates an admin workspace and redirects to its dashboard" do
    email = "new-admin-#{SecureRandom.hex(4)}@example.com"

    assert_difference([ "Business.count", "User.count" ], 1) do
      post signup_url, params: {
        business: { name: "New Workspace", email: email },
        user: { email: email, password: "Password123!", password_confirmation: "Password123!" }
      }
    end

    assert_redirected_to admin_dashboard_url
    assert User.find_by(email: email).admin?
  end
end
