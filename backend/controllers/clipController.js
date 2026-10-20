const db = require('../db');

// Detect content type if not explicitly provided
const detectType = (content) => {
  if (!content) return 'text';
  const trimmed = content.trim();
  if (/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(trimmed)) {
    return 'url';
  }
  if (
    trimmed.startsWith('{') ||
    trimmed.startsWith('[') ||
    trimmed.includes('function') ||
    trimmed.includes('const ') ||
    trimmed.includes('let ') ||
    trimmed.includes('class ') ||
    trimmed.includes('import ')
  ) {
    return 'code';
  }
  return 'text';
};

// GET /api/clips - Retrieve all clips (with optional search and filter)
const getAllClips = async (req, res) => {
  try {
    const { q, pinned, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM clips';
    const conditions = [];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      conditions.push(`content ILIKE $${params.length}`);
    }

    if (pinned !== undefined) {
      params.push(pinned === 'true');
      conditions.push(`is_pinned = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY is_pinned DESC, created_at DESC';

    params.push(parseInt(limit, 10));
    query += ` LIMIT $${params.length}`;

    params.push(parseInt(offset, 10));
    query += ` OFFSET $${params.length}`;

    const { rows } = await db.query(query, params);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('Error fetching clips:', error);
    res.status(500).json({ success: false, message: 'Server error fetching clips', error: error.message });
  }
};

// GET /api/clips/:id - Retrieve single clip
const getClipById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM clips WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clip not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching clip:', error);
    res.status(500).json({ success: false, message: 'Server error fetching clip', error: error.message });
  }
};

// POST /api/clips - Save new clip
const createClip = async (req, res) => {
  try {
    const { content, type, is_pinned = false } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Clip content is required' });
    }

    const clipType = type || detectType(content);

    const query = `
      INSERT INTO clips (content, type, is_pinned, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *;
    `;

    const { rows } = await db.query(query, [content.trim(), clipType, Boolean(is_pinned)]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error creating clip:', error);
    res.status(500).json({ success: false, message: 'Server error saving clip', error: error.message });
  }
};

// PUT /api/clips/:id - Update clip content or pinned status
const updateClip = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type, is_pinned } = req.body;

    const updates = [];
    const params = [id];

    if (content !== undefined) {
      params.push(content);
      updates.push(`content = $${params.length}`);
    }

    if (type !== undefined) {
      params.push(type);
      updates.push(`type = $${params.length}`);
    }

    if (is_pinned !== undefined) {
      params.push(Boolean(is_pinned));
      updates.push(`is_pinned = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update provided' });
    }

    updates.push('updated_at = NOW()');

    const query = `
      UPDATE clips
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *;
    `;

    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clip not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error updating clip:', error);
    res.status(500).json({ success: false, message: 'Server error updating clip', error: error.message });
  }
};

// DELETE /api/clips/:id - Delete clip
const deleteClip = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('DELETE FROM clips WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Clip not found' });
    }

    res.json({ success: true, message: 'Clip deleted successfully' });
  } catch (error) {
    console.error('Error deleting clip:', error);
    res.status(500).json({ success: false, message: 'Server error deleting clip', error: error.message });
  }
};

// DELETE /api/clips - Clear clips (optional: only unpinned)
const clearClips = async (req, res) => {
  try {
    const { includePinned = 'false' } = req.query;

    const query = includePinned === 'true'
      ? 'DELETE FROM clips'
      : 'DELETE FROM clips WHERE is_pinned = FALSE';

    const { rowCount } = await db.query(query);
    res.json({ success: true, message: `Cleared ${rowCount} clip(s)` });
  } catch (error) {
    console.error('Error clearing clips:', error);
    res.status(500).json({ success: false, message: 'Server error clearing clips', error: error.message });
  }
};

module.exports = {
  getAllClips,
  getClipById,
  createClip,
  updateClip,
  deleteClip,
  clearClips,
};
