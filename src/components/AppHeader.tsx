import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Settings,
} from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';

interface AppHeaderProps {
  onSettingsClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSettingsClick }) => {
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          WorkflowForge
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit" onClick={toggleTheme} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          {onSettingsClick && (
            <IconButton color="inherit" onClick={onSettingsClick} aria-label="Open settings">
              <Settings />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;