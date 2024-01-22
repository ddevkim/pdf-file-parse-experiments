const express = require("express");
const path = require("path");
const router = express.Router();
const pdfParse = require("pdf-parse");
const PDFParser = require("pdf2json");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const PDFExtract = require("pdf.js-extract").PDFExtract;
const { fileHandler } = require("../middleWares/fileHandler");
const { go, range, map, add } = require("fxjs");
const fs = require("fs");

router.post("/parse", fileHandler, async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("No PDF file uploaded.");
  }

  const pdfBuffer = req.file.buffer;
  const { pdfParser } = req.body;

  let parsed_result;

  try {
    if (pdfParser === "pdf-parse") {
      // https://www.npmjs.com/package/pdf-parse
      parsed_result = await pdfParse(pdfBuffer);
    }
    if (pdfParser === "pdf2json") {
      // https://www.npmjs.com/package/pdf2json#pdf2json
      async function parsePdfFromPdf2json(pdfBuffer) {
        return new Promise((res, rej) => {
          const pdfParser = new PDFParser();
          pdfParser.parseBuffer(pdfBuffer);
          pdfParser.on("pdfParser_dataReady", (pdfData) => {
            res(pdfData);
          });
          pdfParser.on("pdfParser_dataError", (errData) => {
            rej(errData);
          });
        });
      }
      parsed_result = await parsePdfFromPdf2json(pdfBuffer);
    }
    if (pdfParser === "pdf.js-extract") {
      // https://www.npmjs.com/package/pdf.js-extract
      const pdfExtract = new PDFExtract();
      parsed_result = await pdfExtract.extractBuffer(pdfBuffer);
    }
    if (pdfParser === "inkscape") {
      const { destination, filename } = req.file;
      const file_path = destination + "/" + filename;

      // 임시 저장 pdf 파일 읽기
      const pdfBuffer = fs.readFileSync(file_path);
      const pdfInfo = await pdfParse(pdfBuffer);
      const num_pages = pdfInfo.numpages;

      parsed_result = await convertPdfPagesToSvgs({
        filename,
        num_pages,
        destination,
      });

      // 임시 저장 파일 삭제
      fs.unlinkSync(file_path);
      res.header("Content-Type", "image/svg+xml");
    }
    res.json(parsed_result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

async function convertPdfPagesToSvgs({ filename, num_pages, destination }) {
  return go(
    range(num_pages),
    map(add(1)),
    map(async (page) => {
      const command = `inkscape -l -T --pages=${page} -o - ${path.resolve(destination, filename)}`;
      const { stdout } = await exec(command);
      return stdout;
    }),
  );
}

module.exports = router;
