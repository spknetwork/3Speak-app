//Path: src\renderer\views\PoAView\PoAViewContent.tsx
import React, { useEffect, useRef, useState, RefObject } from 'react';
import { Form, Button, OverlayTrigger, Tooltip, Card } from 'react-bootstrap';
import { IoIosRadioButtonOn } from 'react-icons/io';
import { usePoAState } from './PoAStateContext';
import { usePoAProgramRunner } from './usePoAProgramRunner';

interface PoAViewContentProps {
  isPoARunning: boolean;
  updatePoA: () => Promise<void>;
  runPoA: () => Promise<void>;
  stopPoA: () => void;
  terminalRef: RefObject<HTMLDivElement>;

  // Add the new properties
  storageSize: number;
  autoPin: boolean;
  setStorageSize: React.Dispatch<React.SetStateAction<number>>;
  setAutoPin: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PoAViewContent: React.FC<PoAViewContentProps> = ({
                                                                isPoARunning,
                                                                updatePoA,
                                                                runPoA,
                                                                terminalRef,
                                                                autoPin,
                                                                storageSize,
                                                                setAutoPin,
                                                                setStorageSize,
                                                              }) => {
  const { logs, validatorOnline, setValidatorOnline } = usePoAState();
  const [isDataReceived, setIsDataReceived] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState({
    syncStatus: '',
    peers: '',
    peersCount: '',
    nodeName: '',
    nodeType: '',
    validators: '',
    validatorsCount: '',
    networkStorage: '',
    syncedPercentage: '',
  });
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket('ws://localhost:8000/getstats');

      ws.current.onopen = () => {
        ws.current.send(JSON.stringify({ command: 'getstats' }));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data) {
          setIsDataReceived(true);
          if (data.Status && data.Status.Sync === "true") {
            setValidatorOnline(true);
          } else {
            setValidatorOnline(false);
          }
          setStats(prevStats => ({
            ...prevStats,
            syncStatus: data.Status.Sync,
            peers: data.Status.Peers,
            peersCount: data.Status.PeersCount,
            nodeName: data.Status.Node,
            nodeType: data.Status.Type,
            validators: data.Status.Validators,
            validatorsCount: data.Status.ValidatorCount,
            networkStorage: data.Status.NetworkStorage,
            syncedPercentage: data.Status.SyncedPercentage,
          }));
        }
      };

      ws.current.onerror = () => {
        setIsDataReceived(false);
        setValidatorOnline(false);
      };
    }, 1000);

    return () => {
      clearInterval(intervalId);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);


  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.innerHTML = '';
      logs.forEach(log => {
        const newLogElement = document.createElement('div');
        newLogElement.innerHTML = log;
        terminalRef.current?.appendChild(newLogElement);
      });
      terminalRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, terminalRef]);


  const handleAutoPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoPin(e.target.checked);
  };

  const handleStorageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStorageSize(Number(e.target.value));
  };
  const startPoA = async () => {
    if (!isPoARunning && !isDataReceived && !isUpdating) {
      console.log('starting PoA');
      setIsUpdating(true);
      await updatePoA();
      setIsUpdating(false);
      runPoA();
    } else {
      console.log('PoA is already running');
    }
  };
  const stopPoA = () => {
    fetch('http://localhost:8000/shutdown', {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div style={{ padding: '5px', overflow: 'hidden' }}>
      <h3>Proof of Access.</h3>
      <p>
        Enable the Proof of Access feature to earn rewards for storing data on your computer.
      </p>
      <b>
        To test proof of access you can go to <a href="http://spk.tv" target="_blank">http://spk.tv</a>
      </b>
      <p>
        <div>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="run-proof-of-access-tooltip">{isDataReceived ? 'Stop' : isUpdating ? 'Downloading...' : 'Start'} Proof of Access software</Tooltip>}
          >
            <Button
              variant="light"
              size="sm"
              disabled={isUpdating}
              onClick={isDataReceived ? stopPoA : startPoA}
            >
              <span>{isDataReceived ? 'Stop' : isUpdating ? 'Downloading...' : 'Start'} Proof of Access</span>
            </Button>
          </OverlayTrigger>
          <IoIosRadioButtonOn style={{ color: validatorOnline ? 'green' : 'red' }} />
          <Form.Check
            type="checkbox"
            label="Auto Pin"
            checked={autoPin}
            onChange={handleAutoPinChange}
            disabled={isPoARunning}
          />
          <p>Enter storage size in GB to auto pin</p>
          <Form.Control
            type="number"
            title="Enter storage size in GB to auto pin"
            value={storageSize}
            onChange={handleStorageSizeChange}
            min={0}
            placeholder="Enter storage size in GB"
            disabled={isPoARunning}
          />
        </div>
      </p>
      <h1>SPK Network Stats</h1>
      <Card className="stats-card">
        <h2>Network Status: <span style={{ color: validatorOnline ? 'green' : 'red' }}>{validatorOnline ? 'Synced' : 'Not Synced'}</span></h2>
      </Card>
      <Card className="stats-card">
        <h2>ValidatorCount Count: <span>{stats.validatorsCount}</span></h2>
      </Card>
      <Card className="stats-card">
        <h2>Node Name: <span>{stats.nodeName}</span></h2>
      </Card>
      <Card className="stats-card">
        <h2>Node Type: <span>{stats.nodeType}</span></h2>
      </Card>
      <Card className="stats-card">
        <h2>Validators: <span>{stats.validators}</span></h2>
      </Card>
      <Card className="stats-card">
        <h2>Local Pins: <span>{stats.networkStorage}</span></h2>
        <div style={{ height: '20px', width: `${stats.syncedPercentage}%`, backgroundColor: 'green' }}>
          <span style={{ position: 'relative', color: 'white', textAlign: 'center', verticalAlign: 'middle', lineHeight: '20px' }}>{stats.syncedPercentage}%</span>
        </div>
      </Card>
    </div>
  );
};
