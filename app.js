require('dotenv').config();
require('express-async-errors');

// express
const express = require('express');
const app = express();

// rest of the packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

// database
const connectDB = require('./db/connect');

//images
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
app.use(fileUpload({ useTempFiles: true }));

//import routers
const police = require('./routers/policeRouter')
const offense = require('./routers/offenseRouter')
const admin = require('./routers/adminRouter')
const user = require('./routers/userRouter')
const car = require('./routers/carRouter')

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

//debug
app.use(morgan('tiny'))

//Security
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser([process.env.JWT_SECRET_POLICE,process.env.JWT_SECRET_USER]));

app.get('/',(req,res) =>{
  res.send('Home page')
})
//use routers
app.use('/api/v1/user',user)
app.use('/api/v1/offense',offense)
app.use('/api/v1/police',police)
app.use('/api/v1/admin',admin)
app.use('/api/v1/car',car)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start(); 