import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  FormControlLabel,
  Switch,
  Paper,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface AdvancedSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  n8nApiUrl: string;
  onN8nApiUrlChange: (value: string) => void;
  n8nApiKey: string;
  onN8nApiKeyChange: (value: string) => void;
  autoValidate: boolean;
  onAutoValidateChange: (value: boolean) => void;
  enableTestMode: boolean;
  onEnableTestModeChange: (value: boolean) => void;
  rememberApiKey: boolean;
  onRememberApiKeyChange: (value: boolean) => void;
}

const AdvancedSettingsDrawer: React.FC<AdvancedSettingsDrawerProps> = ({
  open,
  onClose,
  n8nApiUrl,
  onN8nApiUrlChange,
  n8nApiKey,
  onN8nApiKeyChange,
  autoValidate,
  onAutoValidateChange,
  enableTestMode,
  onEnableTestModeChange,
  rememberApiKey,
  onRememberApiKeyChange,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Advanced Settings</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            n8n Integration
          </Typography>

          <TextField
            fullWidth
            label="n8n API URL"
            placeholder="https://your-n8n-instance.com/api/v1"
            value={n8nApiUrl}
            onChange={(e) => onN8nApiUrlChange(e.target.value)}
            sx={{ mb: 2 }}
            size="small"
          />

          <TextField
            fullWidth
            label="n8n API Key"
            type="password"
            placeholder="Your n8n API key"
            value={n8nApiKey}
            onChange={(e) => onN8nApiKeyChange(e.target.value)}
            size="small"
          />
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Workflow Options
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={autoValidate}
                onChange={(e) => onAutoValidateChange(e.target.checked)}
              />
            }
            label="Auto-validate JSON"
          />

          <FormControlLabel
            control={
              <Switch
                checked={enableTestMode}
                onChange={(e) => onEnableTestModeChange(e.target.checked)}
              />
            }
            label="Enable test mode"
          />

          <FormControlLabel
            control={
              <Switch
                checked={rememberApiKey}
                onChange={(e) => onRememberApiKeyChange(e.target.checked)}
              />
            }
            label="Remember API key on this device"
          />
        </Paper>
      </Box>
    </Drawer>
  );
};

export default AdvancedSettingsDrawer;