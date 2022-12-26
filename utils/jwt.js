const jwt = require('jsonwebtoken');

const createJWT = ({ payload }) => {
  if(payload.user){
    const token = jwt.sign(payload, process.env.JWT_SECRET_USER);
    return token;
  }
  if(payload.police){
    const token = jwt.sign(payload, process.env.JWT_SECRET_POLICE);
    return token;
  }
  if(payload.admin){
    const token = jwt.sign(payload, process.env.JWT_SECRET_ADMIN);
    return token;
  }
};

const validateAndDecipherTokenPolice = (token) =>  jwt.verify(token, process.env.JWT_SECRET_POLICE);

const validateAndDecipherTokenUser = (token) => jwt.verify(token, process.env.JWT_SECRET_USER);

const validateAndDecipherTokenAdmin = (token) => jwt.verify(token, process.env.JWT_SECRET_ADMIN);

const attachCookiesToResponsePolice = ({ res, police, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { police } });
  const refreshTokenJWT = createJWT({ payload: { police, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;
  const longerExp = 1000 * 60 * 60 * 24 * 30;

  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + longerExp),
  });
};

const attachCookiesToResponseUser = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  const oneDay = 1000 * 10;
  const longerExp = 1000 * 60 * 60 * 24 * 30;

  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + longerExp),
  });
};

const attachCookiesToResponseAdmin = ({ res, admin, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { admin } });
  const refreshTokenJWT = createJWT({ payload: { admin, refreshToken } });

  const oneDay = 1000 * 10;
  const longerExp = 1000 * 60 * 60 * 24 * 30;

  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + longerExp),
  });
};

module.exports = {
  createJWT,
  validateAndDecipherTokenPolice,
  validateAndDecipherTokenUser,
  attachCookiesToResponsePolice,
  attachCookiesToResponseUser,
  attachCookiesToResponseAdmin,
  validateAndDecipherTokenAdmin
};
