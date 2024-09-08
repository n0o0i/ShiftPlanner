import React, { createRef, useState, useEffect, useContext, useRef, CSSProperties, useCallback } from 'react';
import FullCalendar from '../@fullcalendar/react/dist';
import dayGridPlugin from '../@fullcalendar/daygrid';
import jaLocale from '@fullcalendar/core/locales/ja' ;
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import Interaction from '@fullcalendar/interaction';
import KintaiInput from './KintaiInput';
import { EventsContext } from '../../App';
import { UserNameContext } from '../../App';
import { IsSubmittedContext } from '../../App';
import SekouCalendar from './SekouCalendar';
import { useNavigate } from "react-router-dom";
import classes from '../../css/calendar.module.css';
import '../../css/calendar.css'
import { Player } from '@lottiefiles/react-lottie-player';
import loadingImage from '../../images/loading.json'
import { v4 as uuidv4} from 'uuid';


const Calendar = () => {
    const sessionEvents = sessionStorage.getItem('events');
    const email = JSON.parse(sessionStorage.getItem('email'));

    const ref = createRef();
    const calendarDialog = createRef();
    const [selectedDate, setSelectedDate] = useState([]);
    const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
    const {events, setEvents} = useContext(EventsContext);
    const [sekouCalendarDialog, setSekouCalendarDialog] = useState(false);
    const [sekouEvents, setSekouEvents] = useState();
    const navigate = useNavigate();
    const {isSubmitted, setIsSubmitted} = useContext(IsSubmittedContext);
    const {userName, setUserName} = useContext(UserNameContext);

    const today = new Date();
    const thisMonth = today.getMonth();
    today.setDate(1);
    today.setMonth(thisMonth + 1);
    const displayedMonthtoday = today;
    const initialDate = today.toLocaleDateString('sv-SE');

    
    useEffect(() => {
        function setSessionEvents () {
            if (sessionEvents && sessionEvents !== 'undefined'){
                const parsedSessionEvents = JSON.parse(sessionEvents);
                parsedSessionEvents.map(event => {
                    if (event.url == undefined){
                        const e = {
                            id: event.id,
                            start: event.start,
                            title: event.title,
                            editable: false,
                            backgroundColor: event.backgroundColor,
                            description: event.extendedProps.description
                        }
                        addEvent(e);
                    }
                })
            }
        }

        async function isEmailSubmitted () {
            const urlencoded = new URLSearchParams();
            urlencoded.append('email', email);
            urlencoded.append('date', displayedMonthtoday);
            try {
                await fetch('/_api/isSubmitted', {method: 'POST', body: urlencoded})
                .then(res => res.json(res))
                .then(res => {
                    setIsSubmitted(res)
                    if (res) {
                        setSubmittedShift();
                    }
                });
            } catch (e) {
                throw new Error('failed to check email is already submitted; ' + e);
            }
        }

        async function setSubmittedShift () {
            const urlencoded = new URLSearchParams();
            urlencoded.append('email', email);
            urlencoded.append('date', displayedMonthtoday);
            try {
                await fetch('/_api/getSubmittedShift', {method: 'POST', body: urlencoded})
                .then(res => res.json(res))
                .then(res => {
                    res.map(event => {
                        addEvent(createSubmittedKintaiContent(event));
                    })
                })
            } catch (e) {
                throw new Error('failed to get submitted shifts; ' + e);
            }
        }
        
        setSessionEvents();
        if (userName !== 'testuser'){
            isEmailSubmitted();
        }
    }, [])    
    
    const updateEvent = () => {
        setEvents(prevState => {
            var newEvents = new Array(...prevState);
            newEvents.push({});
            return newEvents;
        })
    }
    
    const closeModal = () => {
        ref.current?.close();
        if (!multiSelectEnabled) {
            setSelectedDate([]);
            removeBackground();
        }
        updateEvent();
    }
    
    const enableMultiSelect = () => {
        setMultiSelectEnabled(multiSelectEnabled ? false : true);
        removeBackground();
    }
    
    const calendarRef = useRef(null);
    const addEvent = useCallback((e) => {
        const calendarAPI = calendarRef.current.getApi();
        calendarAPI.addEvent(e);
    }, [])
    
    const getEvents = useCallback(() => {
        const calendarAPI = calendarRef.current.getApi();
        return  calendarAPI.getEvents();
    }, [])
    
    const getEventsByDate = useCallback((dateStr) => {
        const calendarAPI = calendarRef.current.getApi();
        const allEvents = calendarAPI.getEvents();
        const eventsOnDate = allEvents.filter(event => event.startStr === dateStr);
        return eventsOnDate;
    }, [])
    
    const removeEventById = useCallback((eventId) => {
        const calendarAPI = calendarRef.current.getApi();
        const event = calendarAPI.getEventById(eventId);
        if (event) {
            event.remove();
        }
    }, []);
    
    const removeBackground = useCallback(() => {
        const calendarAPI = calendarRef.current.getApi();
        const events = calendarAPI.getEvents();
        const backgroundEvent = events.filter(event => event.display === 'background');
        backgroundEvent.map(event => {
            removeEventById(event.id);
        });
    }, [])
    
    const multiSelect = (e) => {
        const eventsOnDate = getEventsByDate(e.dateStr);
        const eventsOnDateExeHoli = eventsOnDate.filter(event => event.title === '');
        if (eventsOnDateExeHoli.some(event => event.display === 'background')){
            const removingEventId = eventsOnDateExeHoli.map(event => {
                if (event.display === 'background') {
                    return event.id;
                }
            });
            removeEventById(removingEventId);
        } else {
            var event = {id: uuidv4(), start: e.dateStr, display:'background'};
            addEvent(event);
            setSelectedDate(prevState => [...prevState, e.dateStr]);
        }
    }
    
    const displayModal = (e) => {
        if (!multiSelectEnabled) {
            setSelectedDate(e.dateStr);
        } else {
            const allEvents = getEvents();
            const newDate = allEvents.filter(event => event.display === 'background');
            setSelectedDate(newDate.map(event => event.startStr));
        }
        
        if (multiSelectEnabled && selectedDate.length == 0) {
            alert('日付を選択して下さい');
            return;    
        } else {
            ref.current?.showModal();
        }
    }
    
    const renderDayCell = (e) => {
        const {dayNumberText} = e
        const renderDayNumberText = dayNumberText.replace('日', '');
        return renderDayNumberText
    }
    
    const setKintaiHandler = (date, jikantai, shukkin, taikin, bikou) => {
        setMultiSelectEnabled(false);
        setSelectedDate([]);
        const kintaiContents = createKintaiContents(jikantai, shukkin, taikin, bikou);
        if (Array.isArray(date)) {
            removeBackground();
            for (var i = 0; i < date.length; ++i) {
                const event = {
                    id: uuidv4(),
                    start: date[i],
                    title: kintaiContents['displayJikantai'],
                    editable: false,
                    backgroundColor: kintaiContents['backgroundColor'],
                    description: kintaiContents['bikou']
                }
                const eventsOnDate = getEventsByDate(date[i]);
                const removingEvent = eventsOnDate.filter(event => event.display === 'auto');
                const eventId = removingEvent.map(event => event.id);
                eventId.map(id => removeEventById(id));
                addEvent(event);
            }
            sessionStorage.setItem('events', JSON.stringify(getEvents()));
        } else {
            var e = {
                id: uuidv4(),
                start: date,
                title: kintaiContents['displayJikantai'],
                editable: false,
                backgroundColor: kintaiContents['backgroundColor'],
                description: kintaiContents['bikou']
            }
            const eventsOnDate = getEventsByDate(date);
            const removingEvent = eventsOnDate.filter(event => event.display === 'auto');
            const eventId = removingEvent.map(event => event.id);
            removeEventById(eventId);
            addEvent(e);
        }
        sessionStorage.setItem('events', JSON.stringify(getEvents()));
        ref.current?.close();
    }
    
    const createKintaiContents = (jikantai, shukkin, taikin, bikou) => {
        var contents= {displayJikantai: '', backgroundColor: '', bikou};
        switch (jikantai){
            case 'free':
                contents['displayJikantai'] = '終日フリー';
                contents['backgroundColor'] = '#247c50';
                break;
            case 'shitei':
                contents['displayJikantai'] = shukkin + "-" + taikin;
                contents['backgroundColor'] = '#ffbc00';
                break;
            case 'mitei':
                contents['displayJikantai'] = '未定・要相談';
                contents['backgroundColor'] = '#a02438';
                break;
            case 'huka':
                contents['displayJikantai'] = '出勤不可';
                contents['backgroundColor'] = '#9b9b9b';
                break;
            default:
        }
        return contents;
    }

    /**
     * 
     * @param {Object} {start: date, title; shiftTitle} 
     * @returns 
     */
    const createSubmittedKintaiContent = (submittedSift) => {
        var content= {
            id: uuidv4(),
            start: submittedSift['start'], 
            title: submittedSift['title'],
            backgroundColor: '',
            editable: false
        };
        switch (content['title']){
            case '終日フリー':
                content['backgroundColor'] = '#247c50';
                break;
            case '未定・要相談':
                content['backgroundColor'] = '#a02438';
                break;
            case '出勤不可':
                content['backgroundColor'] = '#9b9b9b';
                break;
            default:
                content['backgroundColor'] = '#ffbc00';
        }
        return content;
    }
    
    const dateClick = (date) => {
        const thisMonth = new Date().getMonth();
        const nextMonth = thisMonth + 2;
        const clickedMonth = new Date(date.dateStr).getMonth() + 1;
        if (clickedMonth == nextMonth) {
            if (multiSelectEnabled) {
                multiSelect(date);
            } else {
                displayModal(date);
            }
        } else {
            alert(nextMonth + "月の日付を選択して下さい");
        }
    }    
    
    const openSekouCalendar = () => {
        setSekouCalendarDialog(!sekouCalendarDialog);
        calendarDialog.current?.showModal();
    }
    
    const goToConfirmPage = () => {
        const date = new Date();
        date.setMonth(displayedMonthtoday.getMonth() + 1, 0);
        const lastDate = date.getDate();
        const allEvents = getEvents();
        const eventExeBackground = allEvents.filter(event => event.display == 'auto');
        const eventExeHoli = eventExeBackground.filter(event => event.url == "");
        var count = 0;
        eventExeHoli.map(event => ++count);
        if (count == lastDate) {
            eventExeHoli.sort((a, b) => {
                return a.startStr > b.startStr? 1: -1;
            })
            setEvents(eventExeHoli);
            sessionStorage.setItem('events', JSON.stringify(eventExeHoli));
            // console.log(eventExeHoli);
            navigate('/KintaiConfirm')
        } else {
            alert('全ての日程のシフトを入力してください');
        }        
    }
    
    var multiSelectText = multiSelectEnabled? '解除': '複数日程選択';
    var multiEnabledButton = multiSelectEnabled? 'multiInput MultiSelectEnabled': 'MultiSelectEnabled';
    var textOrButton = isSubmitted? 'title': multiEnabledButton;
    var titleOrBlank = isSubmitted? '': 'title';

    return (
        <div>
            <div>
                <div className={classes.calendar}>
                    <FullCalendar
                        ref={calendarRef}
                        className={classes.fullCalendar}
                        plugins={[dayGridPlugin, googleCalendarPlugin, Interaction]}
                        headerToolbar={{
                            right: 'myCustomButton',
                            center: textOrButton,
                            left: titleOrBlank
                        }}
                        datesSet={(info) => {
                            const calendarTitle = document.querySelector('.fc-toolbar-title');
                            if(isSubmitted){
                                if(calendarTitle){
                                    calendarTitle.textContent = today.getFullYear() + '年' + (today.getMonth()+1) + '月提出済シフト';
                                }
                            }
                        }}
                        customButtons={{
                            myCustomButton: {
                                text: '施工予定',
                                click: function() {
                                    openSekouCalendar();
                                }
                            },
                            MultiSelectEnabled: {
                                text: multiSelectText,
                                click: function() {
                                    enableMultiSelect();
                                }
                            },
                            multiInput: { 
                                text: '入力する', 
                                click: function() {
                                    displayModal();
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
                        initialDate={initialDate}
                        initialView='dayGridMonth'
                        locales={[jaLocale]}
                        locale='ja'
                        dayCellContent={renderDayCell}
                        dateClick={isSubmitted? '': dateClick}
                        contentHeight='auto'
                        fixedWeekCount = {false}
                    />
                </div>
                {isSubmitted? "": (
                    <div className={classes.goToConfirmPage}>
                    <button onClick={goToConfirmPage} className={classes.goToConfirmPageButton}>確認画面へ進む</button>
                    </div>
                )}
                <dialog ref={ref} className={classes.dialog}>
                    <div className={classes.kintaiInput}>
                        <KintaiInput closeModal={closeModal} date={selectedDate} setKintai={setKintaiHandler}/>
                    </div>
                </dialog>
                <dialog ref={calendarDialog} className={classes.calendarDialog}>
                    <div className={classes.sekouCalendarDialog}>
                        <SekouCalendar dialog={calendarDialog} sekouCalendarDialog={sekouCalendarDialog} sekouEvents={sekouEvents} updateEvent={updateEvent} setSekouEvents={setSekouEvents}/>
                    </div>
                </dialog> 
            </div>
            {sekouEvents ? ('') : (
            <div className={classes.loaderWrapper}>
                <div className={classes.loader}>
                <Player
                        className={classes.player}
                        autoplay
                        loop
                        src={loadingImage}/>
                </div>
            </div>
            )}
        </div>
        )
    }

export default Calendar;