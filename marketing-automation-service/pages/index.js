import React from 'react';
import Head from 'next/head';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Chip,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export default function Home() {
  return (
    <Box>
      <Head>
        <title>Marketing Automation Service</title>
        <meta name="description" content="Complete marketing automation system for agencies and service providers" />
      </Head>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 6,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 4
        }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Marketing Automation Service
          </Typography>
          <Typography variant="h5" paragraph>
            Transform your marketing with AI-powered automation
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            href="/dashboard"
            startIcon={<DashboardIcon />}
            sx={{ 
              mt: 2, 
              backgroundColor: 'white', 
              color: '#667eea',
              '&:hover': {
                backgroundColor: '#f0f0f0'
              }
            }}
          >
            Go to Dashboard
          </Button>
        </Box>

        {/* Status Alert */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <strong>System Status:</strong> Local development server running. 
          Ensure all environment variables are configured in .env.local file.
        </Alert>

        {/* Features Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <DashboardIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Admin Dashboard
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Monitor your marketing performance, manage campaigns, and track analytics in real-time.
                </Typography>
                <Button 
                  href="/dashboard" 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  endIcon={<DashboardIcon />}
                >
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <SettingsIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  API Endpoints
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Instagram DM, WhatsApp leads, and email campaigns automation.
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label="POST /api/instagram-dm" size="small" sx={{ m: 0.5 }} />
                  <Chip label="POST /api/whatsapp-leads" size="small" sx={{ m: 0.5 }} />
                  <Chip label="POST /api/email-campaigns" size="small" sx={{ m: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <InfoIcon sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Documentation
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Complete setup guides, API documentation, and troubleshooting.
                </Typography>
                <Button 
                  href="/docs" 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  endIcon={<InfoIcon />}
                >
                  View Docs
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Setup Instructions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Setup Instructions
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              1. Ensure all environment variables are configured in .env.local
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              2. Set up Google Sheets with required tabs (Leads, Customers, Conversations)
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              3. Configure Google Cloud service account for Sheets API access
            </Typography>
            <Typography variant="body2" color="textSecondary">
              4. Get Gemini API key from Google AI Studio
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}