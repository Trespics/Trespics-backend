const supabase = require('../config/supabase');

const getAllProjects = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, description, price, image_url, category, link } = req.body;
    const { data, error } = await supabase
      .from('projects')
      .insert([{ title, description, price, image_url, category, link }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { title, description, price, image_url, category, link } = req.body;
    const { data, error } = await supabase
      .from('projects')
      .update({ title, description, price, image_url, category, link })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject
};
