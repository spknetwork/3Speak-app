// filename: PoAStateContext.tsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

interface PoAStateContextType {
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

const PoAStateContext = createContext<PoAStateContextType>({
  logs: [],
  setLogs: () => {},
});

export const PoAStateProvider: React.FC = ({ children }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.innerHTML = '';
      logs.forEach(log => terminalRef.current.innerHTML += log + '<br/>');
    }
  }, [logs, terminalRef]);

  return (
    <PoAStateContext.Provider value={{ logs, setLogs }}>
      {children}
    </PoAStateContext.Provider>
  );
};

export const usePoAState = () => useContext(PoAStateContext);
