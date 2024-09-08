import React, { useEffect, useRef, useState } from "react";
import FullCalendar from '../@fullcalendar/react/dist';
import dayGridPlugin from '../@fullcalendar/daygrid';
import jaLocale from '@fullcalendar/core/locales/ja' ;
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import Interaction from '@fullcalendar/interaction';
import '../../css/sekouCalendar.module.css'



const SekouCalendar = (props) => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const nextMonth = today.setMonth(thisMonth + 1);
    
    const sessionSekouEvents = sessionStorage.getItem('sekouEvents');
    today.setDate(1);
    today.setMonth(thisMonth + 1);
    const displayedMonthtoday = today;

    useEffect(() => {
        resizeSekou();
        async function getSekou() {
            if(sessionSekouEvents == null) {
                var urlencoded = new URLSearchParams();
                urlencoded.append("date", displayedMonthtoday);
                try {
                    await fetch('/_api/sekouEvents', {method: 'POST', body: urlencoded})
                    .then(res => res.json(res))
                    .then(res => {
                        sessionStorage.setItem('sekouEvents', JSON.stringify(res));
                        res.map(event => addEvent(event));
                        props.setSekouEvents(true);
                    });
                } catch (e) {
                    console.error('failed to get sekouEvents. error message; ' + e);
                }
            } else {
                const parsedSessionEvents = JSON.parse(sessionSekouEvents);
                parsedSessionEvents.map(event => addEvent(event));
                props.setSekouEvents(true);
            }
        }

        getSekou()
    }, [])

    const renderDayCell = (e) => {
        const {dayNumberText} = e
        const renderDayNumberText = dayNumberText.replace('日', '');
        return renderDayNumberText
    }

    const closeModal = () => {
        props.updateEvent();
        props.dialog.current?.close();
    }

    const calendarRef = useRef();
    const resizeSekou = () => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi.updateSize();
    }

    const addEvent = (e) => {
        const calendarAPI = calendarRef.current.getApi();
        calendarAPI.addEvent(e);
    }
    
    return (
        <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, googleCalendarPlugin, Interaction]}                    
        headerToolbar={{
            right: '',
            center: 'closeSekou',
            left: ''
        }}
        customButtons={{
            closeSekou: {
                text: '閉じる', 
                click: function() { 
                    closeModal();
                }
            },
            updateSize: {
                text: 'updateSize',
                click: function() {
                    resizeSekou();
                    }
                }
            }}
            googleCalendarApiKey='AIzaSyA-cGa8KFQ7QncK8UmdiBPZU9yPXGHrOBE'
            eventSources={[
                {
                    googleCalendarId: 'japanese__ja@holiday.calendar.google.com',
                    display: 'background',
                    color: '#d3d3d3'
                }
            ]}
            initialDate={nextMonth}
            initialView='dayGridMonth'
            locales={[jaLocale]}
            locale='ja'
            dayCellContent={renderDayCell}
            contentHeight='auto'
            fixedWeekCount = {false}
        />
    )
}

export default SekouCalendar;