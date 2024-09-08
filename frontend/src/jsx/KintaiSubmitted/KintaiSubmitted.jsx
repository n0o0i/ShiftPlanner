import React, {useContext} from 'react';
import completed from '../../images/completed.jpg';
import classes from '../../css/kintaiSubmitted.module.css';
import { Player } from '@lottiefiles/react-lottie-player';
import thankYou from '../../images/thankyou.json'
import { useNavigate } from 'react-router-dom';
import { UserNameContext } from '../../App';
import { IsSubmittedContext } from '../../App';

const KintaiSubmitted = () => {
    const navigate = useNavigate()
    const {userName, setUserName} = useContext(UserNameContext);
    const {isSubmitted, setIsSubmitted} = useContext(IsSubmittedContext);


    const goToCalendar = () => {
        if (userName !== 'testuser'){
            sessionStorage.removeItem('events');
        }
        setIsSubmitted(true);
        navigate('/Calendar');
    }

    return (
        <div>
            <div className={classes.submittedWrapper}>
                {/* <img src={completed} className={classes.completed}></img> */}
                <Player
                    autoplay
                    loop
                    src={thankYou}/>
                <p className={classes.doneText}>シフトの提出が完了しました。</p>
                <button onClick={goToCalendar}>提出したシフトを確認する</button>
            </div>
        </div>
    )

}

export default KintaiSubmitted;