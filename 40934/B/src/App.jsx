import React, { useState, useEffect, useCallback } from 'react';
import { Button, Toggle, Input, Select, SelectItem } from "@/components/ui";
import { cn } from "@/lib/utils";

// Component for displaying time
function TimeDisplay({ time, format24 }) {
  const displayTime = format24 ? time : time.toLocaleTimeString('en-US', { hour12: !format24 });
  return <div className="text-4xl text-center mb-4 shadow-3d">{displayTime}</div>;
}

// Component for Alarm Entry
function AlarmEntry({ alarm, onToggle, isCurrentTime, isActive }) {
  const shadowColor = isActive ? (isCurrentTime ? 'yellow' : 'green') : 'gray';
  return (
    <div className={`p-2 my-1 rounded shadow-md ${cn('shadow-' + shadowColor)}`}>
      <span>{alarm.time}</span>
      <Toggle onToggle={() => onToggle(alarm.id)} enabled={isActive} />
    </div>
  );
}

// Main App Component
export default function App() {
  const [mode, setMode] = useState('watch');
  const [time, setTime] = useState(new Date());
  const [format24, setFormat24] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [newAlarm, setNewAlarm] = useState({ time: '', period: time.getHours() >= 12 ? 'PM' : 'AM' });
  const [stopwatch, setStopwatch] = useState({ running: false, time: 0, laps: [] });
  const [blink, setBlink] = useState(false);

  // Clock ticking
  useEffect(() => {
    const timerID = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerID);
  }, []);

  // Stopwatch functionality
  useEffect(() => {
    let interval = null;
    if (stopwatch.running) {
      interval = setInterval(() => {
        setStopwatch(prev => ({...prev, time: prev.time + 1000}));
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [stopwatch.running]);

  // Alarm check
  useEffect(() => {
    const checkAlarms = () => {
      const currentTime = time.toTimeString().split(' ')[0];
      alarms.forEach(alarm => {
        if (alarm.time === currentTime && alarm.active) {
          setBlink(true);
          setTimeout(() => setBlink(false), 10000);
        }
      });
    };
    checkAlarms();
  }, [time, alarms]);

  const toggleMode = () => setMode(prev => prev === 'watch' ? 'stopwatch' : 'watch');
  
  // Alarm functions
  const addAlarm = () => {
    if (newAlarm.time && !alarms.some(a => a.time === newAlarm.time)) {
      setAlarms([...alarms, { id: Date.now(), time: newAlarm.time, active: true }]);
      setNewAlarm({ time: '', period: 'AM' });
    }
  };

  const toggleAlarm = (id) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, active: !alarm.active } : alarm
    ));
  };

  // Stopwatch controls
  const startStopwatch = () => setStopwatch({...stopwatch, running: true});
  const stopStopwatch = () => setStopwatch({...stopwatch, running: false, time: 0});
  const pauseResumeStopwatch = () => setStopwatch(prev => ({...prev, running: !prev.running}));
  const splitTime = () => setStopwatch(prev => ({...prev, laps: [...prev.laps, prev.time]}));

  return (
    <div className="container mx-auto p-4">
      <Toggle 
        options={[{value: 'watch', label: 'Watch'}, {value: 'stopwatch', label: 'Stopwatch'}]} 
        value={mode} 
        onChange={toggleMode} 
        className="mb-4 shadow-md"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center">
          {mode === 'watch' ? (
            <>
              <TimeDisplay time={time} format24={format24} />
              <div>
                <Toggle onToggle={() => setFormat24(!format24)} enabled={format24}>24hr</Toggle>
                <Input 
                  value={newAlarm.time} 
                  onChange={(e) => setNewAlarm({...newAlarm, time: e.target.value})} 
                  placeholder="HH:MM:SS" 
                />
                { !format24 && 
                  <Select value={newAlarm.period} onChange={(val) => setNewAlarm({...newAlarm, period: val})}>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </Select>
                }
                <Button disabled={!newAlarm.time} onClick={addAlarm}>Add Alarm</Button>
              </div>
            </>
          ) : (
            <>
              <TimeDisplay time={new Date(stopwatch.time)} format24={true} />
              {stopwatch.time === 0 ? 
                <Button onClick={startStopwatch}>Start</Button> :
                <>
                  <Button onClick={stopStopwatch}>Stop</Button>
                  <Button onClick={pauseResumeStopwatch}>{stopwatch.running ? 'Pause' : 'Resume'}</Button>
                  <Button onClick={splitTime}>Split</Button>
                </>
              }
            </>
          )}
        </div>
        <div className="info-region">
          {mode === 'watch' ? 
            alarms.map(alarm => (
              <AlarmEntry 
                key={alarm.id} 
                alarm={alarm} 
                onToggle={toggleAlarm} 
                isCurrentTime={alarm.time === time.toTimeString().split(' ')[0]}
                isActive={alarm.active}
              />
            )) :
            stopwatch.laps.map((lap, index) => 
              <div key={index}>{new Date(lap).toISOString().substr(11, 8)}</div>
            )
          }
        </div>
      </div>
      {blink && <div className="blink-overlay" onClick={() => setBlink(false)}></div>}
    </div>
  );
}