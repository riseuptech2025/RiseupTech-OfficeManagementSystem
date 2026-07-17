// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LeavePage from './pages/LeavePage';
import ReportPage from './pages/ReportPage';
import TaskPage from './pages/TaskPage';
import UserPage from './pages/UserPage';
import ActivityPage from './pages/ActivityPage';
import ManagementPage from './pages/ManagementPage';
import NotificationPage from './pages/NotificationPage';
import AccountPage from './pages/Account/AccountPage';
import { authService } from './services/api';
import CustomerPage from './pages/Customers/CustomerPage';
import FinancePage from './pages/Finance/FinancePage';
import PolicyPage from './pages/Policy/PolicyPage';

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <LeavePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <ActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management"
          element={
            <ProtectedRoute>
              <ManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
  path="/account"
  element={
    <ProtectedRoute>
      <AccountPage />
    </ProtectedRoute>
  }
/>
        <Route
  path="/notifications"
  element={
    <ProtectedRoute>
      <NotificationPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/customers"
  element={
    <ProtectedRoute>
      <CustomerPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/finance"
  element={
    <ProtectedRoute>
      <FinancePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/policy"
  element={
    <ProtectedRoute>
      <PolicyPage />
    </ProtectedRoute>
  }
/>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;