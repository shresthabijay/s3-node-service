const router = require('express').Router();
const bucketController = require('../controllers/bucketController');
const { catchErrors } = require('../helpers/errorHandler');

router.put('/', catchErrors(bucketController.uploadFile));
router.patch('/', catchErrors(bucketController.updateFile));
router.delete('/', catchErrors(bucketController.deleteFile));
router.get('/:key', catchErrors(bucketController.getDownloadURL));

module.exports = router