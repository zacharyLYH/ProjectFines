const CustomError = require('../errors');
const Token = require('../models/Token');
const { attachCookiesToResponseAdmin, validateAndDecipherTokenAdmin } = require('../utils');

const authenticateAdmin = async (req, res, next) => {
    const { refreshToken, accessToken } = req.signedCookies;
    try {
        if (accessToken) {
            const payload = validateAndDecipherTokenAdmin(accessToken);
            req.admin = payload.admin;
            return next();
        }
        const payload = validateAndDecipherTokenAdmin(refreshToken);

        const existingToken = await Token.findOne({
            adminMongoID: payload.admin.adminMongoID,
            refreshToken: payload.refreshToken,
        });

        if (!existingToken || !existingToken?.isValid) {
            throw new CustomError.UnauthenticatedError('Authentication Invalid');
        }
        attachCookiesToResponseAdmin({
            res,
            admin: payload.admin,
            refreshToken: existingToken.refreshToken,
        });
        req.admin = payload.admin;
        next();
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
};

const quickPermissionsCheckAdmin = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            throw new CustomError.UnauthorizedError(
                'Unauthorized to access this route quick'
            );
        }
        next();
    };
};

module.exports = {
    authenticateAdmin,
    quickPermissionsCheckAdmin,
};