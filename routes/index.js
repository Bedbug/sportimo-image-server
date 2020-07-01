var express = require('express');
var router = express.Router();
var _ = require('lodash');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var settings = require('../config/settings');


// SET STORAGE engine

// Local system file storage
let storage = multer.diskStorage({
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

// Amazon S3 storage
if (settings.storageEngine === 'aws-s3') {
    var multerS3 = require('multer-s3');
    var aws = require('aws-sdk');

    storage = multerS3({
        s3: new aws.S3({}),
        bucket: settings.S3BucketName,
        contentType: function (req, file, cb) {
            const mediaType = file.mimetype || req.body['Content-Type'];
            if (mediaType)
                cb(null, mediaType);
            else
                multerS3.AUTO_CONTENT_TYPE(req, file, cb);
        },
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            let filename = req.body.key;

            if (!filename) {
                filename = Date.now().toString();
                if (file.mimetype === 'image/jpg' || file.mimetype === 'image/pjpg')
                    filename += '.jpg';
                else if (file.mimetype === 'image/png')
                    filename += '.png';
                else if (file.mimetype === 'image/gif')
                    filename += '.gif';
            }

            cb(null, filename);
        },
        acl: 'public-read'
    });
}

// If needed, a MongoDB GridFS storage is also available (https://www.npmjs.com/package/multer-gridfs-storage)


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

    if (settings.storageEngine === 'aws-s3') {
        files = [req.file.location];
    }
    else {
        var file = req.file.filename || req.file.key;
        //var matches = file.match(/^(.+?)_.+?\.(.+)$/i);

        if (req.body && req.body.key) {
            const pathDirname = path.dirname(req.body.key);
            const filename = path.basename(req.body.key);

            file = path.join('images', pathDirname, filename);
        }
        else
            file = req.file.fieldname + '-' + Date.now() + path.extname(req.file.originalname);

        files = [file];

        files = _.map(files, function (file) {
            var port = req.app.get('port');
            var base = req.protocol + '://' + req.hostname + (port ? ':' + port : '');
            var url = file.replace(/[\\\/]+/g, '/').replace(/^[\/]+/g, '');

            return base + '/' + url;
        });
    }

    res.json({
        images: files
    });

});



module.exports = router;
