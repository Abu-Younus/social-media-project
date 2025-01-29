import { deleteAccountService, followUserService, forgotPasswordService, loginService, logoutService, readProfileService, registerService, resetPasswordService, unfollowUserService, updateProfileService, verifyOtpService } from "../service/UserServices.js";

//registration
export const Registration = async (req, res) => {
    let result = await registerService(req);
    return res.json(result);
};

//login
export const Login = async (req, res) => {
    let result = await loginService(req, res);
    return res.json(result);
};

//profile read
export const ReadProfile = async (req, res) => {
    let result = await readProfileService(req);
    return res.json(result);
};

//update profile
export const UpdateProfile = async (req, res) => {
    let result = await updateProfileService(req);
    return res.json(result);
};

//follow user
export const FollowUser = async (req, res) => {
    let result = await followUserService(req);
    return res.json(result);
};

//unfollow user
export const UnfollowUser = async (req, res) => {
    let result = await unfollowUserService(req);
    return res.json(result);
};

//logout
export const Logout = async (req, res) => {
    let result = await logoutService(res);
    return res.json(result);
}

//forgot password
export const ForgotPassword = async (req, res) => {
    let result = await forgotPasswordService(req);
    return res.json(result)
};

//otp verification
export const OTPVerification = async (req, res) => {
    let result = await verifyOtpService(req);
    return res.json(result);
};

//reset password
export const ResetPassword = async (req, res) => {
    let result = await resetPasswordService(req);
    return res.json(result);
}

//account delete
export const DeleteAccount = async (req, res) => {
    let result = await deleteAccountService(req);
    return res.json(result);
}