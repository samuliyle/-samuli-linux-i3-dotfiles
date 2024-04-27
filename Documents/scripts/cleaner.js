#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const currentFolder = process.cwd();
const dryRun = process.argv.includes("--dry");
console.log("Dry run: " + dryRun);

const red = "\x1b[31m%s\x1b[0m";
const green = "\x1b[32m%s\x1b[0m";
const yellow = "\x1b[33m%s\x1b[0m";

const stripBrackets = (text) => {
  return text.replace(/(?:\[.*?\]|[\[\]])/g, "");
};

const stripParenthesis = (text) => {
  return text.replace(/(?:\(.*?\)|(\[\]))/g, "");
};

const stripUnderscore = (text) => {
  return text.replaceAll("_", " ");
};

const stripQuality = (text) => {
  return text
    .replaceAll("720p", "")
    .replaceAll("1080p", "")
    .replaceAll("v2", "")
    .replaceAll("H.264", "")
    .replaceAll("x265", "")
    .replaceAll("x264", "")
    .replaceAll("Blu-ray", "")
    .replaceAll("BluRay", "")
    .replaceAll(".BD.", "")
    .replaceAll("Hi10P", "")
    .replaceAll("WEBRip", "")
    .replaceAll(" WEB ", "")
    .replaceAll("- WEB", "")
    .replaceAll("NF.WEB-DL", "")
    .replaceAll("WEB-DL", "")
    .replaceAll("DUAL WEB", "")
    .replaceAll("Dual-Audio", "")
    .replaceAll("HEVC", "")
    .replaceAll("10bit", "")
    .replaceAll("10Bit", "")
    .replaceAll("10-Bit", "")
    .replaceAll(" END", "")
    .replaceAll("Remux", "")
    .replaceAll("DTS-HD", "")
    .replaceAll("DDP2.0", "")
    .replaceAll("retimed", "")
    .replaceAll("JA-resync", "")
    .replaceAll("AAC2.0", "")
    .replaceAll("AC3", "")
    .replaceAll("FLAC2.0", "")
    .replaceAll("1920x1080", "")
    .replaceAll(".REPACK", "")
    .replaceAll("RERIP", "")
    .replaceAll("ED-fixed", "")
    .replaceAll("E-AC-3", "")
    .replaceAll("CC.ja", ".ja")
    .replaceAll("Multiple Subtitle", "");
};

const stripRipper = (text) => {
  return text
    .replaceAll("SubsPlease", "")
    .replaceAll("YuushaNi", "")
    .replaceAll("Elysium", "")
    .replaceAll("Kira-Fansub", "")
    .replaceAll("Erai-raws", "")
    .replaceAll("Netflix", "")
    .replaceAll("VARYG", "")
    .replaceAll("ZigZag", "")
    .replaceAll("YURASUKA", "")
    .replaceAll("EMBER", "")
    .replaceAll("anotherone", "")
    .replaceAll("MA-TTGA", "")
    .replaceAll("Tsundere-Raws", "")
    .replaceAll("Samir755", "")
    .replaceAll("Judas ", "")
    .replaceAll(".jacc", "")
    .replaceAll("SSA ", "")
    .replaceAll("NanDesuKa", "");
};

const stripVersion = (text) => {
  return text
    .replace(/(?=.*?\d)(?=.*?[A-Z])[A-Z\d]{8}/, "")
    .replace(/[0-9]{8}/, "");
};

const stripWhitespace = (text) => {
  return text.replace(/\s\s+/g, " ").replaceAll(" .", ".");
};

const stripLeftovers = (text) => {
  return text
    .replaceAll(" -.", ".")
    .replaceAll(" ja.srt", ".ja.srt")
    .replaceAll(" JA.srt", ".ja.srt")
    .replaceAll(" .jpn.srt", ".ja.srt")
    .replaceAll(" .JPN.srt", ".ja.srt")
    .replaceAll(" ja.ass", ".ja.ass")
    .replaceAll(" JA.ass", ".ja.ass");
};

const stripDots = (text) => {
  return text.replaceAll(".", " ");
};

const stripAll = (text) => {
  return stripWhitespace(
    stripDots(
      stripVersion(
        stripRipper(
          stripQuality(stripUnderscore(stripParenthesis(stripBrackets(text))))
        )
      )
    )
  ).trim();
};

const getFilenameAndExtension = (pathfilename) => {
  return [path.parse(pathfilename).name, path.parse(pathfilename).ext];
};

const allowedExtensions = [".mkv", ".srt", ".ass", ".mp4"];

const renameDir = (dir) => {
  console.log("Cleaning folder: " + dir);
  const files = fs.readdirSync(dir);

  files.forEach((fileName) => {
    const [name, ext] = getFilenameAndExtension(dir + "/" + fileName);
    const oldWithExt = name + ext;
    const path = dir + "/" + name + ext;
    const file = fs.statSync(path);

    if (!allowedExtensions.includes(ext) && !file.isDirectory()) {
      return;
    }

    const clean = stripAll(name);
    const cleanWithExt = stripLeftovers(clean + ext);
    const newPath = dir + "/" + cleanWithExt;

    let renamed = false;
    if (newPath !== path) {
      console.log(yellow, "OLD: " + oldWithExt);
      console.log(green, "NEW: " + cleanWithExt);
      if (fs.existsSync(newPath)) {
        if (path.includes("retimed")) {
          console.log(
            red,
            "Old path contained retimed, remove old and replace with retimed"
          );
          if (!dryRun) {
            fs.unlinkSync(newPath);
            fs.renameSync(path, newPath);
          }
          renamed = true;
        } else {
          console.log(red, "ERROR: " + newPath + " already exists");
        }
      } else {
        if (!dryRun) {
          fs.renameSync(path, newPath);
        }
        renamed = true;
      }
    } else {
      console.log(green, "SKIP: " + oldWithExt);
    }

    if (file.isDirectory()) {
      renameDir(renamed ? newPath : path);
    }
  });
};

const folder = (!dryRun ? process.argv.slice(2)[0] : null) ?? currentFolder;

renameDir(folder);
