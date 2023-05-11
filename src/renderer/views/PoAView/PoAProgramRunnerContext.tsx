// file: PoAProgramRunnerContext.tsx
import React, { useState, useRef, useContext } from 'react';
import ProgramRunner from '../../../main/core/components/ProgramRunner';

interface PoAProgramRunnerContextProps {
  programRunner: ProgramRunner | null;
  setProgramRunner: (runner: ProgramRunner | null) => void;
  terminalRef: React.RefObject<HTMLDivElement>;
}

const PoAProgramRunnerContext = React.createContext<PoAProgramRunnerContextProps | undefined>(undefined);

interface PoAProgramRunnerProviderProps {
  children: React.ReactNode;
}

export const PoAProgramRunnerProvider: React.FC<PoAProgramRunnerProviderProps> = ({ children }) => {
  const [programRunner, setProgramRunner] = useState<ProgramRunner | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  return (
    <PoAProgramRunnerContext.Provider value={{ programRunner, setProgramRunner, terminalRef }}>
      {children}
    </PoAProgramRunnerContext.Provider>
  );
};

export const usePoAProgramRunnerContext = (): PoAProgramRunnerContextProps => {
  const context = useContext(PoAProgramRunnerContext);
  if (!context) {
    throw new Error('usePoAProgramRunnerContext must be used within a PoAProgramRunnerProvider');
  }
  return context;
};

export default PoAProgramRunnerContext;
