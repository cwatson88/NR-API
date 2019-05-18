require("dotenv").config();
const aws = require("aws-sdk"); //require aws-sdk
const zlib = require("zlib");
const fs = require("fs");
const { parseString } = require("xml2js");

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY
});

module.exports.getDarwinDataFromS3Bucket = async () => {
  const res = await s3.listObjects({ Bucket: "darwin.xmltimetable" }).promise();
  const { Contents } = await res;
  console.log(Contents);

  await Contents.forEach((file, index) =>
    s3.getObject(
      { Bucket: "darwin.xmltimetable", Key: file.Key },
      (err, data) => saveDataToFile(data, index)
    )
  );

  const saveDataToFile = (data, index) => {
    try {
      zlib.unzip(data.Body, (err, buffer) => {
        if (!err) {
          const xml = buffer.toString();
          parseString(xml, (err, result) => {
            fs.writeFile(
              `./train-files/message${index}.json`,
              JSON.stringify(result, null, 2),
              err => {
                if (err) throw err;
                console.log(`File ${index} has been saved!`);
              }
            );
          });
        } else {
          throw err;
        }
      });
    } catch (err) {
      console.error(err);
    }
  };
};
