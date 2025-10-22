const {
  createCertificateService,
} = require("../services/certificate.service.js");

exports.createCertificateController = async (req, res) => {
  try {
    const issuedById = "384848raj894nlan";
    const result = await createCertificateService(req.body, issuedById);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
