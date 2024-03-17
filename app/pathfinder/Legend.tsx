// Legend.tsx
import React from 'react';
import { Cell, CellUtility, GridUtility } from './Types';

type LegendProps = {
  data: { color: string; label: string }[];
};

const legendData = [
  { color: 'green', label: 'Start' },
  { color: 'red', label: 'Finish' },
  { color: 'black', label: 'Obstacle' },
  { color: 'gray', label: 'Unknown' },
  { color: CellUtility.colorScale(0),  label: 'Path' },
];

const Grid: React.FC = () => {

  return (
    <div>
      <Legend />
    </div>
  );
};

const Legend: React.FC = () => {
  return (
    <div className="border-b border-orange-500 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-orange-500 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:border-orange-500 lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
      {legendData.map((item, index) => (
        <div key={index} className="legend-item" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: item.color, marginRight: '10px' }}></div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
