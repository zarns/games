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
    label: i === 0 ? "Lower G Value" : i === 3 ? "Higher G Value" : "",
    invisibleLabel: i !== 0 && i !== 3 ? "G" : "",
  }));

  return (
    <div className="legend-container" style={{
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      margin: '20px',
    }}>
    <div className="border-b border-orange-500 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-orange-500 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:border-orange-500 lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        <div className="legend-full-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Legend section */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '100px' }}>
            {/* Static Legend */}
            <div className="static-legend" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
              {staticLegendData.map((item, index) => (
                <div key={index} className="legend-item" style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: item.color, marginRight: '10px', border: '1px solid #fff', borderRadius: '50%' }}></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            {/* Path Legend */}
            <div className="path-legend" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
              {pathLegendData.map((item, index) => (
                <div key={index} className="legend-item" style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: item.color, marginRight: '10px', border: '1px solid #fff', borderRadius: '50%' }}></div>
                  <span>{item.label}</span>
                  <span style={{ visibility: 'hidden' }}>{item.invisibleLabel}</span>
                </div>
              ))}
            </div>
          {/* Instructions section */}
          <div className="instructions-section" style={{ flex: 4, marginLeft: '50px' }}>
            <p>Delve into the mechanics of the D* lite algorithm.</p>
            <p>Click or drag the grid to add and remove obstacles.</p>
            <p>Use the buttons to move the user forward.</p>
            <p>Block a path, then rerun ComputeShortestPath.</p>
          </div>

          {/* Links section */}
          <div className="links-section" style={{ flex: 1, marginLeft: '50px' }}>
            <ul>
              <li><a href="https://cdn.aaai.org/AAAI/2002/AAAI02-072.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db'}}>Original Paper</a></li>
              <li><a href="https://github.com/zarns" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db'}}>Source Code</a></li>
              <li><a href="https://mason.zarns.net" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db'}}>My Portfolio</a></li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legend;
