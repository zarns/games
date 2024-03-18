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
      background: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)', // Example gradient from purple to blue
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      margin: '20px',
      color: 'white', // Adjust text color for better readability on gradient background
    }}>
      <div className="legend-full-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Legend section */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '20px' }}>
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
        </div>
        {/* Instructions & Links section */}
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2>Instructions & Resources</h2>
          <p>This visualization helps you understand how the pathfinding algorithm works.</p>
          <ul>
            <li>For more details, check the <a href="https://link-to-original-paper" target="_blank" rel="noopener noreferrer" style={{ color: '#aff'}}>original paper</a>.</li>
            <li>Explore more of my projects on <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" style={{ color: '#aff'}}>GitHub</a>.</li>
            <li>Visit my <a href="https://yourportfolio.com" target="_blank" rel="noopener noreferrer" style={{ color: '#aff'}}>portfolio</a> for a comprehensive overview of my work.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Legend;
