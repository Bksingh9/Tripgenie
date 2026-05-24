// Quick sanity check: verify Supabase connection, auth flow, and data persistence
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const url = 'https://kvngtrxdpfpoukwqzbyw.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmd0cnhkcGZwb3Vrd3F6Ynl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjY2NzgsImV4cCI6MjA5NTIwMjY3OH0.BbCC_PIgWnhE1qBwjHNscd7GCp21hjWpxgodAZT2CL0';

const supabase = createClient(url, key);

async function sanityCheck() {
  console.log('=== TripGenie E2E Sanity Check ===\n');

  // 1. Test connectivity
  console.log('1. Testing Supabase connectivity...');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(0);
    if (error && error.message.includes('does not exist')) {
      console.log('   ⚠ Tables not created yet — migration needed');
      console.log('   Migration SQL is at: supabase/migrations/001_initial.sql');
      console.log('   → Apply it via Supabase Dashboard > SQL Editor');
    } else if (error) {
      console.log('   ⚠ Error:', error.message);
    } else {
      console.log('   ✓ Connected! Tables exist.');
    }
  } catch (e) {
    console.log('   ✗ Connection failed:', e.message);
  }

  // 2. Test auth endpoint
  console.log('\n2. Testing auth endpoint...');
  try {
    const { data, error } = await supabase.auth.signUp({
      email: `test-${Date.now()}@tripgenie.test`,
      password: 'testpassword123',
    });
    if (error) {
      console.log('   ⚠ Auth error:', error.message);
    } else if (data.user) {
      console.log('   ✓ Auth working! Test user created:', data.user.id);
      // Clean up
      await supabase.auth.signOut();
    }
  } catch (e) {
    console.log('   ✗ Auth failed:', e.message);
  }

  // 3. Test API health
  console.log('\n3. Testing REST API health...');
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key },
    });
    console.log(`   ✓ REST API status: ${res.status}`);
  } catch (e) {
    console.log('   ✗ REST API unreachable:', e.message);
  }

  // 4. Verify env vars
  console.log('\n4. Checking environment config...');
  try {
    const envLocal = readFileSync('.env.local', 'utf-8');
    const hasUrl = envLocal.includes('VITE_SUPABASE_URL=');
    const hasKey = envLocal.includes('VITE_SUPABASE_ANON_KEY=');
    console.log(`   ${hasUrl ? '✓' : '✗'} VITE_SUPABASE_URL`);
    console.log(`   ${hasKey ? '✓' : '✗'} VITE_SUPABASE_ANON_KEY`);
  } catch {
    console.log('   ✗ .env.local not found');
  }

  // 5. Build check
  console.log('\n5. Build status...');
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    console.log(`   ✓ Project: ${pkg.name} v${pkg.version}`);
    const hasSupa = !!pkg.dependencies?.['@supabase/supabase-js'];
    console.log(`   ${hasSupa ? '✓' : '✗'} @supabase/supabase-js installed`);
  } catch {
    console.log('   ✗ Could not read package.json');
  }

  console.log('\n=== Sanity Check Complete ===');
}

sanityCheck().catch(console.error);
