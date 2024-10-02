import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Toggle, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

function App() {
  const [mode, setMode] = useState('watch');
  const [format, setFormat] = useState('12');
  const [alarms, setAlarms] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const intervalRef = useRef(null);

  // Time formatting function
  const formatTime = (time, timeFormat = format) => {
    let hours = time.getHours();
    let suffix = 'AM';
    if (timeFormat === '24') {
      return time.toTimeString().split(' ')[0];
    } else {
      if (hours >= 12) {
        suffix = 'PM';
        hours -= 12;
      }
      if (hours === 0) hours = 12;
      return `${hours}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')} ${suffix}`;
    }
  };

  // Handle alarm setting
  const [alarmTime, setAlarmTime] = useState({ hours: '', minutes: '', seconds: '', period: 'PM' });
  const isValidTime = (h, m, s) => h < (format === '12' ? 13 : 24) && m < 60 && s < 60;
  
  const canAddAlarm = () => {
    const { hours, minutes, seconds } = alarmTime;
    return isValidTime(hours, minutes, seconds) && !alarms.some(a => formatTime(a.time) === formatTime(new Date(`2000-01-01T${hours}:${minutes}:${seconds}${alarmTime.period}`)));
  };

  const addAlarm = () => {
    if (canAddAlarm()) {
      const newAlarm = new Date(`2000-01-01T${alarmTime.hours}:${alarmTime.minutes}:${alarmTime.seconds}${alarmTime.period}`);
      setAlarms([...alarms, { time: newAlarm, active: false }].sort((a, b) => a.time - b.time));
      setAlarmTime({ hours: '', minutes: '', seconds: '', period: 'PM' });
    }
  };

  // Stopwatch functions
  useEffect(() => {
    if (isStopwatchRunning) {
      intervalRef.current = setInterval(() => setStopwatchTime(prevTime => prevTime + 1000), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isStopwatchRunning]);

  const startStopwatch = () => setIsStopwatchRunning(true);
  const stopStopwatch = () => setIsStopwatchRunning(false);
  const resetStopwatch = () => setStopwatchTime(0);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center p-4 sm:p-8">
      <Tabs defaultValue="watch" className="w-full max-w-lg">
        <TabsList>
          <TabsTrigger value="watch">Watch</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
        </TabsList>
        <TabsContent value="watch">
          <div className="text-4xl my-4 shadow-lg shadow-indigo-500/50">{formatTime(currentTime)}</div>
          <div className="flex flex-col space-y-2">
            <Toggle onToggle={() => setFormat(format === '12' ? '24' : '12')}>24 Hour Format</Toggle>
            <div className="flex items-center">
              <Input type="number" placeholder="HH" value={alarmTime.hours} onChange={(e) => setAlarmTime({...alarmTime, hours: e.target.value})} />
              <span className="mx-2">:</span>
              <Input type="number" placeholder="MM" value={alarmTime.minutes} onChange={(e) => setAlarmTime({...alarmTime, minutes: e.target.value})} />
              <span className="mx-2">:</span>
              <Input type="number" placeholder="SS" value={alarmTime.seconds} onChange={(e) => setAlarmTime({...alarmTime, seconds: e.target.value})} />
              {format === '12' && (
                <select value={alarmTime.period} onChange={(e) => setAlarmTime({...alarmTime, period: e.target.value})}>
                  <option>AM</option>
                  <option>PM</option>
                </select>
              )}
              <Button disabled={!canAddAlarm()} onClick={addAlarm}>Add Alarm</Button>
            </div>
          </div>
          <div className="mt-4">
            {alarms.map((alarm, idx) => (
              <div key={idx} className={cn("p-2 my-1 rounded", alarm.active ? "shadow-green-500" : "shadow-gray-400")}>
                {formatTime(alarm.time, format)}
                <Toggle onToggle={() => {
                  let newAlarms = [...alarms];
                  newAlarms[idx].active = !alarm.active;
                  setAlarms(newAlarms);
                }} />
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="stopwatch">
          <div className="text-4xl my-4">{new Date(stopwatchTime).toISOString().substr(11, 8)}</div>
          <div>
            {!isStopwatchRunning ? 
              <Button onClick={startStopwatch}>Start</Button> : 
              <>
                <Button onClick={stopStopwatch}>Stop</Button>
                <Button onClick={resetStopwatch}>Reset</Button>
              </>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;