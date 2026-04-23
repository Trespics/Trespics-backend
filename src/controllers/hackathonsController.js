const supabase = require('../config/supabase');

const getAllHackathons = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('hackathons')
      .select(`
        *,       
        participants_count:hackathon_registrations(count)
      `)
      .order('start_date', { ascending: true });
    
    if (error) throw error;

    const formattedData = (data || []).map(h => ({
      ...h,
      participants_count: h.participants_count?.[0]?.count || 0
    }));

    res.json(formattedData);
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

    // Fetch participant count
    const { count, error: countError } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('hackathon_id', req.params.id);

    if (countError) console.error('Error fetching participant count:', countError);
    
    res.json({ ...data, participants_count: count || 0 });
  } catch (error) {
    next(error);
  }
};

const createHackathon = async (req, res, next) => {
  try {
    const { 
      title, description, rules, start_date, deadline, status,
      tagline, long_description, objectives, schedule, prizes, judges, sponsors, tech_stack, prize_pool_desc, video_url
    } = req.body;


    
    const { data, error } = await supabase
      .from('hackathons')
      .insert([{ 
        title, description, rules, start_date, deadline, status,
        tagline, long_description, objectives, schedule, prizes, judges, sponsors, tech_stack, prize_pool_desc, video_url
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
      tagline, long_description, objectives, schedule, prizes, judges, sponsors, tech_stack, prize_pool_desc, video_url
    } = req.body;


    
    const { data, error } = await supabase
      .from('hackathons')
      .update({ 
        title, description, rules, start_date, deadline, status,
        tagline, long_description, objectives, schedule, prizes, judges, sponsors, tech_stack, prize_pool_desc, video_url
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
    const { leader_name, email, university_name, project_name, user_id } = req.body;

    // 1. Upsert into participants table
    const { error: participantError } = await supabase
      .from('participants')
      .upsert({ 
        full_name: leader_name, 
        email, 
        university: university_name 
      }, { onConflict: 'email' });

    if (participantError) throw participantError;

    // 2. Insert into hackathon_registrations
    const { data, error } = await supabase
      .from('hackathon_registrations')
      .insert([{
        hackathon_id: id,
        user_id: user_id || null,
        leader_name,
        email,
        university_name,
        project_name
      }])
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (Postgres code 23505)
      if (error.code === '23505') {
        return res.status(400).json({ 
          message: 'This project or leader is already registered for this hackathon.' 
        });
      }
      throw error;
    }
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

const getHackathonStatsOverview = async (req, res, next) => {
  try {
    const [
      { count: totalChallenges, error: err1 },
      { count: ongoingChallenges, error: err2 },
      { count: upcomingChallenges, error: err3 },
      { count: totalParticipants, error: err4 }
    ] = await Promise.all([
      supabase.from('hackathons').select('*', { count: 'exact', head: true }),
      supabase.from('hackathons').select('*', { count: 'exact', head: true }).eq('status', 'Ongoing'),
      supabase.from('hackathons').select('*', { count: 'exact', head: true }).eq('status', 'Upcoming'),
      supabase.from('hackathon_registrations').select('*', { count: 'exact', head: true })
    ]);

    if (err1 || err2 || err3 || err4) {
      console.error('[Backend] Stats fetch error:', { err1, err2, err3, err4 });
    }

    res.json({
      total: totalChallenges || 0,
      ongoing: ongoingChallenges || 0,
      upcoming: upcomingChallenges || 0,
      participants: totalParticipants || 0
    });
  } catch (error) {
    next(error);
  }
};

const getParticipantStats = async (req, res, next) => {
  try {
    const { count, error } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    res.json({ totalParticipants: count || 0 });
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
  getHackathonRegistrations,
  getParticipantStats,
  getHackathonStatsOverview
};
