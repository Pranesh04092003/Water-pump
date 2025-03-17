import React, { createContext, useState, useContext } from 'react';

const PumpContext = createContext();

export const PumpProvider = ({ children }) => {
  const [pumpData, setPumpData] = useState({
    status: 'Normal',
    vibration: 0,
    health_score: 0,
    cooling_status: 'Efficient',
    cooling_metrics: { duration: 0, reduction: 0 },
    counts: { status: { Normal: 0, Overheating: 0, Failure: 0 }, cooling: { Efficient: 0, Inefficient: 0 } },
    history: { vibration: [], cooling: [] }
  });

  return (
    <PumpContext.Provider value={{ pumpData, setPumpData }}>
      {children}
    </PumpContext.Provider>
  );
};

export const usePump = () => {
  const context = useContext(PumpContext);
  if (!context) {
    throw new Error('usePump must be used within a PumpProvider');
  }
  return context;
};
