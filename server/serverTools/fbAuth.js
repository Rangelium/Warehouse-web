const jwtDecode = require("jwt-decode");
const { Int } = require("mssql");

module.exports = (req, res, next) => {
	let idToken;
	if (req.headers.authentication && req.headers.authentication.startsWith("Bearer ")) {
		idToken = req.headers.authentication.split("Bearer ")[1];
	} else {
		console.error("No token found");
		return res.status(403).json({ error: "unauthorized" });
	}

	const token = jwtDecode(idToken);
	const data = token.data;

	if (data.id) {
		return next();
	}
	return res.status(403).json({ error: "unauthorized" });
};
