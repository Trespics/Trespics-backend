const supabase = require('./config/supabase');
async function check() {
  const { data, error } = await supabase.from('teams').select('*').limit(1);
  if (data && data.length > 0) console.log("Teams Columns:", Object.keys(data[0]));
  
  const { data: members, error: mError } = await supabase.from('team_members').select('*').limit(1);
  if (members && members.length > 0) console.log("Team Members Columns:", Object.keys(members[0]));
}
check();
