import './App.css';
import Login from './jsx/LoginPage/Login';
import Calendar from './jsx/KintaiKanriMain/Calendar';
import KintaiConfirmMain from './jsx/KintaiConfirm/KintaiConfirmMain';
import KintaiSubmitted from './jsx/KintaiSubmitted/KintaiSubmitted';
import NotFound from './jsx/NotFound/NotFound';
import React, { useState,useEffect, createContext, useContext } from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Header from './jsx/Header';
export const EventsContext = createContext();
export const EmailContext = createContext();
export const UserNameContext = createContext();
export const IsSubmittedContext = createContext();

export const CheckLogin = (props) => {
  const loginDone = sessionStorage.getItem('login');
  if (loginDone) {
    return props.component;
  }
  document.location = '/';
}

function App () {
  const [events, setEvents] = useState([]);
  const [email, setEmail] = useState();
  const [userName, setUserName] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);


  return (
      <div className='app'>
        <EventsContext.Provider value={{
          events, setEvents
        }}>
          <EmailContext.Provider value={{
            email, setEmail
          }}>
            <UserNameContext.Provider value={{
              userName, setUserName
            }}>
              <IsSubmittedContext.Provider value={{
                isSubmitted, setIsSubmitted
              }}>
                <Router>
                  <Header/>
                  <Routes>
                    <Route path='/' element={<Login/>} />
                    <Route path='/Calendar' element={<CheckLogin component = {<Calendar/>}/>}/>
                    <Route path='/KintaiConfirm' element={<CheckLogin component = {<KintaiConfirmMain/>}/>}/>
                    <Route path='/KintaiSubmitted' element={<CheckLogin component = {<KintaiSubmitted/>}/>}/>
                    <Route path='/*' element={<NotFound/>} />
                  </Routes>
                </Router>
              </IsSubmittedContext.Provider>
            </UserNameContext.Provider>
           </EmailContext.Provider>
        </EventsContext.Provider>
      </div>
    );
  }
  
export default App;