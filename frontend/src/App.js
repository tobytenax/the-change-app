import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Redux store
import store from './store';

// Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/routing/PrivateRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Proposals from './pages/Proposals';
import ProposalDetail from './pages/ProposalDetail';
import CreateProposal from './pages/CreateProposal';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';

// Utils
import setAuthToken from './utils/setAuthToken';

// Check for token in localStorage
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/proposals/:id" element={<ProposalDetail />} />
              <Route 
                path="/create-proposal" 
                element={
                  <PrivateRoute>
                    <CreateProposal />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/quiz/:proposalId" 
                element={
                  <PrivateRoute>
                    <Quiz />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
