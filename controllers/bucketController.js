const { s3Upload, s3Delete, s3GetDownloadURL } = require('../helpers/s3Functions')
const path = require('path')
const DOWNLOAD_EXPIRATION_TIME = 5 * 60;
const ALLOWED_EXTENSTION_REGEX = /png|jpeg|md|docx/;
const ALLOWED_SIZE_LIMIT = 100000;

exports.uploadFile = async (req, res) => {
  if (!req.files) {
    throw "No file found!";
  }
  const isArray = Array.isArray(req.files.file)
  const filesArray = isArray ? req.files.file : [req.files.file];
  
  const errorArray = filesArray.reduce((acc, file) => {
      const extension = path.extname(file.name);
      const isAllowedExtension = ALLOWED_EXTENSTION_REGEX.test(extension);
      const isValidSize = file.size < ALLOWED_SIZE_LIMIT;
      return acc.concat((isAllowedExtension && isValidSize) ? [] : {
          filename: file.name,
          extenstionError: !isAllowedExtension,
          sizeError: !isValidSize
      });
  }, [])

  if(errorArray.length > 0) {
    return res.status(400).json(errorArray);
  }
  
  const uploadsData = await Promise.all(filesArray.map(file => s3Upload({ file, bucket: process.env.BUCKET_NAME })));
  res.status(200).json(uploadsData);
};

exports.deleteFile = async (req, res) => {
    const { key } = req.body;
    if(!key) throw "No key provided!";
    const isArray = Array.isArray(key);
    const keysArray = isArray ? key : [key];
    await Promise.all(keysArray.map(_key => s3Delete({ bucket: process.env.BUCKET_NAME, key: _key })));
    res.status(200).send(key + " Deleted successfully!");
}

exports.updateFile = async (req, res) => {
    const { key } = req.body;
    const files = req.files;

    if (!files || !key) {
      throw "No file or key found!";
    }

    if (Array.isArray(files.file)) throw "Multiple files not supported!";

    const file = files.file;
    const extension = path.extname(file.name);

    const isAllowedExtension = ALLOWED_EXTENSTION_REGEX.test(extension);
    const isValidSize = file.size < ALLOWED_SIZE_LIMIT;
    
    if(!isAllowedExtension || !isValidSize) return res.status(400).json({
        filename: file.name,
        extenstionError: !isAllowedExtension,
        sizeError: !isValidSize
    })
    
    // manually providing upload key to override previous s3 object
    // To-fix: if new field extension is different it will override file but will still have old file's extension
    const uploadedData = await s3Upload({ file, bucket: process.env.BUCKET_NAME, uploadKey: key });
    res.status(200).json(uploadedData);
};

exports.getDownloadURL = async (req, res) => {
    const key = req.params.key;
    if (!key) {
      throw "No key found!";
    } 
    const signedURL = s3GetDownloadURL({ bucket: process.env.BUCKET_NAME, expirationTime: DOWNLOAD_EXPIRATION_TIME, key });
    res.status(200).send(signedURL);
};