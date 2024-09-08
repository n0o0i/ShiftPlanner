import React from 'react';
import Calendar from './Calendar';
import classes from '../../css/KintaiKanriMain.module.css';
import { useNavigate } from "react-router-dom";


function KintaiKanriMain() {
    const navigate = useNavigate();

        return (
            <div>
                <div className={classes.body}>
                    <div className={classes.calendar}>
                        <Calendar/>
                    </div>
               </div>
                <div className={classes.goToConfirmPage}>
                    <button onClick={() => navigate('kintaiConfirm')}>確認画面へ進む</button>
                </div>
            </div>
        );
    }

export default KintaiKanriMain;