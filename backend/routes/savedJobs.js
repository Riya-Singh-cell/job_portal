const express = require('express');
const router = express.Router();
const { toggleSaveJob, getSavedJobs } = require('../controllers/savedJobController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('candidate'));

router.get('/', getSavedJobs);
router.post('/:jobId', toggleSaveJob);

module.exports = router;
