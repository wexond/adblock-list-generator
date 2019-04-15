const Axios = require("axios");
const { AdBlockClient } = require("ad-block");
const { writeFile, existsSync, mkdirSync } = require("fs");
const { resolve } = require("path");
const logUpdate = require("log-update");

const lists = require("./lists.json");

if (!existsSync("output")) {
  mkdirSync("output");
}

for (const key in lists) {
  console.log(`Downloading ${key}...`);

  Axios.get(lists[key]).then(res => {
    const { data } = res;
    const client = new AdBlockClient();

    const lines = data.split("\n");

    let progress = 0;

    let time = Date.now();

    console.log("");

    for (const line of lines) {
      client.parse(line);
      progress++;
      if (Date.now() - time >= 500) {
        logUpdate(`Parsing ${key}... ${progress}/${lines.length}`);
        time = Date.now();
      }
    }

    console.log("");
    console.log(`Serializing ${key}...`);
    writeFile(resolve(`./output/${key}.dat`), client.serialize(64), err => {
      if (err) console.error(err);
    });
    console.log("");
    console.log(`Done generating ${key}`);
    console.log("");
  });
}
