const supabase = require('../config/supabase');

const getAllUniversities = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

const searchUniversities = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const { data, error } = await supabase
      .from('universities')
      .select('name')
      .ilike('name', `%${q}%`)
      .limit(10);
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

const createUniversity = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { data, error } = await supabase
      .from('universities')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const updateUniversity = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { data, error } = await supabase
      .from('universities')
      .update({ name })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const deleteUniversity = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('universities')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUniversities,
  searchUniversities,
  createUniversity,
  updateUniversity,
  deleteUniversity
};
