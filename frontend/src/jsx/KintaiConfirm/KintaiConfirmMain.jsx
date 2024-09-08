import React, { useContext, useState } from "react";
import KintaiConfirmTable from "./KintaiConfirmTable";
import classes from '../../css/kintaiConfirmMain.module.css'
import { Navigate, useNavigate } from "react-router-dom";
import { EventsContext, UserNameContext, EmailContext } from "../../App";
import { Player } from '@lottiefiles/react-lottie-player';
import loadingImage from '../../images/loading.json'

function KintaiConfirmMain () {
    const today = new Date;
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth();
    const nextMonthStr = thisMonth + 2;
    const navigate = useNavigate();
    const {events, setEvents} = useContext(EventsContext);
    const {email, setEmail} = useContext(EmailContext);
    const {userName, setUserName} = useContext(UserNameContext);
    const [comment, setComment] = useState();
    const [loading, setLoading] = useState(false);

    today.setMonth(thisMonth + 1);
    const displayedMonthtoday = today;

    const inputComment = event => {
        setComment(event.target.value);
    }

    const kintaiSubmit = async (event) => {
        if (userName == 'testuser') {
            navigate('/KintaiSubmitted');
            return;
        }
        try {
            if (!comment){
                throw new Error('コメントを入力して下さい');
            }
            setLoading(true);
            var urlencoded = new URLSearchParams();
            urlencoded.append("date", displayedMonthtoday);
            urlencoded.append("email", email);
            urlencoded.append("userName", userName);
            urlencoded.append("events", JSON.stringify(events));
            urlencoded.append("comment", comment);
            
            try {
                await fetch('/_api/kintaiSubmit', {method: 'POST', body: urlencoded})
                .then(res => setLoading(false));
            } catch (e) {
                throw e;
            }
            await navigate('/KintaiSubmitted');
        } catch (e) {
            alert(e.message)
        }
    }
        
        const placeholder = 'いつもありがとうございます！！シフトやチャレンジしたいポジション、勤務についてお伝えしたいことなどがあれば、なんでもご記入ください。';
        
    return (
        <div className={classes.body}>
            <div className={classes.title}>
                <h1>{thisYear}年{nextMonthStr}月</h1>
                <h3>こちらの内容で提出しますか？</h3>
            </div>
            <div className={classes.table_main}>
                <KintaiConfirmTable/>            
            </div>
            <div className={classes.textareaWrapper}>
                <textarea name="comment" className={classes.formComment} onChange={inputComment} placeholder={placeholder} cols="40" rows="3"></textarea>
            </div>
            <div className={classes.buttons}>
                <button type="button" onClick={() => navigate('/Calendar')} className={classes.backButton}>入力画面に戻る</button>
                <button type="button" onClick={kintaiSubmit} className={classes.submitButton}>提出する</button>
            </div>
            {loading? (
            <div className={classes.loaderWrapper}>
                <div className={classes.loader}>
                    <Player
                        className={classes.player}
                        autoplay
                        loop
                        src={loadingImage}/>
                </div>
            </div>
            ) : ('')}
        </div>
    )
}

export default KintaiConfirmMain;