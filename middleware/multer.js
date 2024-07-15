const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.fieldname}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });



// const storage2 = multer.memoryStorage();

// const uploadImg = multer({ 
//     storage: storage2,
//     limits: {
//       fileSize: 10 * 1024 * 1024 // 10MB limit
//     },
//     fileFilter: function (req, file, cb) {
//       if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//         return cb(new Error('Only JPG, JPEG, and PNG files are allowed.'));
//       }
//       cb(null, true);
//     }
// });

module.exports = {
  upload,
  //  uploadImg
};