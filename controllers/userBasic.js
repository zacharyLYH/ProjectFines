const User = require('../models/User')
const Car = require('../models/Car')
const Token = require('../models/Token')
const CustomErrors = require('../errors')
const { StatusCodes } = require('http-status-codes')
const crypto = require('crypto')
const { attachCookiesToResponseUser, checkPermissions, createPayloadUser } = require('../utils')
const Offense = require('../models/Offense')
const stripe = require('stripe')(process.env.STRIPE_API_SECRET);

const register = async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        throw new CustomErrors.BadRequestError(`Please supply all fields`)
    }
    const tryFindingUser = await User.findOne({ name: name, email: email })
    if (tryFindingUser) {
        throw new CustomErrors.BadRequestError(`Attempting to create duplicate account`)
    }
    const user = await User.create({name:name, email:email, password:password})
    res.status(StatusCodes.CREATED).json({ msg: `Register succesful`, user: user });
}

const login = async (req, res) => {
    const { email, password } = req.body
    const findUser = await User.findOne({ email: email })
    if (!findUser) {
        throw new CustomErrors.NotFoundError('Failed')
    }
    const checkPassword = await findUser.comparePassword(password)
    if (!checkPassword) {
        throw new CustomErrors.UnauthenticatedError('Not found password')
    }
    const existingToken = await Token.findOne({ userMongoID: findUser._id });
    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid) {
            throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
        }
        refreshToken = existingToken.refreshToken;
        attachCookiesToResponseUser({ res, user: existingToken, refreshToken });
    } else {
        refreshToken = crypto.randomBytes(40).toString('hex');
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userToken = { refreshToken, ip, userAgent, userMongoID: findUser._id, role: 'user' };
        await Token.create(userToken);
        const cookieToken = createPayloadUser(findUser)
        attachCookiesToResponseUser({ res, user: cookieToken, refreshToken });
    }
    res.status(StatusCodes.OK).json({ msg: `Login succesful` });
}

const showMe = async (req, res) => {
    const { userMongoID } = req.user
    const findMe = await User.findOne({ _id: userMongoID })
    checkPermissions(req.user, findMe._id)
    const message = { name: findMe.name, email: findMe.email }
    res.status(StatusCodes.OK).json({ message, mongoID: userMongoID });
}

const updateAccount = async (req, res) => {
    const { oldPassword, newPassword, email, name } = req.body
    const { userMongoID } = req.user
    const user = await User.findOne({ _id: userMongoID })
    checkPermissions(req.user, user._id)
    if (oldPassword && !newPassword || newPassword && !oldPassword) {
        throw new CustomErrors.BadRequestError('Please provide old and new passwords');
    }
    if (oldPassword && newPassword) {
        const isPasswordCorrect = await user.comparePassword(oldPassword);
        if (!isPasswordCorrect) {
            throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
        }
        user.password = newPassword;
        await user.save();
    }
    if (name) {
        user.name = name
        await user.save()
        const newToken = createPayloadUser(user)
        const existingToken = await Token.findOne({ userMongoID: user._id });
        attachCookiesToResponseUser({ res, user: newToken, refreshToken: existingToken.refreshToken })
    }
    if (email) {
        user.email = email
        await user.save()
    }
    res.status(StatusCodes.OK).json({ msg: `Update succesful` });
}

const deleteAccount = async (req, res) => {
    const del = await User.findOne({ _id: req.user.userMongoID })
    checkPermissions(req.user, del._id)
    const car = await Car.findOne(({ ownerMongoID: req.user.userMongoID }))
    if (car) {
        if (car.offensesIncurred.length != 0) {
            for(const offense of car.offensesIncurred){
                const check = await Offense.findOne({_id:offense})
                if(check.resolvedOrNot === 'false'){
                    throw new CustomErrors.UnauthorizedError('You have outstanding bills. Pay before delete')
                }
            }
        }
    }
    await Token.findOneAndDelete({ userMongoID: req.user.userMongoID });
    res.cookie('accessToken', 'deleteAccount', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie('refreshToken', 'deleteAccount', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    await del.remove()
    res.status(StatusCodes.OK).json({ msg: `Delete succesful` });
}

const addPaymentProfile = async (req, res) => {
    const user = await User.findOne({ _id: req.user.userMongoID })
    const { cardNumber, ccv, expiryMonth, expiryYear, nameOnCard, zipCode } = req.body
    if (!cardNumber || !ccv || !expiryMonth || !expiryYear || !nameOnCard || !zipCode) {
        throw new CustomErrors.BadRequestError('Please fill in all fields')
    }
    const paymentProfile = { cardNumber: cardNumber, ccv: ccv, expiryMonth: expiryMonth, expiryYear: expiryYear, nameOnCard: nameOnCard, zipCode: zipCode }
    if (user.paymentProfile.length != 0) {
        for (const profiles of user.paymentProfile) {
            if (profiles.cardNumber === cardNumber && profiles.ccv === ccv && profiles.expiryMonth === expiryMonth && profiles.expiryYear === expiryYear && profiles.nameOnCard === nameOnCard) {
                throw new CustomErrors.BadRequestError('This profile has already been created')
            }
        }
    }
    user.paymentProfile = [...user.paymentProfile, paymentProfile]
    await user.save()
    res.status(StatusCodes.CREATED).json({ msg: `Created profile`, profile: paymentProfile });
}

const showAllPaymentProfile = async (req, res) => {
    const user = await User.findOne({ _id: req.user.userMongoID })
    if (!user) {
        throw new CustomErrors.UnauthenticatedError(`Not allowed access`)
    }
    res.status(StatusCodes.OK).json({ profiles: user.paymentProfile });
}

const updatePaymentProfile = async (req, res) => {
    const user = await User.findOne({ _id: req.user.userMongoID })
    const { cardNumber, ccv, expiryMonth, expiryYear, nameOnCard, zipCode } = req.body
    if (!cardNumber || !ccv || !expiryMonth || !expiryYear || !nameOnCard || !zipCode) {
        throw new CustomErrors.BadRequestError('Please fill in all fields')
    }
    if (!user) {
        throw new CustomErrors.UnauthenticatedError(`Not allowed access`)
    }
    const paymentProfile = { cardNumber: cardNumber, ccv: ccv, expiryMonth: expiryMonth, expiryYear: expiryYear, nameOnCard: nameOnCard, zipCode: zipCode }
    if (user.paymentProfile.length != 0) {
        for (i = 0; i < user.paymentProfile.length; i++) {
            if (user.paymentProfile[i]._id.toString() === req.params.id) {
                user.paymentProfile.splice(i, 1)
                break
            }
        }
    }
    user.paymentProfile = [...user.paymentProfile, paymentProfile]
    await user.save()
    res.status(StatusCodes.OK).json({ msg: `Updated` });
}

const deletePaymentProfile = async (req, res) => {
    const user = await User.findOne({ _id: req.user.userMongoID })
    if (!user) {
        throw new CustomErrors.UnauthenticatedError(`Not allowed access`)
    }
    if (user.paymentProfile.length != 0) {
        for (i = 0; i < user.paymentProfile.length; i++) {
            if (user.paymentProfile[i]._id.toString() === req.params.id) {
                user.paymentProfile.splice(i, 1)
                break
            }
        }
    }
    await user.save()
    res.status(StatusCodes.OK).json({ msg: `Deleted` });
}

const stripeController = async (req, res) => { //untested
    const user = await User.findOne({ _id: req.user.userMongoID })
    let validate = false
    for (const carID of user.cars) {
        const car = await Car.findOne({ _id: carID.toString() })
        for (const off of car.offensesIncurred) {
            if (off.toString() === req.params.pay) {
                validate = true
            }
        }
    }
    if (!validate) {
        throw new CustomErrors.UnauthenticatedError(`Authentication failed`)
    }
    const offense = await Offense.findOne({ _id: req.params.pay })
    if (!offense) {
        throw new CustomErrors.NotFoundError(`Couldn't find this offense`)
    }
    const offenses = new Map();
    offenses.set('drunkDriving', 1);
    offenses.set('speeding', 2);
    const calculateAmount = () => {
        return offenses.get(offense.offenseType)
    };

    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateAmount(),
        currency: 'usd',
    });
    offense.resolvedOrNot = true
    offense.resolvedDateTime = Date.now()
    await offense.save()
    const payment = { offenseID: req.params.pay, amount: calculateAmount(), paymentProfile: req.body.profileID }
    user.paymentHistory.push(payment)
    await user.save()
    res.json({ clientSecret: paymentIntent.client_secret });
};

const logout = async (req, res) => {
    await Token.findOneAndDelete({ userMongoID: req.user.userMongoID });
    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: `Logout succesful` });
}

module.exports = { register, login, updateAccount, deleteAccount, showMe, logout, addPaymentProfile, showAllPaymentProfile, updatePaymentProfile, deletePaymentProfile, stripeController }