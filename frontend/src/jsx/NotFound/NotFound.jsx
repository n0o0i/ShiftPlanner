import React from "react";
import classes from '../../css/notFound.module.css'
import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import notFound from "../../images/notFound.json"

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className={classes.notFound}>
            <Player src={notFound}
                    autoplay
                    loop
                    className={classes.notFoundImg}/>
            <button type="button" onClick={() => navigate('/')} className={classes.notFoundButton}>ログインページに戻る</button>
        </div>
    )
}

export default NotFound;