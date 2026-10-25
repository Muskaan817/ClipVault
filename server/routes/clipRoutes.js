const express = require('express');
const router = express.Router();
const {
  getAllClips,
  getClipById,
  createClip,
  updateClip,
  deleteClip,
  clearClips,
} = require('../controllers/clipController');

router.get('/', getAllClips);
router.post('/', createClip);
router.delete('/', clearClips);

router.get('/:id', getClipById);
router.put('/:id', updateClip);
router.delete('/:id', deleteClip);

module.exports = router;
