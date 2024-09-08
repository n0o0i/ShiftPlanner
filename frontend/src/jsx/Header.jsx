import React, { useEffect } from 'react';
import classes from '../css/header.module.css'
import {withRouter} from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { UserNameContext, EventsContext } from '../App';
import { useNavigate } from "react-router-dom";

function Header(){
    const {userName, setUserName} = useContext(UserNameContext);
    const {events, setEvents} = useContext(EventsContext);
    const navigate = useNavigate();

    useEffect(() => {
        const sessionUserName = sessionStorage.getItem('userName');
        if (sessionUserName){
            setUserName(JSON.parse(sessionUserName));
        }
    }, []);

    const onClick = () => {
        setEvents([]);
        navigate('/');
    };

    const location = useLocation();
    var header = ''
    if(location.pathname !== '/'){
        header = (
            <header className={classes.header}>
                <div className={classes.header_wrapper}>
                    <nav className={classes.nav_info}>
                        <p className={classes.login_user}>ユーザー: {userName}</p>
                        <button type='button' onClick={onClick} className={classes.logout}>ログアウト</button>
                    </nav>
                </div>
            </header>
        )
    }
    return(
        <>
        {header}
        </>
    );
}

export default Header;