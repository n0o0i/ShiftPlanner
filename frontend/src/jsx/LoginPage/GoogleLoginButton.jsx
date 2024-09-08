import React, {useContext} from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// import config from '../../config.js'
import { EmailContext } from "../../App";
import { UserNameContext } from "../../App";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const GoogleLoginButton = (props) => {
    const navigate = useNavigate();
    const {email, setEmail} = useContext(EmailContext);
    const {userName, setUserName} = useContext(UserNameContext);

    // const clientId = config.GOOGLE_CLIENT_ID;
    const clientId = GOOGLE_CLIENT_ID;
    
    const onSuccess = (res) => {
        console.log('Google Login Sucess');
        fetch('/_api/google_login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({token: res.credential}),
        })
        .then((res) => res.json())
        .then((data) => {
            console.log('Sever responsed')
            setEmail(data['email']);
            setUserName(data['name']);
            sessionStorage.setItem('email', JSON.stringify(data['email']));
            sessionStorage.setItem('userName', JSON.stringify(data['name']));
            sessionStorage.setItem('login', true);
            navigate('/Calendar');
        })
        .catch((error) => console.error('Error: ', error));
    };

    const onFailure = (res) => {
        console.log('Login Failed: ', res);
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
            onSuccess={onSuccess}
            onError={onFailure}
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleLoginButton;