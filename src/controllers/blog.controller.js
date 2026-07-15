const Blog = require('../models/Blog');
const { uploadToS3 } = require('../utils/s3');
const { generateBlogWithGrok } = require('../utils/grok');

// Public: Get all active, published blogs/hirings
async function getBlogs(req, res, next) {
  try {
    const filter = { active: true, status: 'Published' };
    
    // Allow filtering by type ('Blog' or 'Hiring')
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(blogs);
  } catch (error) {
    next(error);
  }
}

// Admin: Get all blogs (including Drafts and Inactive)
async function getAdminBlogs(req, res, next) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(blogs);
  } catch (error) {
    next(error);
  }
}

// Public: Get a single blog by slug
async function getBlogBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, active: true, status: 'Published' });
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found.' });
    }
    return res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
}

// Admin: Generate Blog using Grok AI
async function generateAIBlog(req, res, next) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'prompt is required to generate AI content.' });
    }

    const generated = await generateBlogWithGrok(prompt);
    return res.status(200).json(generated);
  } catch (error) {
    next(error);
  }
}

// Admin: Create Blog post
async function createBlog(req, res, next) {
  try {
    const { title, slug, summary, content, type, status, tags, company, role, applyLink, location } = req.body;

    if (!title || !slug || !summary || !content) {
      return res.status(400).json({ message: 'title, slug, summary, and content are required.' });
    }

    // Check slug uniqueness
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'A blog post with this URL slug already exists.' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const newBlog = await Blog.create({
      title,
      slug,
      summary,
      content,
      imageUrl,
      type: type || 'Blog',
      status: status || 'Draft',
      tags: tagsArray,
      hiringDetails: type === 'Hiring' ? {
        company: company || '',
        role: role || '',
        applyLink: applyLink || '',
        location: location || '',
      } : undefined,
    });

    return res.status(201).json(newBlog);
  } catch (error) {
    next(error);
  }
}

// Admin: Update Blog post
async function updateBlog(req, res, next) {
  try {
    const { id } = req.params;
    const { title, slug, summary, content, type, status, tags, active, company, role, applyLink, location } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found.' });
    }

    if (slug && slug !== blog.slug) {
      const existing = await Blog.findOne({ slug });
      if (existing) {
        return res.status(400).json({ message: 'A blog post with this URL slug already exists.' });
      }
      blog.slug = slug;
    }

    if (title) blog.title = title;
    if (summary) blog.summary = summary;
    if (content) blog.content = content;
    if (type) blog.type = type;
    if (status) blog.status = status;
    if (active !== undefined) blog.active = active === 'true' || active === true;

    if (tags !== undefined) {
      blog.tags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    }

    if (blog.type === 'Hiring' || type === 'Hiring') {
      blog.hiringDetails = {
        company: company !== undefined ? company : (blog.hiringDetails?.company || ''),
        role: role !== undefined ? role : (blog.hiringDetails?.role || ''),
        applyLink: applyLink !== undefined ? applyLink : (blog.hiringDetails?.applyLink || ''),
        location: location !== undefined ? location : (blog.hiringDetails?.location || ''),
      };
    }

    if (req.file) {
      blog.imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    await blog.save();
    return res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
}

// Admin: Delete Blog post
async function deleteBlog(req, res, next) {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found.' });
    }
    return res.status(200).json({ message: 'Blog post deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBlogs,
  getAdminBlogs,
  getBlogBySlug,
  generateAIBlog,
  createBlog,
  updateBlog,
  deleteBlog,
};
