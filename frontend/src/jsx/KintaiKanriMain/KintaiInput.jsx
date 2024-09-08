import React from 'react';
import { useState } from 'react';
import Select from 'react-select';
import classes from '../../css/kintaiInput.module.css';

const KintaiInput = (props) => {

    const [showJikanShitei, setShowJikanShitei] = useState(false);
    const [bikou, setBikou] = useState("");

    const inputBikou = (event) => {
        setBikou(event.target.value);
    }

    const toggleJikanShitei = (jikantaiSelect) => {  
        jikantaiSelect['value'] === 'shitei' ? setShowJikanShitei(true) : setShowJikanShitei(false);
    }
    
    var jikanShitei = [];

    // create jikanShitei section
    if (showJikanShitei){
        jikanShitei = (
            <div className={classes.jikan_shitei}>
                <div className={classes.kibou_syukkin}>
                    <p className={classes.kibou_syukkin_text}>希望出勤時間:</p>
                    <input type="time" className={classes.kibou_syukkin_time} defaultValue='00:00'/>
                </div>
                <div className={classes.kibou_taikin}>
                    <p className={classes.kibou_taikin_text}>希望退勤時間:</p>
                    <input type="time" className={classes.kibou_taikin_time} defaultValue='00:00'/>
                </div>
            </div>
        );
    }
        
    // create displayStr; sorted 
    selectedDate = props.date;
    const dayNames = '日月火水木金土';
    var perseDate, selectedDate, perseWeekDay, displayStr, weekDayNum, newDate, selectedDateCount = []; 
    if (!Array.isArray(selectedDate)) {
        newDate = new Date(selectedDate);
        perseDate = newDate.getDate().toString() + "日";
        weekDayNum = newDate.getDay();
        perseWeekDay = '(' + dayNames[weekDayNum] + ')';
        displayStr = perseDate + perseWeekDay;
    } else {
        newDate = selectedDate.map((date) => {return new Date(date)});
        perseDate = newDate.map((date) => {return date.getDate()});
        weekDayNum = newDate.map((date) => {return date.getDay()});
        perseWeekDay = weekDayNum.map((dayNum) => {return '(' + dayNames[dayNum] + ')'});
        perseDate.sort((a, b) => a - b);
        selectedDateCount = perseDate.length;
        for (var i = selectedDateCount > 3 ? selectedDateCount - 3: 0; i < perseDate.length; ++i) {
            if (i !== perseDate.length - 1) {
                displayStr += perseDate[i] + "日" + perseWeekDay[i] + ", ";
            } else {
                displayStr += perseDate[i] + "日" + perseWeekDay[i];
            }
        }
        if (selectedDateCount > 3) {
            displayStr += "他+" + (selectedDateCount - 3);
        }
        if (displayStr !== undefined && displayStr.indexOf('undefined') !== -1){
            displayStr = displayStr.replace('undefined', '');
        }
    }

    const options = [
        {value: "free", label: '終日フリー'},
        {value: "shitei", label: '時間指定'},
        {value: "mitei", label: '未定・要相談'}, 
        {value: "huka", label: '勤務不可'} 
    ]
    const placeholder = '選択して下さい';

    const onSubmit = (event) => {
        event.preventDefault();
        props.setKintai(selectedDate, event.target[1].value, event.target[2].value, event.target[3].value, event.target['bikou'].value)
        setBikou('');
    }

    const cancelSubmit = (event) => {
        event.preventDefault();
        props.closeModal();
        setBikou('')
    }

    return (
        <div>
            <div className={classes.kintaiInput_header}>
                <p className={classes.kintaiInput_header_text}><b>シフト希望</b></p>
            </div>
                <form method='dialog'
                      className={classes.kintaiInput_contents}
                      onSubmit={onSubmit}>
                <h3 className={classes.kintaiInput_contents_header}>{displayStr}</h3>
                <p className={classes.jikantai}>希望時間帯:</p>
                <Select required
                        readonly='true'
                        name="jikantai_select" 
                        className={classes.jikantai} 
                        placeholder={placeholder}
                        onChange={(jikantaiSelect) => {toggleJikanShitei(jikantaiSelect)}} 
                        options={options}/>
                {jikanShitei}
                <p className={classes.bikou_text}>備考</p>
                <textarea name="bikou" className={classes.bikou_contents} cols="30" rows="10" value={bikou} onChange={inputBikou}></textarea>
                <div className={classes.kakutei_cancel}>
                    <button type='submit' className={classes.shift_kakutei} >確定</button>
                    <button type='button' className={classes.shift_cancel} onClick={cancelSubmit}>閉じる</button>
                </div>
            </form>
        </div>
    );
}

export default KintaiInput;