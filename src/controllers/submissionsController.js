const supabase = require('../config/supabase');

const createSubmission = async (req, res, next) => {
  try {
    const { 
      hackathon_id, 
      user_id, 
      team_id, 
      project_title, 
      description, 
      github_link, 
      video_link, 
      answers 
    } = req.body;
    
    const { data, error } = await supabase
      .from('submissions')
      .insert([{
        hackathon_id,
        user_id,
        team_id,
        project_title,
        description,
        github_link,
        video_link,
        answers
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const getSubmissionById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*, teams(*), uploads(*)')
      .eq('id', req.params.id)
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getHackathonSubmissions = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*, teams(*), uploads(*)')
      .eq('hackathon_id', req.params.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubmission,
  getSubmissionById,
  getHackathonSubmissions
};
