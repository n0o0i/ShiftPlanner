import React, { useContext, useEffect, useState } from "react";
import classes from '../../css/login.module.css'
import { useNavigate } from "react-router-dom";
import logo from '../../images/logo192.png';
import { EmailContext } from "../../App";
import { UserNameContext } from "../../App";
import { IsSubmittedContext } from "../../App";
import { Player } from '@lottiefiles/react-lottie-player';
import loadingImage from '../../images/loading.json'
import GoogleLoginButton from "./GoogleLoginButton";

const Login = () => {
    const navigate = useNavigate();
    const {email, setEmail} = useContext(EmailContext);
    const {userName, setUserName} = useContext(UserNameContext);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const {isSubmitted, setIsSubmitted} = useContext(IsSubmittedContext);

    const today = new Date();
    const thisMonth = today.getMonth();
    today.setMonth(thisMonth + 1);
    const displayedMonthtoday = today;

    useEffect(() => {
        sessionStorage.removeItem('events');
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('login');
        sessionStorage.removeItem('sekouEvents');
        setIsSubmitted(false);
    }, [])

    const onClick = async (event) => {
        event.preventDefault();
        setLoading(true)
        sessionStorage.setItem('userName', JSON.stringify(userName));
        sessionStorage.setItem('email', JSON.stringify(email));
        sessionStorage.setItem('login', true);

        const urlencoded = new URLSearchParams();
        urlencoded.append('date', displayedMonthtoday);
        urlencoded.append('email', email);
        var isSubmitted;
        try {
            await fetch('/_api/isSubmitted', {method: 'POST', body: urlencoded})
            .then(res => res.json(res))
            .then(json => {
                isSubmitted = json;
                setLoading(false);
            });
        } catch (e) {
            throw e;
        }
        isSubmitted? alert('このメールアドレスは提出済みです。'): navigate('/Calendar');
        // navigate('/Calendar');
    }

    const testUserLogin = () => {
        sessionStorage.setItem('userName', JSON.stringify('testuser'));
        sessionStorage.setItem('email', JSON.stringify('test@test.com'));
        sessionStorage.setItem('login', true);
        setUserName('testuser');
        setEmail('test@test.com');
        navigate('/Calendar');
    }
    
    const inputName = (event) => {
        setUserName(event.target.value)
    }

    const inputEmail = (event) => {
        setEmail(event.target.value);
    }

    // useEffect(() => {
    //     console.log(userName);
    //     // console.log(userName); 
    // }, userName)

    return (
        <div className={classes.login_body}>
            <div className={classes.login_wrapper}>
                <div className={classes.login_form}>
                    <img src={logo} className={classes.login_logo}/>
                    <div className={classes.google_login}>
                        <p>Log in with Google</p>
                        <GoogleLoginButton onClick={onClick}/>
                    </div>
                    <button onClick={testUserLogin}>テストユーザーでログイン</button>
                </div>
                {/* <form onSubmit={onClick} className={classes.login_form}>
                    <div className={classes.form_input}>
                        <input required type="email" name='email' onChange={inputEmail} className={classes.login_email} placeholder="Email" />
                        <input required type="text" name="name" onChange={inputName} className={classes.login_name} placeholder="Name" />
                        <input type="submit" value='Login' className={classes.login_submit}/>
                    </div>
                </form>
            </div>
            {loading? (
            <div className={classes.loaderWrapper}>
                <div className={classes.loader}>
                    <Player
                        className={classes.player}
                        autoplay
                        loop
                        src={loadingImage}/>
                </div> */}
            </div>
            {/* ) : ('')} */}
        </div>
    )
}

export default Login;