import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "../../uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage,  limits: { fileSize: 5 * 1024 * 1024 }});

export default upload;