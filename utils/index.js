const { createJWT,attachCookiesToResponseAdmin,validateAndDecipherTokenAdmin, validateAndDecipherTokenPolice, validateAndDecipherTokenUser, attachCookiesToResponsePolice, attachCookiesToResponseUser } = require('./jwt');
const {createPayloadPolice,createPayloadUser,createPayloadAdmin} = require('./createPayload');
const checkPermissions = require('./checkPermissions');
const createHash = require('./createHash');

module.exports = {
  createJWT,
  validateAndDecipherTokenPolice,
  validateAndDecipherTokenUser,
  attachCookiesToResponsePolice,
  createPayloadPolice,
  checkPermissions,
  createHash,
  attachCookiesToResponseUser,
  createPayloadUser,
  createPayloadAdmin,
  attachCookiesToResponseAdmin,
  validateAndDecipherTokenAdmin
};
