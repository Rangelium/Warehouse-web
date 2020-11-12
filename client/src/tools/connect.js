import axios from "axios";

const timeoutDelay = 3000;
class API {
	async executeProcedure(procedure, data) {
		let obtainedRes = false;

		while (!obtainedRes) {
			let res = await axios({
				method: "post",
				url: "http://localhost:7000/api/dbconnect",
				data: { procedure: procedure, data: data },
				timeout: timeoutDelay,
			}).catch((err) => {
				console.log(err);
				if (
					err.message !== `timeout of ${timeoutDelay}ms exceeded` &&
					err.message !== "Network Error"
				) {
					return Error(err.message);
				}
			});

			if (res) {
				if (res.data.error) {
					return Error(res.data.error);
				}
				return res.data.result;
			}
		}
	}
}

export default new API();
