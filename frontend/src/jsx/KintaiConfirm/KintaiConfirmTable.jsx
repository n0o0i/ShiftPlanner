import React, { useContext, useEffect} from "react";
import classes from '../../css/kintaiConfirmTable.module.css'
import { EventsContext, UserNameContext, EmailContext } from "../../App";

const KintaiConfirmTable = () => {
    const {email, setEmail} = useContext(EmailContext);
    const {userName, setUserName} = useContext(UserNameContext);
    const {events, setEvents} = useContext(EventsContext);

    const header = [
        {header: '日付', accessor: 'date'}, 
        {header: '曜日', accessor: 'day'}, 
        {header: '勤怠区分', accessor: 'kintaiKubun'}, 
        {header: '備考', accessor: 'bikou'}
    ];

    useEffect(() => {
        const sessionUserName = sessionStorage.getItem('userName');
        const sessionEmail = sessionStorage.getItem('email');
        const sessionEvents = sessionStorage.getItem('events');

        if (sessionUserName){
            setUserName(JSON.parse(sessionUserName));
            setEmail(JSON.parse(sessionEmail));
            setEvents(JSON.parse(sessionEvents));
        }
    }, []);
    const displayEvents = events.map(event => {
        const eventDate = new Date(event.start);
        const month = eventDate.getMonth() + 1;
        const displayMonth = month + '月';
        const date = eventDate.getDate();
        const displayDate = date + '日'
        const dayOfWeek = '日月火水木金土';
        const day = eventDate.getDay();
        const displayDay =dayOfWeek[day];
        // const retrun 
        const returnEvent = {
            // start: displayMonth + displayDate,
            start: displayDate,
            day: displayDay,
            title: event.title,
            description: event.extendedProps.description
        }
        return returnEvent;
    })
    
    return (
        <div className={classes.tableWrapper}>
            <table className={`${classes.confirmTable} ${classes.emailNameTable}`} >
                <tbody>
                    <tr>
                        <th>メールアドレス</th>
                        <td>{email}</td>                
                    </tr>
                    <tr>
                        <th>名前</th>
                        <td>{userName}</td>
                    </tr>
                </tbody>
            </table>
            <table className={classes.confirmTable}>
                <thead>
                    <tr key='table_header'>
                        {header.map(header =>(
                            <th key={header.accessor} className={classes.confirmtable_header}>
                                {header.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {displayEvents.map(event => (
                        <tr key={event.start} className={event.day == '土' || event.day == '日'? event.day == '日'? classes.td_day_sun: classes.td_day_sat: ''}>
                            <td className={classes.td_date}>
                                {event.start}
                            </td>
                            <td className={classes.td_day}>
                                {event.day}
                            </td>
                            <td className={classes.td_title}>
                                {event.title}
                            </td>
                            <td className={classes.td_description}>
                                {event.description}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

}

export default KintaiConfirmTable;