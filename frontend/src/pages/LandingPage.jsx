import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '36px' }}>🛢️</span>
          Opti-Oil
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{ 
              padding: '10px 24px',
              color: 'white', 
              border: '2px solid white',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#1E3A8A';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'white';
            }}
            >
              Login
            </button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{ 
              padding: '10px 24px',
              backgroundColor: 'white', 
              color: '#1E3A8A',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            >
              Register
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px',
            lineHeight: '1.2',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            Edible Oil Inventory & Wholesale Management System
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Streamline your edible oil business with our comprehensive inventory tracking, 
            order management, and wholesale distribution platform.
          </p>

          {/* Main CTA */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '60px', flexWrap: 'wrap' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{ 
                fontSize: '18px', 
                padding: '16px 48px',
                backgroundColor: 'white',
                color: '#1E3A8A',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
              }}
              >
                Get Started
              </button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button style={{ 
                fontSize: '18px', 
                padding: '16px 48px',
                color: 'white',
                border: '2px solid white',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#1E3A8A';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
              >
                Sign Up
              </button>
            </Link>
          </div>

          {/* Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginTop: '60px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '30px',
              color: 'white',
              transition: 'transform 0.3s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>
                Inventory Management
              </h3>
              <p style={{ fontSize: '15px', opacity: 0.9, lineHeight: '1.5' }}>
                Track stock levels, manage products, and automate reorder notifications
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '30px',
              color: 'white',
              transition: 'transform 0.3s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛒</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>
                Order Processing
              </h3>
              <p style={{ fontSize: '15px', opacity: 0.9, lineHeight: '1.5' }}>
                Seamless order placement, approval workflows, and real-time tracking
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '30px',
              color: 'white',
              transition: 'transform 0.3s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>
                Analytics & Reports
              </h3>
              <p style={{ fontSize: '15px', opacity: 0.9, lineHeight: '1.5' }}>
                Comprehensive reporting, insights, and data-driven decision making
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}>
        <p>© 2026 Opti-Oil. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
