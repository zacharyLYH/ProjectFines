const CustomError = require('../errors');
const Token = require('../models/Token');
const { attachCookiesToResponseUser, validateAndDecipherTokenUser } = require('../utils');

const authenticateUser = async (req, res, next) => {
    const { refreshToken, accessToken } = req.signedCookies;
    try {
        if (accessToken) {
            const payload = validateAndDecipherTokenUser(accessToken);
            req.user = payload.user;
            return next();
        }
        const payload = validateAndDecipherTokenUser(refreshToken);

        const existingToken = await Token.findOne({
            userMongoID: payload.user.userMongoID,
            refreshToken: payload.refreshToken,
        });

        if (!existingToken || !existingToken?.isValid) {
            throw new CustomError.UnauthenticatedError('Authentication Invalid');
        }
        attachCookiesToResponseUser({
            res,
            user: payload.user,
            refreshToken: existingToken.refreshToken,
        });
        req.user = payload.user;
        next();
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
};

const quickPermissionsCheckUser = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new CustomError.UnauthorizedError(
                'Unauthorized to access this route quick'
            );
        }
        next();
    };
};

module.exports = {
    authenticateUser,
    quickPermissionsCheckUser,
};