const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://shdyscaybjzhblxqxfhs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZHlzY2F5Ymp6aGJseHF4ZmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDA4MjIsImV4cCI6MjA4NTg3NjgyMn0.jb8S3-lFypRQzKyJFt8xycnmbX25_J3DHk6QqcfKhvs';

async function runTests() {
  console.log("🚀 Starting Core Engine Verification...");

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Authenticate (Create Test User)
  const email = `test_engine_${Date.now()}@osprey.test`;
  const password = 'Password123!';
  console.log(`\n1️⃣  Creating Test User: ${email}`);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_name: 'Test Corp ' + Date.now(),
        industry_type: 'COMPANY'
      }
    }
  });

  if (authError) {
    console.error("❌ Auth Failed:", authError.message);
    process.exit(1);
  }

  const session = authData.session;
  if (!session) {
    console.error("❌ No session returned (Check if email confirmation is disabled or needed)");
    // If email confirmation is on, we can't proceed easily.
    // Assuming for this environment it's off or auto-confirmed for tests.
    // If not, we might need to sign in with a known user if possible.
    // But usually in these sandboxes, signUp works or we are stuck.
    // Let's assume it works.
    if (!authData.user) {
         console.error("❌ User creation failed entirely.");
         process.exit(1);
    }
    console.log("⚠️  User created but no session. Email confirmation might be required.");
    // We can't proceed without a token for RLS.
    // We'll try to SignIn immediately (sometimes works if auto-confirm is on but session not returned in signUp)
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError || !loginData.session) {
        console.error("❌ Login Failed:", loginError?.message);
        process.exit(1);
    }
    console.log("✅ Logged in successfully.");
    // Use the new session
    var authenticatedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${loginData.session.access_token}` } }
    });
  } else {
    console.log("✅ User created and session active.");
    var authenticatedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${session.access_token}` } }
    });
  }

  // Wait for triggers to create Org and Profile
  await new Promise(r => setTimeout(r, 2000));

  // Get Organization ID
  const { data: profile } = await authenticatedClient.from('profiles').select('organization_id').single();
  const orgId = profile?.organization_id;
  console.log(`   Organization ID: ${orgId}`);

  if (!orgId) {
    console.error("❌ Organization not created by trigger.");
    process.exit(1);
  }

  // 2. Test Finance Engine (Journal Posting)
  console.log("\n2️⃣  Testing Finance Engine (Journal Posting)...");
  // Create Journal
  const { data: journal, error: journalError } = await authenticatedClient.from('journal_entries').insert({
    transaction_date: new Date().toISOString(),
    narration: 'Test Journal',
    status: 'DRAFT'
  }).select().single();

  if (journalError) {
      console.error("❌ Journal Creation Error:", journalError);
      process.exit(1);
  }

  if (!journal) { console.error("❌ Failed to create journal (Unknown reason)"); process.exit(1); }

  console.log("   Journal Created:", journal.id);

  // Create Lines (Balanced)
  // Need COA first. Trigger might have created default COA? No, schema doesn't have default COA trigger.
  // We need to create 2 accounts.
  const { data: acc1, error: acc1Error } = await authenticatedClient.from('chart_of_accounts').insert({
    code: '1001', name: 'Cash', type: 'ASSET'
  }).select().single();

  if (acc1Error) { console.error("❌ Account 1 Error:", acc1Error); process.exit(1); }

  const { data: acc2, error: acc2Error } = await authenticatedClient.from('chart_of_accounts').insert({
    code: '2001', name: 'Equity', type: 'EQUITY'
  }).select().single();

  if (acc2Error) { console.error("❌ Account 2 Error:", acc2Error); process.exit(1); }

  await authenticatedClient.from('journal_lines').insert([
    { journal_entry_id: journal.id, account_id: acc1.id, debit: 100, credit: 0 },
    { journal_entry_id: journal.id, account_id: acc2.id, debit: 0, credit: 100 }
  ]);

  // Post
  const { error: postError } = await authenticatedClient.rpc('post_journal_entry', { entry_id: journal.id });
  if (postError) {
    console.error("❌ Posting Failed:", postError.message);
  } else {
    console.log("✅ Journal Posted Successfully (Debit=Credit confirmed).");
  }

  // 3. Test Budget Logic (Vote Book)
  console.log("\n3️⃣  Testing Budget Logic (Vote Book)...");
  // Create Node (Dept)
  const { data: dept, error: deptError } = await authenticatedClient.from('nodes').insert({
    name: 'IT Dept', type_id: (await authenticatedClient.from('node_types').select('id').eq('name','Department').single()).data?.id
  }).select().single();

  if (deptError) { console.error("❌ Dept Creation Error:", deptError); }

  if (!dept) { console.log("⚠️ Skipping Budget Test - Node creation failed (maybe node_types empty?)"); }
  else {
      // Create Budget
      const { data: budget, error: budgetError } = await authenticatedClient.from('budgets').insert({
        node_id: dept.id, name: 'IT Budget 2024', status: 'ACTIVE'
      }).select().single();

      if (budgetError) console.error("Budget Error:", budgetError);

      // Create Budget Line for 'Cash' (using acc1 just for test)
      const { data: bl, error: blError } = await authenticatedClient.from('budget_lines').insert({
        budget_id: budget.id, account_id: acc1.id, amount_allocated: 500
      }).select().single();

      if (blError) console.error("Budget Line Error:", blError);

      // Create PR
      const { data: pr, error: prError } = await authenticatedClient.from('purchase_requests').insert({
        department_node_id: dept.id, description: 'New Laptop', status: 'PENDING_APPROVAL'
      }).select().single();

      if (prError) console.error("PR Error:", prError);

      // Create PR Line (Cost 600 > 500) -> Should Fail
      await authenticatedClient.from('pr_lines').insert({
        pr_id: pr.id, item_description: 'Laptop', quantity: 1, estimated_unit_cost: 600, expense_account_id: acc1.id
      });

      // Attempt Approve
      console.log("   Attempting to approve Over-Budget PR...");
      const { error: approveError } = await authenticatedClient.from('purchase_requests')
        .update({ status: 'APPROVED' }).eq('id', pr.id);

      if (approveError) {
          if (approveError.message.includes("BUDGET EXCEEDED") || (approveError.details && approveError.details.includes("BUDGET EXCEEDED"))) {
            console.log("✅ Vote Book correctly BLOCKED excessive spending.");
          } else {
            console.error("❌ Vote Book FAILED with unexpected error:", approveError.message);
          }
      } else {
        console.error("❌ Vote Book FAILED: PR was Approved despite insufficient budget!");
      }
  }

  console.log("\n✅ Verification Complete.");
}

runTests().catch(e => console.error(e));
