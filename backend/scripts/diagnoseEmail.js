import net from 'net';

console.log('🔍 Diagnosing email connection issues...\n');

const ports = [
  { port: 587, name: 'SMTP (STARTTLS)' },
  { port: 465, name: 'SMTPS (SSL/TLS)' },
  { port: 25, name: 'SMTP (Plain)' }
];

async function testPort(host, port, name) {
  return new Promise((resolve) => {
    console.log(`Testing ${name} (${host}:${port})...`);
    
    const socket = new net.Socket();
    const timeout = 5000;
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`✅ ${name}: Connection successful\n`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`⏱️  ${name}: Connection timeout (firewall/network issue)\n`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`❌ ${name}: ${err.message}\n`);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function diagnose() {
  console.log('Testing Gmail SMTP servers:\n');
  console.log('═'.repeat(50) + '\n');
  
  const host = 'smtp.gmail.com';
  const results = [];
  
  for (const { port, name } of ports) {
    const success = await testPort(host, port, name);
    results.push({ port, name, success });
  }
  
  console.log('═'.repeat(50));
  console.log('\n📊 Summary:\n');
  
  const successCount = results.filter(r => r.success).length;
  
  if (successCount === 0) {
    console.log('❌ All ports blocked!\n');
    console.log('Possible causes:');
    console.log('  1. Firewall blocking outbound SMTP connections');
    console.log('  2. Antivirus software blocking mail ports');
    console.log('  3. Network proxy/VPN restrictions');
    console.log('  4. ISP blocking SMTP traffic\n');
    console.log('Solutions:');
    console.log('  • Check Windows Firewall settings');
    console.log('  • Temporarily disable antivirus');
    console.log('  • Connect to different network (mobile hotspot)');
    console.log('  • Use a different SMTP provider (SendGrid, Mailgun)');
  } else {
    console.log('✅ Some ports are accessible!');
    results.forEach(({ port, name, success }) => {
      if (success) {
        console.log(`  ✓ ${name} (port ${port}) works`);
      }
    });
  }
  
  process.exit(0);
}

diagnose();
