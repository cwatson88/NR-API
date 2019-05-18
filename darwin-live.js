require("dotenv").config();
const stompit = require("stompit");
const zlib = require("zlib");
const fs = require("fs");
const { parseString } = require("xml2js");

// Connect options with standard headers
const connectOptions = {
  host: "darwin-dist-44ae45.nationalrail.co.uk",
  port: 61613,
  connectHeaders: {
    "heart-beat": "1000,2000",
    host: "localhost",
    login: process.env.DARWIN_USERNAME,
    passcode: process.env.DARWIN_PASSWORD
  }
};
stompit.connect(connectOptions, (error, client) => {
  if (error) {
    console.log("connect error " + error.message);
    return;
  }

  const subscribeHeaders = {
    destination: "/topic/darwin.pushport-v16",
    ack: "client-individual",
    MessageType: "NO"
  };

  client.subscribe(subscribeHeaders, function(error, message) {
    if (error) {
      console.log("subscribe error " + error.message);
      return;
    }

    message.on("data", chunk => {
      zlib.unzip(chunk, (err, buffer) => {
        if (!err) {
          const xml = buffer.toString();
          parseString(xml, function(err, result) {
            // this is a constant stream, it could be saved in a file?
            console.log(JSON.stringify(result, null, 2));
          });
        } else {
          console.error(err);
        }
      });
      // client.ack(message);

      // client.disconnect();
    });
  });
});
