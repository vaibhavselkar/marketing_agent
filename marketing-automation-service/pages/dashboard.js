import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Message as MessageIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    campaignType: 'welcome',
    testEmail: '',
    festival: '',
    offer: '',
    link: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated') {
      if (!session.user.clientId) { router.push('/onboarding'); return; }
      fetchAnalytics(session.user.clientId);
    }
  }, [status]);

  const fetchAnalytics = async (clientId) => {
    const cid = clientId || session?.user?.clientId;
    if (!cid) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/email-campaigns?clientId=${cid}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    const clientId = session?.user?.clientId;
    try {
      const response = await fetch(`/api/email-campaigns?clientId=${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...campaignForm, clientId }),
      });

      const data = await response.json();
      
      if (data.success) {
        showSnackbar('Campaign processed successfully!', 'success');
      } else {
        showSnackbar(data.error, 'error');
      }
    } catch (err) {
      showSnackbar('Failed to process campaign', 'error');
    }
  };

  const handleTestEmail = async () => {
    if (!campaignForm.testEmail) {
      showSnackbar('Please enter a test email address', 'warning');
      return;
    }
    const clientId = session?.user?.clientId;
    try {
      const response = await fetch(`/api/email-campaigns?clientId=${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignType: 'test', testEmail: campaignForm.testEmail, clientId }),
      });

      const data = await response.json();
      
      if (data.success) {
        showSnackbar('Test email sent successfully!', 'success');
      } else {
        showSnackbar(data.error, 'error');
      }
    } catch (err) {
      showSnackbar('Failed to send test email', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchAnalytics}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Container>
    );
  }

  // Chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Leads',
        data: [12, 19, 3, 5, 2, 3, 7],
        borderColor: 'rgb(96, 165, 250)',
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Conversations',
        data: [2, 3, 20, 5, 1, 4, 8],
        borderColor: 'rgb(167, 139, 250)',
        backgroundColor: 'rgba(167, 139, 250, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Head>
        <title>Marketing Automation Dashboard</title>
        <meta name="description" content="Marketing automation service dashboard" />
      </Head>

      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Marketing Automation Dashboard
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => fetchAnalytics()}
            startIcon={<RefreshIcon />}
          >
            Refresh Data
          </Button>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Total Leads
                    </Typography>
                    <Typography variant="h4" component="h2">
                      {analytics?.campaignStats?.totalLeads || 0}
                    </Typography>
                  </Box>
                  <PersonAddIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Chip 
                  label={`${analytics?.newLeads || 0} new`} 
                  color="primary" 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Conversion Rate
                    </Typography>
                    <Typography variant="h4" component="h2">
                      {analytics?.campaignStats?.conversionRate || 0}%
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Instagram DMs
                    </Typography>
                    <Typography variant="h4" component="h2">
                      {analytics?.totalConversations || 0}
                    </Typography>
                  </Box>
                  <MessageIcon sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  This week
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Email Campaigns
                    </Typography>
                    <Typography variant="h4" component="h2">
                      Active
                    </Typography>
                  </Box>
                  <EmailIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Running campaigns
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts and Campaign Management */}
        <Grid container spacing={3}>
          {/* Analytics Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weekly Performance
                </Typography>
                <div style={{ height: '300px' }}>
                  <Chart data={chartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Campaign Management */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Campaign Management
                </Typography>
                
                <form onSubmit={handleCampaignSubmit}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Campaign Type</InputLabel>
                    <Select
                      value={campaignForm.campaignType}
                      label="Campaign Type"
                      onChange={(e) => setCampaignForm({...campaignForm, campaignType: e.target.value})}
                    >
                      <MenuItem value="welcome">Welcome Series</MenuItem>
                      <MenuItem value="follow_up">Follow-up</MenuItem>
                      <MenuItem value="festival">Festival Campaign</MenuItem>
                      <MenuItem value="reengagement">Re-engagement</MenuItem>
                      <MenuItem value="review_request">Review Request</MenuItem>
                    </Select>
                  </FormControl>

                  {campaignForm.campaignType === 'festival' && (
                    <>
                      <TextField
                        fullWidth
                        label="Festival Name"
                        value={campaignForm.festival}
                        onChange={(e) => setCampaignForm({...campaignForm, festival: e.target.value})}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Offer"
                        value={campaignForm.offer}
                        onChange={(e) => setCampaignForm({...campaignForm, offer: e.target.value})}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Campaign Link"
                        value={campaignForm.link}
                        onChange={(e) => setCampaignForm({...campaignForm, link: e.target.value})}
                        sx={{ mb: 2 }}
                      />
                    </>
                  )}

                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    sx={{ mb: 2 }}
                  >
                    Process Campaign
                  </Button>
                </form>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Test Email
                </Typography>
                <TextField
                  fullWidth
                  label="Test Email Address"
                  value={campaignForm.testEmail}
                  onChange={(e) => setCampaignForm({...campaignForm, testEmail: e.target.value})}
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={handleTestEmail}
                >
                  Send Test Email
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Source and Interest Breakdown */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Leads by Source
                </Typography>
                {analytics?.campaignStats?.leadsBySource && Object.entries(analytics.campaignStats.leadsBySource).map(([source, count]) => (
                  <Box key={source} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography>{source}</Typography>
                    <Chip label={count} color="primary" size="small" />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Leads by Interest
                </Typography>
                {analytics?.campaignStats?.leadsByInterest && Object.entries(analytics.campaignStats.leadsByInterest).map(([interest, count]) => (
                  <Box key={interest} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography>{interest}</Typography>
                    <Chip label={count} color="secondary" size="small" />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
export async function getServerSideProps() {
  return { props: {} };
}
