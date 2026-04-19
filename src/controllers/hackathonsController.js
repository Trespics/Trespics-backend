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
    const { title, description, rules, start_date, deadline, status } = req.body;
    
    const { data, error } = await supabase
      .from('hackathons')
      .insert([{ title, description, rules, start_date, deadline, status }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHackathons,
  getHackathonById,
  createHackathon
};
