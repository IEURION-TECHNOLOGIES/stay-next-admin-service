import multer from "multer";
import path from "path";
import fs from "fs";
import DatauriParser from "datauri/parser.js";

// Disk storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // All files stored in /uploads
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Parser for Cloudinary (images + videos)
const parser = new DatauriParser();

// For Cloudinary: convert file (from disk) into base64 DataURI
export const formatBuffer = (file) => {
  const fileContent = fs.readFileSync(file.path); // read file from disk
  return parser.format(path.extname(file.originalname).toString(), fileContent);
};

// For YouTube: ensure we return a path (diskStorage already gives us one)
export const ensureTempFile = (file) => {
  return file.path; // diskStorage gives file.path directly
};

export default upload;
