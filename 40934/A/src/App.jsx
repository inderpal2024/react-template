import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function App() {
  const [mode, setMode] = useState('watch');
  const [timeFormat, setTimeFormat] = useState(12);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [alarmTime, setAlarmTime] = useState({ hours: '', minutes: '', seconds: '', period: 'AM' });
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isStopwatchRunning) {
      const stopwatchTimer = setInterval(() => setStopwatchTime(prev => prev + 1), 1000);
      return () => clearInterval(stopwatchTimer);
    }
  }, [isStopwatchRunning]);

  const toggleMode = () => setMode(prev => prev === 'watch' ? 'stopwatch' : 'watch');

  const formatTime = (date, format = timeFormat) => {
    let hours = date.getHours();
    let period = '';
    if (format === 12) {
      period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    }
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds} ${period}`;
  };

  const addAlarm = () => {
    if (!isValidTime(alarmTime)) return;
    const newAlarm = { ...alarmTime, time: `${alarmTime.hours}:${alarmTime.minutes}:${alarmTime.seconds} ${alarmTime.period}` };
    if (!alarms.some(alarm => alarm.time === newAlarm.time)) {
      setAlarms(prev => [...prev, newAlarm].sort((a, b) => new Date('1970/01/01 ' + a.time) - new Date('1970/01/01 ' + b.time)));
      setAlarmTime({ hours: '', minutes: '', seconds: '', period: 'AM' });
    }
  };

  const isValidTime = (timeObj) => {
    const { hours, minutes, seconds } = timeObj;
    return hours && minutes && seconds && 
           hours >= (timeFormat === 12 ? 1 : 0) && hours < (timeFormat === 12 ? 13 : 24) &&
           minutes >= 0 && minutes < 60 && 
           seconds >= 0 && seconds < 60;
  };

  const handleStopwatch = (action) => {
    switch(action) {
      case 'start': setIsStopwatchRunning(true); break;
      case 'stop': setIsStopwatchRunning(false); setStopwatchTime(0); setLaps([]); break;
      case 'pause': setIsStopwatchRunning(false); break;
      case 'resume': setIsStopwatchRunning(true); break;
      case 'split': setLaps(prev => [...prev, stopwatchTime]); break;
      default: break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>{mode === 'watch' ? 'Watch' : 'Stopwatch'}</span>
            <Switch onCheckedChange={toggleMode} />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl mb-4 shadow-md p-4 rounded-lg">
            {mode === 'watch' ? formatTime(currentTime) : 
             `${String(Math.floor(stopwatchTime / 3600)).padStart(2, '0')}:${String(Math.floor((stopwatchTime % 3600) / 60)).padStart(2, '0')}:${String(stopwatchTime % 60).padStart(2, '0')}`}
          </div>
          {mode === 'watch' ? (
            <div>
              <Switch checked={timeFormat === 24} onCheckedChange={() => setTimeFormat(timeFormat === 12 ? 24 : 12)} />
              <Label>{timeFormat === 12 ? '12h' : '24h'}</Label>
              <div>
                <Input 
                  type="number" 
                  placeholder="HH" 
                  value={alarmTime.hours} 
                  onChange={e => setAlarmTime(prev => ({...prev, hours: e.target.value}))}
                  className="w-16"
                />
                <Input 
                  type="number" 
                  placeholder="MM" 
                  value={alarmTime.minutes} 
                  onChange={e => setAlarmTime(prev => ({...prev, minutes: e.target.value}))}
                  className="w-16"
                />
                <Input 
                  type="number" 
                  placeholder="SS" 
                  value={alarmTime.seconds} 
                  onChange={e => setAlarmTime(prev => ({...prev, seconds: e.target.value}))}
                  className="w-16"
                />
                {timeFormat === 12 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">{alarmTime.period}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setAlarmTime(prev => ({...prev, period: 'AM'}))}>AM</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAlarmTime(prev => ({...prev, period: 'PM'}))}>PM</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button onClick={addAlarm} disabled={!isValidTime(alarmTime)}>Add Alarm</Button>
              </div>
            </div>
          ) : (
            <div>
              {!isStopwatchRunning ? 
                <Button onClick={() => handleStopwatch('start')}>Start</Button> :
                <>
                  <Button onClick={() => handleStopwatch('stop')}>Stop</Button>
                  <Button onClick={() => handleStopwatch(isStopwatchRunning ? 'pause' : 'resume')}>
                    {isStopwatchRunning ? 'Pause' : 'Resume'}
                  </Button>
                  <Button onClick={() => handleStopwatch('split')}>Split</Button>
                </>
              }
            </div>
          )}
        </CardContent>
        <CardContent>
          {mode === 'watch' ? alarms.map((alarm, index) => (
            <div key={index} className="flex justify-between items-center mb-2 shadow-sm p-2">
              {formatTime(new Date('1970/01/01 ' + alarm.time), timeFormat)}
              <Switch />
            </div>
          )) : (
            <div>
              {laps.map((lap, index) => (
                <div key={index} className="mb-2">
                  Lap {index + 1}: {String(Math.floor(lap / 3600)).padStart(2, '0')}:{String(Math.floor((lap % 3600) / 60)).padStart(2, '0')}:{String(lap % 60).padStart(2, '0')}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;