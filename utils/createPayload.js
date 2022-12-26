const createPayloadPolice = (police) => {
  return { badgenumber: police.badgenumber, policeMongoID: police._id, role: police.role };
};

const createPayloadUser = (user) => {
  return { name: user.name, userMongoID: user._id, role: user.role };
};

const createPayloadAdmin= (admin) => {
  return { name: admin.username, adminMongoID: admin._id, role: admin.role };
};

module.exports = {createPayloadUser,createPayloadPolice,createPayloadAdmin};
