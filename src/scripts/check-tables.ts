import { supabase } from '../lib/supabase';

async function checkTables() {
  console.log('Checking Supabase tables...');
  
  // Check Users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(3);
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
  } else {
    console.log('Users table structure:', users.length > 0 ? Object.keys(users[0]) : 'No records');
    console.log('Sample users:', users);
  }
  
  // Check Projects table
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .limit(3);
  
  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
  } else {
    console.log('Projects table structure:', projects.length > 0 ? Object.keys(projects[0]) : 'No records');
    console.log('Sample projects:', projects);
  }
  
  // Check Investments table
  const { data: investments, error: investmentsError } = await supabase
    .from('investments')
    .select('*')
    .limit(3);
  
  if (investmentsError) {
    console.error('Error fetching investments:', investmentsError);
  } else {
    console.log('Investments table structure:', investments.length > 0 ? Object.keys(investments[0]) : 'No records');
    console.log('Sample investments:', investments);
  }
}

checkTables()
  .catch(console.error)
  .finally(() => process.exit(0));
