// filename: PoAStateContext.tsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

interface PoAStateContextType {
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  validatorOnline: boolean;
  setValidatorOnline: React.Dispatch<React.SetStateAction<boolean>>;
}

const PoAStateContext = createContext<PoAStateContextType>({
  logs: [],
  setLogs: () => {},
  validatorOnline: false,
  setValidatorOnline: () => {},
});

export const PoAStateProvider: React.FC = ({ children }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [validatorOnline, setValidatorOnline] = useState<boolean>(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.innerHTML = '';
      logs.forEach(log => terminalRef.current.innerHTML += log + '<br/>');
    }
  }, [logs, terminalRef]);

  return (
    <PoAStateContext.Provider value={{ logs, setLogs, validatorOnline, setValidatorOnline }}>
      {children}
    </PoAStateContext.Provider>
  );
};

export const usePoAState = () => useContext(PoAStateContext);
