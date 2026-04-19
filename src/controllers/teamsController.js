const supabase = require('../config/supabase');

const createTeam = async (req, res, next) => {
  try {
    const { team_name, created_by, members } = req.body;
    
    // 1. Create the team
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert([{ team_name, created_by }])
      .select()
      .single();
      
    if (teamError) throw teamError;
    
    // 2. Add members
    if (members && members.length > 0) {
      // limit max 8
      const membersToAdd = members.slice(0, 8).map(m => ({
        team_id: teamData.id,
        name: m.name,
        email: m.email,
        role: m.role
      }));
      
      const { error: membersError } = await supabase
        .from('team_members')
        .insert(membersToAdd);
        
      if (membersError) throw membersError;
    }
    
    res.status(201).json(teamData);
  } catch (error) {
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (teamError) throw teamError;
    
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', req.params.id);
      
    if (membersError) throw membersError;
    
    res.json({ ...team, members });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  getTeamById
};
