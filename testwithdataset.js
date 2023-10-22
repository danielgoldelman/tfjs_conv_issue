import { useModel } from "./jsrun.js";
import readline from "readline";
import fs from "fs";
import tf from "@tensorflow/tfjs";
import ntqdm from "ntqdm";

const path =
  "https://raw.githubusercontent.com/danielgoldelman/modelrepo/main/multitaskModelForJSWeb/model.json";

var res = [];

async function applyModel(res) {
  const model = await tf.loadGraphModel(path);
  console.log("model loaded");
  var t = [];
  for (let i = 0; i < 533; i++) {
    t.push(i);
  }
//   const i = 1
  for (let i of ntqdm(t)) {
    const label = await useModel(res[i].data, model);
    console.log(label);
    res[i] = { id: res[i].id, data: res[i].data, result: label };
  }
  return res;
}

function processLine(line) {
  line = JSON.parse(line);
  res.push({ id: line.id, data: line.data });
}

const readInterface = readline.createInterface({
  input: fs.createReadStream("./ppAllTestSet.jsonl"),
  // output: process.stdout,
  // console: false
});

readInterface.on("line", function (line) {
  processLine(line);
});

readInterface.on("close", async function () {
  res = await applyModel(res);
  console.log(res);
  fs.writeFile("modelTestResults_B.json", JSON.stringify(res), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("results written to file. yippee.");
    }
  });
});
