const supabase = require('../config/supabase');

const getAllProjects = async (req, res, next) => {
  try {
    if (!supabase) {
      const error = new Error('Supabase client is not initialized');
      error.status = 500;
      throw error;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[Backend] Supabase error fetching projects:', error);
      const customError = new Error(error.message || 'Error fetching projects from Supabase');
      customError.status = 500;
      customError.code = error.code;
      throw customError;
    }

    res.json(data || []);
  } catch (error) {
    console.error('[Backend] Catch error in getAllProjects:', error);
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, description, price, image_url, category, link } = req.body;
    
    if (!title || !description || !image_url || !category) {
      const error = new Error('Missing required fields: title, description, image_url, or category');
      error.status = 400;
      throw error;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{ title, description, price, image_url, category, link }])
      .select();
    
    if (error) {
      console.error('[Backend] Supabase error creating project:', error);
      const customError = new Error(error.message || 'Error creating project in Supabase');
      customError.status = 500;
      customError.code = error.code;
      throw customError;
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('[Backend] Catch error in createProject:', error);
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
