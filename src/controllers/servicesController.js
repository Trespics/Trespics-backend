const supabase = require('../config/supabase');

const getAllServices = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const { title, description, icon, category, price, image_url, full_description, languages, extra_images } = req.body;
    
    if (!title || !description) {
      const error = new Error('Missing required fields: title or description');
      error.status = 400;
      throw error;
    }

    const { data, error } = await supabase
      .from('services')
      .insert([{ title, description, icon, category, price, image_url, full_description, languages, extra_images }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { title, description, icon, category, price, image_url, full_description, languages, extra_images } = req.body;
    const { data, error } = await supabase
      .from('services')
      .update({ title, description, icon, category, price, image_url, full_description, languages, extra_images, updated_at: new Date() })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllServices,
  createService,
  updateService,
  deleteService
};
