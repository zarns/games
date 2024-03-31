// Legend.tsx
import React from 'react';
import { CellUtility } from './Types';

const Legend = () => {
  const staticLegendData = [
    { color: 'green', label: 'Current' },
    { color: 'red', label: 'Goal' },
    { color: 'black', label: 'Obstacle' },
    { color: 'gray', label: 'Unknown' },
  ];

  const pathLegendData = Array.from({ length: 4 }, (_, i) => ({
    color: CellUtility.colorScale(i * 3),
    label: i === 0 ? 'Lower G Value' : i === 3 ? 'Higher G Value' : "",
    invisibleLabel: i !== 0 && i !== 3 ? "G" : "",
  }));

  return (
    <div className="border-b border-orange-500 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-orange-500 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:border-orange-500 lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
      <div className="legend-container" style={{
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        margin: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        fontSize: '1.2em',
      }}>
        {/* Legend sections */}
        <div className="legend-section" style={{ display: 'flex', gap: '100px', flex: 1 }}>
          <div className="static-legend">
            {staticLegendData.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: item.color, marginRight: '10px', borderRadius: '50%' }}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="path-legend">
            {pathLegendData.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: item.color, marginRight: '10px', borderRadius: '50%' }}></div>
                <span>{item.label}</span>
                <span style={{ visibility: 'hidden' }}>{item.invisibleLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions section */}
        <div className="instructions-section" style={{ flex: 1 }}>
          <h3>Instructions:</h3>
          <ul>
            <li>Click or drag on the grid to add/remove obstacles.</li>
            <li>Use the "Move Forward" button to advance.</li>
            <li>Block a path and recompute to see the algorithm adapt.</li>
            <li>Click "Reinitialize" to clear the grid and start over.</li>
          </ul>
        </div>

        {/* Links section */}
        <div className="links-section" style={{ flex: 1, marginLeft: '50px' }}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li><a href="https://cdn.aaai.org/AAAI/2002/AAAI02-072.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db'}}>Original Paper</a></li>
            <li><a href="https://github.com/zarns" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db'}}>Source Code</a></li>
            <li><a href="https://mason.zarns.net" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db'}}>My Portfolio</a></li>
            <li><a href="https://en.wikipedia.org/wiki/D*" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db'}}>D* lite Wiki</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Legend;
