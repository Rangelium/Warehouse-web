import axios from "axios";

const timeoutDelay = 3000;
class API {
	async executeProcedure(procedure, data) {
		return new Promise(async (resolve, reject) => {
			let obtainedRes = false;

			while (!obtainedRes) {
				let res = await axios({
					method: "post",
					url: "http://localhost:7000/api/dbconnect",
					data: { procedure: procedure, data: data },
					timeout: timeoutDelay,
				}).catch((err) => {
					if (
						err.message !== `timeout of ${timeoutDelay}ms exceeded` &&
						err.message !== "Network Error"
					) {
						return { error: err, errText: err.response.data.errText };
					}
					console.log("Trying to reconnect...");
				});

				if (res) {
					if (res.error) {
						reject(res);
					} else {
						resolve(res.data);
					}
					return;
				}
			}
		});
	}
}

export default new API();
