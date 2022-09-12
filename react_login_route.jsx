import { useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import MFA_setup from './MFA_setup';
import Change_Password from './AUTH_IN_OUT/Change_password';

const Login_route_screen = () => {
	const signin_info = useSelector((state) => state.signed_in_reducer);

	let signin_count_num = parseInt(
		signin_info.attributes['custom:sign_in_count']
	);

	if (signin_info.error_code === 'UserNotConfirmedException') {
		return <MFA_setup />;
	} else if (signin_info.error_code === 'PasswordResetRequiredException') {
		return <Change_Password />;
	} else if (signin_info.error_code === 'NotAuthorizedException') {
		// return nothing
	} else if (signin_info.error_code === 'UserNotFoundException') {
		// return nothing
	} else if (
		signin_info.challenge === 'SMS_MFA' ||
		signin_info.challenge === 'SOFTWARE_TOKEN_MFA'
	) {
		return <Navigate to='/confirmpasscode' />;
	} else if (signin_info.challenge === 'NEW_PASSWORD_REQUIRED') {
	} else if (signin_info.challenge === 'MFA_SETUP' || signin_count_num === 0) {
		return <MFA_setup />;
	} else {
		return <Navigate to='/dashboard' />;
	}
};

export default Login_route_screen;
