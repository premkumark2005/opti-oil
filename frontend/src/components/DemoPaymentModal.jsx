import React, { useState } from 'react';

const cardBrands = {
  visa: '💳',
  mastercard: '💳',
  rupay: '💳',
  upi: '📱',
};

const DemoPaymentModal = ({ isOpen, onClose, onSuccess, amount, orderNumber, currency = 'INR' }) => {
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [step, setStep] = useState('pay'); // 'pay' | 'processing' | 'success'

  if (!isOpen) return null;

  const displayAmount = amount ? (amount / 100).toFixed(2) : '0.00';

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePay = async () => {
    if (method === 'card' && (!cardNumber || !expiry || !cvv || !name)) {
      alert('Please fill all card details');
      return;
    }
    if (method === 'upi' && !upiId) {
      alert('Please enter UPI ID');
      return;
    }

    setStep('processing');
    await new Promise(r => setTimeout(r, 2000));
    setStep('success');
    await new Promise(r => setTimeout(r, 1200));
    onSuccess();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        width: '420px',
        maxWidth: '95vw',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        fontFamily: "'Inter', sans-serif",
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #072654 0%, #1a73e8 100%)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '14px',
              fontWeight: '800',
              color: '#072654',
              letterSpacing: '-0.5px'
            }}>
              Opti<span style={{ color: '#1a73e8' }}>Oil</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
              Order #{orderNumber}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none', color: '#fff',
            borderRadius: '50%', width: '30px', height: '30px',
            cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>×</button>
        </div>

        {/* Amount */}
        <div style={{
          background: '#f8faff',
          padding: '16px 24px',
          borderBottom: '1px solid #e8edf5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Amount to Pay</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111' }}>
              ₹{displayAmount}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Secured by</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#072654', letterSpacing: '-0.5px' }}>
              Razorpay
            </div>
          </div>
        </div>

        {step === 'processing' && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#1a73e8',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 0.8s linear infinite'
            }} />
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Processing Payment...</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>Please wait, do not close this window</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {step === 'success' && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px',
              background: '#dcfce7',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px'
            }}>✅</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>Payment Successful!</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>₹{displayAmount} paid securely</div>
          </div>
        )}

        {step === 'pay' && (
          <div style={{ padding: '20px 24px' }}>
            {/* Method Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[
                { id: 'card', label: '💳 Card' },
                { id: 'upi', label: '📱 UPI' },
                { id: 'netbanking', label: '🏦 Netbanking' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: `2px solid ${method === m.id ? '#1a73e8' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: method === m.id ? '#eff6ff' : '#fff',
                    color: method === m.id ? '#1a73e8' : '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Card Form */}
            {method === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Card Number
                  </label>
                  <input
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4111 1111 1111 1111"
                    maxLength={19}
                    style={{
                      width: '100%', padding: '10px 12px',
                      border: '1.5px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '15px', letterSpacing: '2px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
                      Expiry
                    </label>
                    <input
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      style={{
                        width: '100%', padding: '10px 12px',
                        border: '1.5px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px', outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
                      CVV
                    </label>
                    <input
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      type="password"
                      maxLength={4}
                      style={{
                        width: '100%', padding: '10px 12px',
                        border: '1.5px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px', outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Name on Card
                  </label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Full Name"
                    style={{
                      width: '100%', padding: '10px 12px',
                      border: '1.5px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* UPI Form */}
            {method === 'upi' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
                  UPI ID
                </label>
                <input
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                    <button
                      key={app}
                      style={{
                        padding: '6px 14px', fontSize: '12px',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '6px', background: '#f9fafb',
                        cursor: 'pointer', fontWeight: '500'
                      }}
                    >{app}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Netbanking */}
            {method === 'netbanking' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Other'].map(bank => (
                  <button
                    key={bank}
                    style={{
                      padding: '12px',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '8px',
                      background: '#f9fafb',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#374151'
                    }}
                  >{bank}</button>
                ))}
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePay}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '14px',
                background: 'linear-gradient(135deg, #1a73e8, #0052cc)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                letterSpacing: '0.3px',
                boxShadow: '0 4px 14px rgba(26,115,232,0.4)',
                transition: 'all 0.2s'
              }}
            >
              Pay ₹{displayAmount} →
            </button>

            {/* Footer */}
            <div style={{
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#9ca3af'
            }}>
              <span>🔒</span>
              <span>Secured by</span>
              <span style={{ fontWeight: '800', color: '#072654' }}>Razorpay</span>
              <span>· Demo Mode</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPaymentModal;
