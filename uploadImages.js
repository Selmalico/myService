import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  });
  
const s3 = new AWS.S3();

module.exports.uploadImages = async (event) => {
    console.log('Image parameter', JSON.stringify(event));
    const BUCKET_NAME = 'booksmodule';

    const img = event.img; 
    const buffer = Buffer.from(img.split(',')[1], 'base64');

    const params = {
        Bucket: BUCKET_NAME,
        Key: 'folder/' + Date.now() + '.jpg', 
        Body: buffer, 
        ContentType: 'image/jpg',
    };

    try {
       
        const data = await s3.upload(params).promise();
        console.log(`File uploaded successfully. ${data.Location}`);
        
        return {
            statusCode: 201,
            headers: { 
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
            body: data.Location,
        };
    } catch (error) {
        console.log('General error', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
            body: JSON.stringify({ message: 'Error uploading file' }),
        };
    }
};
