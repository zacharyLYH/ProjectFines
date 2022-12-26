const User = require('../models/User')
const Car = require('../models/Car')
const Police = require('../models/Police')
const Admin = require('../models/Admin')
const Token = require('../models/Token')
const Offense = require('../models/Offense')
const CustomErrors = require('../errors')
const { StatusCodes } = require('http-status-codes')
const crypto = require('crypto')
const { attachCookiesToResponseAdmin, checkPermissions, createPayloadAdmin } = require('../utils')

const login = async (req, res) => {
    const { username, password } = req.body
    const findAdmin = await Admin.findOne({ username: username })
    if (!findAdmin) {
        throw new CustomErrors.NotFoundError('Failed')
    }
    const checkPassword = await findAdmin.comparePassword(password)
    if (!checkPassword) {
        throw new CustomErrors.UnauthenticatedError('Not found password')
    }
    let refreshToken = '';
    // check for existing token
    const existingToken = await Token.findOne({ adminMongoID: findAdmin._id });
    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid) {
            throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
        }
        refreshToken = existingToken.refreshToken;
        attachCookiesToResponseAdmin({ res, admin: existingToken, refreshToken });
    } else {
        refreshToken = crypto.randomBytes(40).toString('hex');
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userToken = { refreshToken, ip, userAgent, adminMongoID: findAdmin._id, role: 'admin' };
        await Token.create(userToken);
        const cookieToken = createPayloadAdmin(findAdmin)
        attachCookiesToResponseAdmin({ res, admin: cookieToken, refreshToken });
    }
    res.status(StatusCodes.OK).json({ msg: `Login succesful` });
}

const register = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        throw new CustomErrors.BadRequestError(`Bad details supplied`)
    }
    const tryFindingusername = await Admin.findOne({ username: username })
    if (tryFindingusername) {
        throw new CustomErrors.BadRequestError(`Attempting to create duplicate account`)
    }
    const admin = await Admin.create(req.body)
    res.status(StatusCodes.CREATED).json({ msg: `Register succesful`, admin: admin });
}

const showAllStaff = async (req, res) => {
    const allStaff = await Police.find({})
    res.status(StatusCodes.OK).json({ StaffList: allStaff });
}

const showOneStaff = async (req, res) => {
    const police = await Police.find({ badgenumber: req.params.id })
    if (!police) {
        throw new CustomErrors.BadRequestError(`Unable to find police ${police}`)
    }
    res.status(StatusCodes.OK).json({ staff: police });
}

const showOneUser = async (req, res) => {
    const user = await User.findOne({ email: req.params.email })
    if (!user) {
        throw new CustomErrors.BadRequestError(`Unable to find user ${user}`)
    }
    res.status(StatusCodes.OK).json({ user: user });
}

const updateStaff = async (req, res) => {
    const police = await Police.findOne({ badgenumber: req.params.id })
    if (!police) {
        throw new CustomErrors.BadRequestError(`Unable to find police ${police}`)
    }
    if (req.body.newPassword) {
        police.password = newPassword
        await police.save();
    }
    if (req.body.role) {
        police.role = req.body.role
        await police.save()
    }
    res.status(StatusCodes.OK).json({ msg: 'Updated!', police });
}

const showStaffTicketingHistory = async (req, res) => {
    const police = await Police.findOne({ badgenumber: req.params.id })
    let history = []
    for (const ticket of police.ticketingHistory) {
        const offense = await Offense.findOne({ _id: ticket })
        history.push(offense)
    }
    res.status(StatusCodes.OK).json({ history: history });
}

const updateUser = async (req, res) => {
    const { newPassword, name, email } = req.body
    const user = await User.findOne({ email: req.params.id })
    if (!user) {
        throw new CustomErrors.BadRequestError(`Unable to find user ${user}`)
    }
    if (newPassword) {
        user.password = newPassword
        await user.save();
    }
    if (name) {
        user.name = name
        await user.save();
    }
    if (email) {
        user.email = email
        await user.save()
    }
    await Token.findOneAndDelete({ userMongoID: user._id });
    res.cookie('accessToken', 'deleteAccount', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie('refreshToken', 'deleteAccount', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: 'Updated!' });
}

const deleteUser = async (req, res) => {
    const user = await User.findOne({ email: req.params.email })
    if (!user) {
        throw new CustomErrors.BadRequestError(`Unable to find user ${user}`)
    }
    for (const car of user.cars) {
        const carfound = await Car.findOne({ _id: car })
        if (carfound) {
            if (carfound.offensesIncurred.length != 0) {
                for(const offense of carfound.offensesIncurred){
                    const check = await Offense.findOne({_id:offense})
                    if(check.resolvedOrNot === 'false'){
                        throw new CustomErrors.UnauthorizedError('You have outstanding bills. Pay before delete')
                    }
                }
            }
        }
    }
    await Token.findOneAndDelete({ userMongoID: user._id });
    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    await user.remove()
    res.status(StatusCodes.OK).json({ msg: 'Deleted!' });
}

const getUserCars = async (req, res) => {
    const user = await User.findOne({ email: req.params.email })
    if (!user) {
        throw new CustomErrors.BadRequestError(`Unable to find user ${user}`)
    }
    let cars = []
    for (const car of user.cars) {
        const findCar = await Car.findOne({ _id: car })
        cars.push(findCar)
    }
    res.status(StatusCodes.OK).json({ cars: cars });
}

const getSpecificUserCar = async (req, res) => {
    const user = await User.findOne({ email: req.params.email })
    if (!user) {
        throw new CustomErrors.BadRequestError(`Unable to find user ${user}`)
    }
    let cars = []
    for (const car of user.cars) {
        const findCar = await Car.findOne({ _id: car })
        if (findCar.carPlate === req.params.carPlate) {
            cars.push(findCar)
            break
        }
    }
    if (cars.length == 0) {
        throw new CustomErrors.NotFoundError(`Unable to find car ${req.params.carPlate}`)
    }
    res.status(StatusCodes.OK).json({ cars: cars });
}

const getUserOffenses = async (req, res) => {
    const user = await User.findOne({ email: req.params.email })
    if (!user) {
        throw new CustomErrors.BadRequestError(`Unable to find user ${user}`)
    }
    let offenses = []
    let msg = 'Success'
    if (req.params.type === 'all') {
        for (const car of user.cars) {
            const found = await Car.findOne({ _id: car })
            for (const offenseID of found.offensesIncurred) {
                const off = await Offense.findOne({ _id: offenseID.toString() })
                offenses.push(off)
            }
            if (offenses.length() == 0) {
                msg = `No cars registered for this user`
            }
        }
    } else {
        let validate = false
        const found = await Car.findOne({ carPlate: req.params.type })
        for (const ids of user.cars) {
            const compare = await Car.findOne({ _id: ids.toString() })
            if (compare) {
                validate = true
                break
            }
        }
        if (!validate) {
            throw new CustomErrors.BadRequestError(`This car doesn't belong to user ${user.name}`)
        }
        for (const offenseID of found.offensesIncurred) {
            const off = await Offense.findOne({ _id: offenseID.toString() })
            offenses.push(off)
        }
        if (offenses.length == 0) {
            msg = `Couldn't find car plate ${req.params.type}`
        }
    }
    res.status(StatusCodes.OK).json({ msg: msg, offenses });
}

const logout = async (req, res) => {
    await Token.findOneAndDelete({ adminMongoID: req.admin.adminMongoID });

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
    register,
    login,
    showAllStaff,
    showOneStaff,
    updateStaff,
    showStaffTicketingHistory,
    logout,
    updateUser,
    showOneUser,
    getUserCars,
    getSpecificUserCar,
    getUserOffenses,
    deleteUser
}