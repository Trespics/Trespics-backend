const supabase = require('../config/supabase');

// =============================================
// PUBLIC ENDPOINTS
// =============================================

/**
 * GET /api/blogs/
 * Get all published & approved blogs with pagination, search, category filter
 */
const getAllBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, search, sort = 'newest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .eq('is_approved', true);

    // Category filter
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'popular':
        query = query.order('views_count', { ascending: false });
        break;
      case 'most_liked':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'oldest':
        query = query.order('published_at', { ascending: true });
        break;
      default: // newest
        query = query.order('published_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Backend] Supabase error fetching blogs:', error);
      const customError = new Error(error.message || 'Error fetching blogs');
      customError.status = 500;
      throw customError;
    }

    res.json({
      blogs: data || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogs/featured/
 * Get latest featured blogs (limit 5)
 */
const getFeaturedBlogs = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('id, title, slug, excerpt, featured_image, published_at')
      .eq('is_featured', true)
      .eq('is_published', true)
      .eq('is_approved', true)
      .order('published_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('[Backend] Supabase error fetching featured blogs:', error);
      const customError = new Error(error.message || 'Error fetching featured blogs');
      customError.status = 500;
      throw customError;
    }

    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogs/categories/
 * Get all unique blog categories
 */
const getCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('category')
      .eq('is_published', true)
      .eq('is_approved', true);

    if (error) throw error;

    const categories = [...new Set((data || []).map(b => b.category).filter(Boolean))];
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogs/:slug
 * Get single blog by slug with view count increment
 */
const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Fetch the blog
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const customError = new Error('Blog not found');
      customError.status = 404;
      throw customError;
    }

    // Increment view count (simple approach — sessionStorage on frontend prevents rapid refresh spam)
    await supabase
      .from('blogs')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', data.id);

    // Return blog with incremented view count
    res.json({ ...data, views_count: (data.views_count || 0) + 1 });
  } catch (error) {
    next(error);
  }
};

// =============================================
// AUTHENTICATED USER ENDPOINTS
// =============================================

/**
 * POST /api/blogs/
 * Create a new blog (user or admin)
 */
const createBlog = async (req, res, next) => {
  try {
    const {
      title, slug, excerpt, content, featured_image, video_url,
      category, tags, author_name, author_email, author_avatar, is_published
    } = req.body;

    if (!title || !content || !author_name) {
      const error = new Error('Missing required fields: title, content, author_name');
      error.status = 400;
      throw error;
    }

    // Generate slug if not provided
    const blogSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    // Auto-generate excerpt if not provided
    const blogExcerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

    const blogData = {
      title,
      slug: blogSlug,
      excerpt: blogExcerpt,
      content,
      featured_image: featured_image || null,
      video_url: video_url || null,
      category: category || 'General',
      tags: tags || [],
      author_name,
      author_email: author_email || null,
      author_avatar: author_avatar || null,
      author_id: req.user?.id || null,
      is_published: is_published || false,
      is_approved: false, // Requires admin approval
      published_at: is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('blogs')
      .insert([blogData])
      .select();

    if (error) {
      console.error('[Backend] Supabase error creating blog:', error);
      const customError = new Error(error.message || 'Error creating blog');
      customError.status = 500;
      throw customError;
    }

    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/blogs/:id/like
 * Toggle like on a blog
 */
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      // Anonymous like - just increment counter
      const { data: blog } = await supabase.from('blogs').select('likes_count').eq('id', id).single();
      if (blog) {
        await supabase.from('blogs').update({ likes_count: (blog.likes_count || 0) + 1 }).eq('id', id);
      }
      return res.json({ liked: true, message: 'Blog liked anonymously' });
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('blog_id', id)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      // Unlike
      await supabase.from('blog_likes').delete().eq('id', existing.id);
      const { data: blog } = await supabase.from('blogs').select('likes_count').eq('id', id).single();
      if (blog) {
        await supabase.from('blogs').update({ likes_count: Math.max(0, (blog.likes_count || 0) - 1) }).eq('id', id);
      }
      res.json({ liked: false, message: 'Blog unliked' });
    } else {
      // Like
      await supabase.from('blog_likes').insert([{ blog_id: id, user_id }]);
      const { data: blog } = await supabase.from('blogs').select('likes_count').eq('id', id).single();
      if (blog) {
        await supabase.from('blogs').update({ likes_count: (blog.likes_count || 0) + 1 }).eq('id', id);
      }
      res.json({ liked: true, message: 'Blog liked' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/blogs/:id/save
 * Toggle save on a blog
 */
const toggleSave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      // Anonymous save - just increment counter
      const { data: blog } = await supabase.from('blogs').select('saves_count').eq('id', id).single();
      if (blog) {
        await supabase.from('blogs').update({ saves_count: (blog.saves_count || 0) + 1 }).eq('id', id);
      }
      return res.json({ saved: true, message: 'Blog saved anonymously' });
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('blog_saves')
      .select('id')
      .eq('blog_id', id)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      // Unsave
      await supabase.from('blog_saves').delete().eq('id', existing.id);
      const { data: blog } = await supabase.from('blogs').select('saves_count').eq('id', id).single();
      if (blog) {
        await supabase.from('blogs').update({ saves_count: Math.max(0, (blog.saves_count || 0) - 1) }).eq('id', id);
      }
      res.json({ saved: false, message: 'Blog unsaved' });
    } else {
      // Save
      await supabase.from('blog_saves').insert([{ blog_id: id, user_id }]);
      const { data: blog } = await supabase.from('blogs').select('saves_count').eq('id', id).single();
      if (blog) {
        await supabase.from('blogs').update({ saves_count: (blog.saves_count || 0) + 1 }).eq('id', id);
      }
      res.json({ saved: true, message: 'Blog saved' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogs/:id/comments
 * Get all comments for a blog (nested replies)
 */
const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('blog_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Nest replies under parent comments
    const comments = (data || []).filter(c => !c.parent_comment_id);
    const replies = (data || []).filter(c => c.parent_comment_id);

    const nested = comments.map(comment => ({
      ...comment,
      replies: replies.filter(r => r.parent_comment_id === comment.id)
    }));

    res.json(nested);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/blogs/:id/comment
 * Add a comment to a blog
 */
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id, user_name, user_avatar, content } = req.body;

    if (!user_name || !content) {
      const error = new Error('user_name and content are required');
      error.status = 400;
      throw error;
    }

    const { data, error } = await supabase
      .from('blog_comments')
      .insert([{
        blog_id: id,
        user_id: user_id || null,
        user_name,
        user_avatar: user_avatar || null,
        content
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/blogs/:id/reply
 * Reply to a comment
 */
const addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { parent_comment_id, user_id, user_name, user_avatar, content } = req.body;

    if (!parent_comment_id || !user_name || !content) {
      const error = new Error('parent_comment_id, user_name, and content are required');
      error.status = 400;
      throw error;
    }

    const { data, error } = await supabase
      .from('blog_comments')
      .insert([{
        blog_id: id,
        parent_comment_id,
        user_id: user_id || null,
        user_name,
        user_avatar: user_avatar || null,
        content
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

// =============================================
// ADMIN ENDPOINTS
// =============================================

/**
 * GET /api/blogs/admin/all
 * Get ALL blogs for admin (including drafts, unapproved)
 */
const getAllBlogsAdmin = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/blogs/:id
 * Update a blog (admin)
 */
const updateBlog = async (req, res, next) => {
  try {
    const {
      title, slug, excerpt, content, featured_image, video_url,
      category, tags, is_featured, is_published, is_approved,
      author_name, published_at, scheduled_at
    } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Only include provided fields
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (featured_image !== undefined) updateData.featured_image = featured_image;
    if (video_url !== undefined) updateData.video_url = video_url;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (is_published !== undefined) {
      updateData.is_published = is_published;
      if (is_published && !published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (is_approved !== undefined) updateData.is_approved = is_approved;
    if (author_name !== undefined) updateData.author_name = author_name;
    if (published_at !== undefined) updateData.published_at = published_at;
    if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at;

    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      const customError = new Error('Blog not found');
      customError.status = 404;
      throw customError;
    }

    res.json(data[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/blogs/:id
 * Delete a blog (admin)
 */
const deleteBlog = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/blogs/:id/approve
 * Approve a user-submitted blog
 */
const approveBlog = async (req, res, next) => {
  try {
    const { is_approved } = req.body;

    const updateData = {
      is_approved: is_approved !== undefined ? is_approved : true,
      updated_at: new Date().toISOString()
    };

    // If approving and blog is published, set published_at
    if (updateData.is_approved) {
      const { data: blog } = await supabase
        .from('blogs')
        .select('is_published, published_at')
        .eq('id', req.params.id)
        .single();

      if (blog && blog.is_published && !blog.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/blogs/:id/feature
 * Toggle featured status of a blog
 */
const toggleFeatured = async (req, res, next) => {
  try {
    const { is_featured } = req.body;

    const { data, error } = await supabase
      .from('blogs')
      .update({
        is_featured: is_featured !== undefined ? is_featured : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/blogs/comments/:id
 * Delete/moderate a comment (admin)
 */
const deleteComment = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogs/analytics/dashboard
 * Get blog analytics data for admin dashboard
 */
const getBlogAnalytics = async (req, res, next) => {
  try {
    // Get all blogs for analytics
    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select('id, title, slug, views_count, likes_count, saves_count, is_published, is_featured, is_approved, created_at, published_at')
      .order('created_at', { ascending: false });

    if (blogsError) throw blogsError;

    // Get total comments count
    const { count: totalComments } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true });

    const allBlogs = blogs || [];

    const analytics = {
      totalBlogs: allBlogs.length,
      publishedBlogs: allBlogs.filter(b => b.is_published).length,
      draftBlogs: allBlogs.filter(b => !b.is_published).length,
      featuredBlogs: allBlogs.filter(b => b.is_featured).length,
      pendingApproval: allBlogs.filter(b => !b.is_approved).length,
      totalViews: allBlogs.reduce((sum, b) => sum + (b.views_count || 0), 0),
      totalLikes: allBlogs.reduce((sum, b) => sum + (b.likes_count || 0), 0),
      totalSaves: allBlogs.reduce((sum, b) => sum + (b.saves_count || 0), 0),
      totalComments: totalComments || 0,
      mostPopular: [...allBlogs]
        .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
        .slice(0, 5),
      recentBlogs: allBlogs.slice(0, 10),
    };

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogs/admin/comments
 * Get ALL comments across all blogs for moderation
 */
const getAllCommentsAdmin = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*, blogs(title, slug)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBlogs,
  getFeaturedBlogs,
  getCategories,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  toggleSave,
  getComments,
  addComment,
  addReply,
  getAllBlogsAdmin,
  approveBlog,
  toggleFeatured,
  deleteComment,
  getBlogAnalytics,
  getAllCommentsAdmin
};
