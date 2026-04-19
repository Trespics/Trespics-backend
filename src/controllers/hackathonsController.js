const supabase = require('../config/supabase');

const getAllHackathons = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

const getHackathonById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const createHackathon = async (req, res, next) => {
  try {
    const { 
      title, description, rules, start_date, deadline, status,
      tagline, longDescription, objectives, schedule, prizes, judges, sponsors, techStack, prize_pool_desc
    } = req.body;
    
    const { data, error } = await supabase
      .from('hackathons')
      .insert([{ 
        title, description, rules, start_date, deadline, status,
        tagline, longDescription, objectives, schedule, prizes, judges, sponsors, techStack, prize_pool_desc
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

const updateHackathon = async (req, res, next) => {
  try {
    const { 
      title, description, rules, start_date, deadline, status,
      tagline, longDescription, objectives, schedule, prizes, judges, sponsors, techStack, prize_pool_desc
    } = req.body;
    
    const { data, error } = await supabase
      .from('hackathons')
      .update({ 
        title, description, rules, start_date, deadline, status,
        tagline, longDescription, objectives, schedule, prizes, judges, sponsors, techStack, prize_pool_desc
      })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    next(error);
  }
};

const deleteHackathon = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('hackathons')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const registerForHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { leader_name, university_name, project_name, user_id } = req.body;

    const { data, error } = await supabase
      .from('hackathon_registrations')
      .insert([{
        hackathon_id: id,
        user_id: user_id || null,
        leader_name,
        university_name,
        project_name
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const checkRegistrationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id, leader_name } = req.query;

    let query = supabase
      .from('hackathon_registrations')
      .select('*')
      .eq('hackathon_id', id);

    if (user_id) {
      query = query.eq('user_id', user_id);
    } else if (leader_name) {
      query = query.eq('leader_name', leader_name);
    } else {
      return res.json({ registered: false });
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    res.json({ registered: !!data, registration: data });
  } catch (error) {
    next(error);
  }
};

const getHackathonRegistrations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('hackathon_registrations')
      .select('*')
      .eq('hackathon_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  registerForHackathon,
  checkRegistrationStatus,
  getHackathonRegistrations
};
