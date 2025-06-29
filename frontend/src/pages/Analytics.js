import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Analytics = () => {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#004c91' }}>
        Analytics & Insights
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Advanced Supply Chain Analytics
        </Typography>
        <Typography variant="body1">
          Comprehensive analytics platform featuring:
        </Typography>
        <Box sx={{ mt: 2 }}>
          <ul>
            <li>AI-powered demand forecasting</li>
            <li>Performance metrics</li>
            <li>Predictive analytics</li>
            <li>Interactive dashboards</li>
            <li>Custom reporting</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default Analytics; 