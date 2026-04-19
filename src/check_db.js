const supabase = require('./config/supabase');
async function check() {
  const { data, error } = await supabase.from('submissions').select('*').limit(1);
  console.log("Submissions data:", data);
  if (data && data.length > 0) console.log("Columns:", Object.keys(data[0]));
}
check();
