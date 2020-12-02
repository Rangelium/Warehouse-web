import axios from "axios";

axios.defaults.baseURL = "http://localhost:7000/api";

const timeoutDelay = 3000;
class API {
	async executeProcedure(procedure, data) {
		return new Promise(async (resolve, reject) => {
			let obtainedRes = false;

			while (!obtainedRes) {
				let res = await axios({
					method: "post",
					url: "/dbconnect",
					data: { procedure: procedure, data: data },
					timeout: timeoutDelay,
				}).catch((err) => {
					console.log(err);
					if (
						err.message !== `timeout of ${timeoutDelay}ms exceeded` &&
						err.message !== "Network Error"
					) {
						console.log(err.response.data.errText);
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

	uploadTransferFile(data) {
		return new Promise((resolve, reject) => {
			axios({
				method: "post",
				url: "/uploadTransferFile",
				data,
				timeout: timeoutDelay,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
				.then((res) => {
					resolve(res);
				})
				.catch((err) => {
					console.log(err.response);
					reject(err);
				});
		});
	}

	uploadWarehouseRemoveFile(data) {
		return new Promise((resolve, reject) => {
			axios({
				method: "post",
				url: "/uploadWarehouseRemoveFile",
				data,
				timeout: timeoutDelay,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
				.then((res) => {
					resolve(res);
				})
				.catch((err) => {
					console.log(err.response);
					reject(err);
				});
		});
	}

	login(username, password) {
		return new Promise((resolve, reject) => {
			axios({
				method: "post",
				baseURL: "http://172.16.3.101:54321/api/login",
				data: { username, password },
				timeout: timeoutDelay,
			})
				.then((res) => {
					resolve(res);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
}

export default new API();
