import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Suppliers = () => {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#004c91' }}>
        Supplier Management
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Supplier Relationship Management
        </Typography>
        <Typography variant="body1">
          Comprehensive supplier management system featuring:
        </Typography>
        <Box sx={{ mt: 2 }}>
          <ul>
            <li>Supplier profiles and contacts</li>
            <li>Performance tracking</li>
            <li>Contract management</li>
            <li>Purchase order automation</li>
            <li>Quality assessments</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default Suppliers; 