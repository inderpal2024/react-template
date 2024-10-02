import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

function App() {
  const [mode, setMode] = useState('watch');
  const [timeFormat, setTimeFormat] = useState(12);
  const [alarms, setAlarms] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmInput, setAlarmInput] = useState({ time: '', ampm: 'PM' });
  const [isAlarmValid, setIsAlarmValid] = useState(false);
  const [blink, setBlink] = useState(null);

  // Stopwatch states
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (mode === 'stopwatch' && isRunning) {
        setStopwatchTime(prevTime => prevTime + 1000);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isRunning]);

  useEffect(() => {
    const checkAlarm = () => {
      const timeStr = currentTime.toLocaleTimeString('en-US', { hour12: timeFormat === 12 });
      const alarmTriggered = alarms.find(alarm => alarm.time === timeStr && alarm.active);
      if (alarmTriggered && mode === 'watch') {
        setBlink(alarmTriggered);
        setTimeout(() => setBlink(null), 10000);
      }
    };
    checkAlarm();
  }, [currentTime, alarms, timeFormat, mode]);

  const handleAddAlarm = () => {
    if (isAlarmValid) {
      const newAlarm = {
        time: timeFormat === 12 ? `${alarmInput.time} ${alarmInput.ampm}` : alarmInput.time,
        active: true
      };
      setAlarms([...alarms, newAlarm].sort((a, b) => new Date(`1970/01/01 ${a.time}`) - new Date(`1970/01/01 ${b.time}`)));
      setAlarmInput({ time: '', ampm: 'PM' });
      setIsAlarmValid(false);
    }
  };

  const toggleAlarm = (index) => {
    const updatedAlarms = [...alarms];
    updatedAlarms[index].active = !updatedAlarms[index].active;
    setAlarms(updatedAlarms);
  };

  const formatTime = (time, format = timeFormat) => {
    return new Date(`1970/01/01 ${time}`).toLocaleTimeString('en-US', { hour12: format === 12 });
  };

  const handleStopwatch = (action) => {
    switch (action) {
      case 'start':
        setIsRunning(true);
        break;
      case 'stop':
        setIsRunning(false);
        setStopwatchTime(0);
        setLaps([]);
        break;
      case 'pause':
        setIsRunning(false);
        break;
      case 'resume':
        setIsRunning(true);
        break;
      case 'split':
        setLaps([...laps, stopwatchTime]);
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100 p-4 sm:p-8">
      <Tabs defaultValue="watch" className="w-full max-w-sm">
        <TabsList>
          <TabsTrigger value="watch">Watch</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
        </TabsList>
        <TabsContent value="watch">
          <Card className="w-full shadow-lg shadow-3d">
            <CardHeader className="text-center">
              <h2 className="text-4xl font-bold">
                {currentTime.toLocaleTimeString('en-US', { hour12: timeFormat === 12 })}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <Switch onCheckedChange={() => setTimeFormat(timeFormat === 12 ? 24 : 12)} checked={timeFormat === 24} />
              </div>
              <div className="flex items-center space-x-2">
                <Input 
                  value={alarmInput.time} 
                  onChange={(e) => {
                    setAlarmInput({...alarmInput, time: e.target.value});
                    setIsAlarmValid(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(e.target.value));
                  }} 
                  placeholder="HH:MM:SS" 
                />
                {timeFormat === 12 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">{alarmInput.ampm}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setAlarmInput({...alarmInput, ampm: 'AM'})}>AM</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAlarmInput({...alarmInput, ampm: 'PM'})}>PM</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button onClick={handleAddAlarm} disabled={!isAlarmValid}>Add Alarm</Button>
              </div>
            </CardContent>
            <CardFooter>
              {alarms.map((alarm, index) => (
                <div key={index} className={`flex justify-between items-center p-2 mb-2 rounded shadow ${alarm === blink ? 'blink-yellow' : alarm.active ? 'shadow-green-500' : 'shadow-gray-300'}`}>
                  <span>{formatTime(alarm.time)}</span>
                  <Switch checked={alarm.active} onCheckedChange={() => toggleAlarm(index)} />
                </div>
              ))}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="stopwatch">
          <Card className="w-full shadow-lg">
            <CardHeader>
              <h2 className="text-4xl text-center">
                {new Date(stopwatchTime).toISOString().substr(11, 8)}
              </h2>
            </CardHeader>
            <CardContent className="flex justify-center">
              {!isRunning && stopwatchTime === 0 && <Button onClick={() => handleStopwatch('start')}>Start</Button>}
              {isRunning && (
                <>
                  <Button onClick={() => handleStopwatch('stop')}>Stop</Button>
                  <Button onClick={() => handleStopwatch('pause')}>Pause</Button>
                  <Button onClick={() => handleStopwatch('split')}>Split</Button>
                </>
              )}
              {!isRunning && stopwatchTime > 0 && (
                <>
                  <Button onClick={() => handleStopwatch('resume')}>Resume</Button>
                  <Button onClick={() => handleStopwatch('stop')}>Reset</Button>
                </>
              )}
            </CardContent>
            <CardFooter>
              {laps.map((lap, idx) => (
                <div key={idx} className="text-center mb-2">{new Date(lap).toISOString().substr(11, 8)}</div>
              ))}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;