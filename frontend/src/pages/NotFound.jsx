import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: 'var(--text-primary)' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginTop: '16px', color: 'var(--text-secondary)' }}>
        Page Not Found
      </h2>
      <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
        The page you are looking for does not exist.
      </p>
      <Link to="/" style={{ marginTop: '24px' }}>
        <Button variant="primary">Go Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
