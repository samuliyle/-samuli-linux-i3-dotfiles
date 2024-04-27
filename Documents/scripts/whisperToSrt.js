#!/usr/bin/env node
"use strict";

const fs = require("fs");

const inputFileName = "raw.txt";
const outputFileName = "ytsubs.srt";

const jaxFormat = process.argv.includes("--jax");
console.log("JAX FORMAT: " + jaxFormat);
const arrow = jaxFormat ? "->" : "-->";

/**
 *  Convert whisper format into srt (https://huggingface.co/spaces/sanchit-gandhi/whisper-jax)
 *  Example input line [13:59.000 -> 14:01.000] 早いよ!
 *  Example output line
 *  266
 *  00:13:59,000 --> 00:14:01,000
 *  早いよ!
 */
const convertToSRT = (inputString) => {
  const lines = inputString.trim().split("\n");
  console.log("Found " + lines.length + " lines.");

  let srtOutput = "";
  for (let i = 0; i < lines.length; i++) {
    // [13:59.000 -> 14:01.000] 早いよ!
    // [01:00:00.580 --> 01:00:02.500] 反射うまく使えないけどね
    const line = lines[i];

    let [time, text] = line.split("]");
    text = text.trim();
    let [startTime, endTime] = time
      .replaceAll(".", ",") // srt wants comma in seconds
      .split(arrow);
    startTime = startTime.trim().replace("[", "");
    endTime = endTime.trim();

    // Pad with 00: hour if missing
    if (startTime.split(":").length - 1 === 1) {
      startTime = "00:" + startTime;
    }
    if (endTime.split(":").length - 1 === 1) {
      endTime = "00:" + endTime;
    }

    srtOutput += `${i + 1}\n${startTime} --> ${endTime}\n${text}\n\n`;
  }

  return srtOutput;
};

const inputString = fs
  .readFileSync(process.cwd() + "/" + inputFileName)
  .toString();
const srtOutput = convertToSRT(inputString);
console.log("Writing " + srtOutput.length + " chars to " + outputFileName);
fs.writeFileSync(outputFileName, srtOutput);
