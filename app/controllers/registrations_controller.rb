class RegistrationsController < ApplicationController
  skip_forgery_protection only: :create

  def new
    @business = Business.new
    @user = User.new
  end

  def create
    @business = Business.new(business_params)
    @user = @business.users.build(user_params.merge(role: :admin))
    if @business.save && @user.save
      sign_in(@user)
      redirect_to admin_dashboard_path
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def business_params
    params.require(:business).permit(:name, :email)
  end

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end
