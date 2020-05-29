const AWS = require("aws-sdk");
const path = require("path")

// AWS s3 congifurations
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_MAIN,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_MAIN,
    region: 'ap-south-1'
});

const s3 = new AWS.S3();

/**
 * Uploads given file to s3 bucket
 * @file - File object provided by express-fileupload.
 * @uploadKey - Upload key which is used to save file in s3. If not provided will use md5 from file object.
 */
exports.s3Upload = ({ file, bucket, uploadKey }) => {

  const buffer = file.data;
  const extension = path.extname(file.name);
  const key = uploadKey || file.md5 + extension;

  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
  };

  return s3.upload(params).promise();
};

/**
 * Deletes s3 object with provided key
 * @key - s3 object key
 */
exports.s3Delete = ({ bucket, key }) => {
  const params = { Bucket: bucket, Key: key };
  return s3.deleteObject(params).promise();
};

/**
 * Return signed download url for given key with expiration time
 */
exports.s3GetDownloadURL = ({ bucket, expirationTime, key }) =>
  s3.getSignedUrl("getObject", {
    Bucket: bucket,
    Key: key,
    Expires: expirationTime,
  });
