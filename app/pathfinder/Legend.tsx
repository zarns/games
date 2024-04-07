// Legend.tsx
import React from 'react';
import { CellUtility } from './Types';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { Typography } from '@mui/material';

interface LegendProps {
  setDelayTime: React.Dispatch<React.SetStateAction<number>>;
  setNumRandomized: React.Dispatch<React.SetStateAction<number>>;
}

const Legend: React.FC<LegendProps> = ({ setDelayTime, setNumRandomized }) => {
  const staticLegendData = [
    { color: 'green', label: 'Current' },
    { color: 'red', label: 'Goal' },
    { color: 'black', label: 'Obstacle' },
    { color: 'gray', label: 'Unknown' },
  ];

  const pathLegendData = Array.from({ length: 4 }, (_, i) => ({
    color: CellUtility.colorScale(i * 9),
    label: i === 0 ? 'Closer' : i === 3 ? 'Further' : "",
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
          <div className="legend-section" style={{ display: 'flex', gap: '100px', flex: 1 }}>
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
        </div>

        {/* Instructions section
        <div className="instructions-section" style={{ flex: 1, justifyContent: 'flex-start' }}>
          <h3>Instructions:</h3>
          <ul>
            <li>Click or drag on the grid to add/remove obstacles.</li>
            <li>Use the "Move Forward" button to advance.</li>
            <li>Block a path and recompute to see the algorithm adapt.</li>
            <li>Click "Reinitialize" to clear the grid and start over.</li>
          </ul>
        </div> */}

        {/* Sliders section */}
        {/* <div className="sliders-section" style={{ flex: 1 }}>
          <Box sx={{ width: 320 }}>
            <Typography gutterBottom>numRows</Typography>
            <Slider aria-label="Default" valueLabelDisplay="auto" 
              defaultValue={18}
              min={3}
              max={20}
              onChange={(event, newValue) => setNumRows(newValue as number)}
              />
            <Typography gutterBottom>numCols</Typography>
            <Slider aria-label="Default" valueLabelDisplay="auto" 
              defaultValue={30}
              min={3}
              max={50}
              onChange={(event, newValue) => setNumCols(newValue as number)}
              />          
          </Box>
        </div> */}
        <div className="sliders-section" style={{ flex: 1 }}>
          <Box sx={{ width: 320 }}>
            <Typography gutterBottom>delayTime</Typography>
            <Slider aria-label="Default" valueLabelDisplay="auto" 
              defaultValue={1}
              min={0}
              max={500}
              onChange={(event, newValue) => setDelayTime(newValue as number)}
              />              
            <Typography gutterBottom>numRandomized</Typography>
            <Slider aria-label="Default" valueLabelDisplay="auto" 
              defaultValue={50}
              min={5}
              max={200}
              onChange={(event, newValue) => setNumRandomized(newValue as number)}
              />  
          </Box>
        </div>

        {/* Links section */}
        <div className="links-section" style={{ flex: 1 }}>
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
