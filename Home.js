import { useContext} from "react";
import UserContext from "./UserContext";
import './PomodoroApp.css';
import Timer from "./Timer";
import Settings from './Settings';
import TodoList from './TodoList';
import { useState } from 'react';
import SettingsContext from './SettingsContext';


function Home() {

    const [showSettings, setShowSettings] = useState(false);
    const [showTodoList, setShowTodoList] = useState(false);
    const [workMinutes, setWorkMinutes] = useState(45);
    const [breakMinutes, setBreakMinutes] = useState(15)
    const userInfo = useContext(UserContext);

    if (!userInfo.email) {
        return 'Log in or register to view home page.';
    }

    return <main >
        <SettingsContext.Provider value={{
        showSettings,
        setShowSettings,
        workMinutes,
        breakMinutes,
        setWorkMinutes,
        setBreakMinutes,
        showTodoList,
        setShowTodoList,
      }}>
        {showSettings ? (
          <Settings />
        ) : showTodoList ? (
          <TodoList />
        ) : (
            <Timer />
        )}
      </SettingsContext.Provider>
    </main>
      
    

    
}

export default Home;
