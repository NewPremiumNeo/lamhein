var express = require('express');
var router = express.Router();
const photoModel = require('../models/photoModel.js');
const videoModel = require('../models/videoModel.js');
const { isLoggedIn } = require('../middleware/authMiddleware.js');
const userController = require('../controllers/userController.js');
const usersModel = require('../models/usersModel.js');
const boolModel = require('../models/boolModel.js');
const multer = require('../middleware/multer.js')


router.use(express.urlencoded({ extended: false }));

/* GET home page. */

router.get('/error', (req, res, next) => {
  throw Error("AALU GHOBHI LEGA")
})
router.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  res.status(500)
  res.render('error', { error: err })
})


router.get('/', async function (req, res, next) {
  var user = null
  const bool = await boolModel.findOne()
  if (req.user) {
    user = await usersModel.findById(req.user._id)
  }
  const successMsg = req.flash('success')[0];
  const errorMsg = req.flash('error')[0]
  res.render('index', {
    user, bool, successMsg,
    errorMsg
  });
});

router.get('/register', function (req, res, next) {
  res.render('register', { messages: req.flash('error') });
});

router.post('/register', userController.postRegister)

// Login or Signin Get
router.get('/login', userController.getLogin);

//Login or Signin Post
router.post('/login', userController.postLogin, function (req, res) { })

router.get('/logout', userController.getLogout);

router.get('/about', function (req, res, next) {
  res.render('about');
});


router.get('/gallery', isLoggedIn, function (req, res, next) {
  res.render('gallery');
});

router.get('/gallery/photos/:gallery', isLoggedIn, async function (req, res, next) {
  try {
    const gallery = req.params.gallery
    // const validYear = ["2k21", "2k22", "2k23"]
    const validGallery = ["memories", "farewell"]
    const year = gallery === "memories" ?  "2k21" : "2k22"
    if (validGallery.includes(gallery)) {
      const allPhotos = await photoModel.find({ year });
      res.render('photos', { allPhotos, title: gallery, bgimg: `/images/${gallery}.jpg`, year });
    } else {
      throw Error("Page Not Found")
    }
  }
  catch (err) {
    console.error('Error in geting Post Data:- ', err.message);
    next(err);
  }
});


router.get('/gallery/videos/:year', isLoggedIn, async function (req, res, next) {
  try {
    const year = req.params.year
    const validYear = ["2k21", "2k22", "2k23"]
    if (validYear.includes(year)) {
      const allVideos = await videoModel.find({ year });
      res.render('videos', { allVideos, title: `Video Gallery ${year}` });
    } else {
      throw Error("Page Not Found")
    }
  }
  catch (err) {
    console.error('Error in geting Post Data:- ', err.message);
    next(err);
  }
});


// router.get('/videos', isLoggedIn, function (req, res, next) {
//   res.render('videos');
// });

router.get('/organisers', async function (req, res, next) {
  res.render('organisers');
});

router.get('/changepassword', isLoggedIn, (req, res) => {
  res.render('changePassword', {
    successMsg: req.flash('success'),
    errorMsg: req.flash('error')
  });
});

router.get('/profile', isLoggedIn, async (req, res) => {
  try {
    const user = await usersModel.findById(req.user._id).populate('likePhotoIds likeVideoIds');
    if (!user) {
      return res.status(404).send('User not found');
    }
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
    res.render('profile', { user, errorMessage, successMessage });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/profile/moredetail', isLoggedIn, async (req, res) => {
  try {
    const user = await usersModel.findById(req.user._id).populate('likePhotoIds savedPhotos likeVideoIds savedVideos');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('moredetail', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
})

// POST route to update user details
router.post('/profile/edit', isLoggedIn, multer.upload.single('userDp'), userController.postProfileEdit);


router.post('/changePassword', isLoggedIn, userController.updatePassword);

module.exports = router;