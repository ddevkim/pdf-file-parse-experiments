const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../resources/pdfs"));
  },
  filename: (req, file, callback) => {
    // crypto 모듈을 사용하여 무작위 파일 이름 생성
    crypto.randomBytes(4, (err, raw) => {
      if (err) return callback(err);

      // 확장자를 유지하고 무작위 파일 이름 생성
      const filename = raw.toString("hex") + "_" + file.originalname;
      callback(null, filename);
    });
  },
});

const memoryStorage = multer.memoryStorage();

const FILE_NAME = "pdfFile";

const uploadDisk = multer({ storage: diskStorage, fileFilter }).single(
  FILE_NAME,
);
const uploadMemory = multer({ storage: memoryStorage, fileFilter }).single(
  FILE_NAME,
);

function fileHandler(req, res, next) {
  const { saveFile } = req.query;

  if (saveFile === "true") {
    multer({
      storage: diskStorage,
      fileFilter,
    }).single(FILE_NAME)(req, res, next);
  } else {
    multer({ storage: memoryStorage, fileFilter }).single(FILE_NAME)(
      req,
      res,
      next,
    );
  }
}

module.exports = { fileHandler, uploadDisk, uploadMemory };
