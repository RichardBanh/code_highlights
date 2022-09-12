import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Please_login_page from '../Error_pages/Please_login';
import { current_user } from './functions/Current_user_function';

export const Sign_in_check = ({ children }) => {
	const signed_in = useSelector((state) => state.signed_in_reducer.sign_in);
	const navigator = useNavigate();
	const dispatch = useDispatch();
	const navigate_to_login = () => {
		setTimeout(() => navigator('/signin'), 1000);
	};

	const check_login_redirect = async (redirect) => {
		const response = await current_user();
		if (response.success) {
			dispatch({ type: 'SIGNIN_CHECK/SIGN' });
		} else {
			redirect = true;
			navigate_to_login();
		}
	};
	if (!signed_in) {
		let show_redirect = false;
		check_login_redirect(show_redirect);
		if (!show_redirect) {
			return <div>Checking credentials</div>;
		} else {
			return <Please_login_page />;
		}
	}
	return children;
};
