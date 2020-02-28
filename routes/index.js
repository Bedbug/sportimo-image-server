var express = require('express');
var router = express.Router();
var _ = require('lodash');
var multer = require('multer');
var path = require('path');
var fs = require('fs');


// SET STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (req.body && req.body.key) {
            const pathDirname = path.dirname(req.body.key);
            const fullPath = path.join(__dirname, '../public/images', pathDirname);
            fs.mkdirSync(fullPath, { recursive: true });
            cb(null, fullPath);
        }
        else
            cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
        if (req.body && req.body.key) {
            const filename = path.basename(req.body.key);
            cb(null, filename);
        }
        else
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


const limits = {
    files: 1, // allow only 1 file per request
    fileSize: 5 * 1024 * 1024 // 5 MB (max file size)
};

const fileFilter = function (req, file, cb) {
    // supported image file mimetypes
    var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];

    if (_.includes(allowedMimes, file.mimetype)) {
        // allow supported image files
        cb(null, true);
    } else {
        // throw error for invalid files
        cb(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});


router.post('/', upload.single(process.env.AVATAR_FIELD), (req, res, next) => {

    var files = [];
    var file = req.file.filename;
    var matches = file.match(/^(.+?)_.+?\.(.+)$/i);

    if (matches) {
        files = _.map(['lg', 'md', 'sm'], function (size) {
            return matches[1] + '_' + size + '.' + matches[2];
        });
    } else {
        files = [file];
    }

    files = _.map(files, function (file) {
        var port = req.app.get('port');
        var base = req.protocol + '://' + req.hostname + (port ? ':' + port : '');
        var url = file.replace(/[\\\/]+/g, '/').replace(/^[\/]+/g, '');

        return (req.file.storage == 'local' ? base : '') + '/' + url;
    });

    res.json({
        images: files
    });

});



module.exports = router;
