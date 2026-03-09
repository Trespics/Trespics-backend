const supabase = require('../config/supabase');

const getAllTestimonials = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const createTestimonial = async (req, res, next) => {
  try {
    const { quote, author, company } = req.body;
    const { data, error } = await supabase
      .from('testimonials')
      .insert([{ quote, author, company }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

const updateTestimonial = async (req, res, next) => {
  try {
    const { quote, author, company } = req.body;
    const { data, error } = await supabase
      .from('testimonials')
      .update({ quote, author, company })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    next(error);
  }
};

const deleteTestimonial = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
};
