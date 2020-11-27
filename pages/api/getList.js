import * as aws from 'aws-sdk';

export default async function handler(req, res) {
  // res.status(200).json(['a', 'b']);

  aws.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION,
    signatureVersion: 'v4',
  });

  const s3 = new aws.S3();
  s3.listObjects({Delimiter: '/', Prefix: process.env.FILE_PREFIX, Bucket: process.env.BUCKET_NAME}, function (err, data) {
    console.log('data ', {err, data})
    const lst = data.Contents.map(f => f.Key).filter(n => f.endsWith('.gpx'));
    console.log('lst ', {lst})
    res.status(200).json(lst);
  });
}