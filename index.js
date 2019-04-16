const Axios = require("axios");
const { FiltersEngine } = require("@cliqz/adblocker");
const { writeFile, existsSync, mkdirSync } = require("fs");
const { resolve } = require("path");
const logUpdate = require("log-update");

const lists = require("./lists.json");

if (!existsSync("output")) {
  mkdirSync("output");
}

const ops = [];

const startSpinner = text => {
  const frames = ["-", "\\", "|", "/"];
  let i = 0;

  console.log("");

  logUpdate(`${frames[0]} ${text}`);

  const interval = setInterval(() => {
    const frame = frames[(i = ++i % frames.length)];

    logUpdate(`${frame} ${text}`);
  }, 80);

  return {
    stop: () => {
      clearInterval(interval);
      logUpdate(`Done!`);
    }
  };
};

let spinner = startSpinner("Downloading filters...");

for (const key in lists) {
  ops.push(Axios.get(lists[key]));
}

Axios.all(ops).then(res => {
  let data = "";

  for (const res1 of res) {
    data += res1.data;
  }

  spinner.stop();

  spinner = startSpinner("Parsing filters...");

  const engine = FiltersEngine.parse(data);

  spinner.stop();

  spinner = startSpinner("Saving output...");

  writeFile(resolve("output", "default.dat"), engine.serialize(), err => {
    if (err) return console.error(err);

    spinner.stop();
  });
});
