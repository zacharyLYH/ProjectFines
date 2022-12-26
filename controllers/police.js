const Police = require('../models/Police')
const Token = require('../models/Token')
const Offense = require('../models/Offense')
const CustomErrors = require('../errors')
const { StatusCodes } = require('http-status-codes')
const crypto = require('crypto')
const { attachCookiesToResponsePolice, checkPermissions, createPayloadPolice } = require('../utils')

const login = async (req, res) => {
    const { badgenumber, password } = req.body
    const findPolice = await Police.findOne({ badgenumber: badgenumber })
    if (!findPolice) {
        throw new CustomErrors.NotFoundError('Failed')
    }
    const checkPassword = await findPolice.comparePassword(password)
    if (!checkPassword) {
        throw new CustomErrors.UnauthenticatedError('Not found password')
    }
    let refreshToken = '';
    // check for existing token
    const existingToken = await Token.findOne({ policeMongoID: findPolice._id });
    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid) {
            throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
        }
        refreshToken = existingToken.refreshToken;
        attachCookiesToResponsePolice({ res, police: existingToken, refreshToken });
    } else {
        refreshToken = crypto.randomBytes(40).toString('hex');
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userToken = { refreshToken, ip, userAgent, policeMongoID: findPolice._id, role: 'police' };
        await Token.create(userToken);
        const cookieToken = createPayloadPolice(findPolice)
        attachCookiesToResponsePolice({ res, police: cookieToken, refreshToken });
    }
    findPolice.loginHistory.push(Date.now())
    await findPolice.save()
    res.status(StatusCodes.OK).json({ msg: `Login succesful` });
}

const register = async (req, res) => {
    const { badgenumber, password } = req.body
    if (!badgenumber || !password) {
        throw new CustomErrors.BadRequestError(`Bad details supplied`)
    }
    const tryFindingBadgeNumber = await Police.findOne({ badgenumber: badgenumber })
    if (tryFindingBadgeNumber) {
        throw new CustomErrors.BadRequestError(`Attempting to create duplicate account`)
    }
    const police = await Police.create(req.body)
    police.loginHistory = []
    police.role = 'police'
    await police.save()
    res.status(StatusCodes.CREATED).json({ msg: `Register succesful`, police: police });
}

const loginHistory = async (req, res) => {
    const findPolice = await Police.findOne({ _id: req.police.policeMongoID })
    if (!findPolice) {
        throw new CustomErrors.NotFoundError(`Counldn't find account`)
    }
    res.status(StatusCodes.OK).json({ history: findPolice.loginHistory });
}

const showMe = async (req, res) => {
    const { policeMongoID } = req.police
    const findMe = await Police.findOne({ _id: policeMongoID })
    const message = { badgenumber: findMe.badgenumber, role: findMe.role, forDebugging: req.police }
    res.status(StatusCodes.OK).json(message);
}

const updatePolicePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new CustomErrors.BadRequestError('Please provide both values');
    }
    const { policeMongoID } = req.police
    const police = await Police.findOne({ _id: policeMongoID })
    const isPasswordCorrect = await police.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
    }
    police.password = newPassword;
    await police.save();
    res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

const showMyTicketingHistory = async (req, res) => {
    const { policeMongoID } = req.police
    const police = await Police.findOne({ _id: policeMongoID })
    let history = []
    for (const ticket of police.ticketingHistory) {
        const offense = await Offense.findOne({ _id: ticket })
        history.push(offense)
    }
    res.status(StatusCodes.OK).json(history);
}

const logout = async (req, res) => {
    await Token.findOneAndDelete({ policeMongoID: req.police.policeMongoID });

    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: 'Succesfully logged out!' });
};

module.exports = {
    login,
    register,
    loginHistory,
    showMe,
    updatePolicePassword,
    logout,
    showMyTicketingHistory,
}
