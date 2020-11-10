import axios from "axios";
class API {
	async executeProcedure(procedure, data) {
		return new Promise((resolve, reject) => {
			axios({
				method: "post",
				url: "http://localhost:7000/api/dbconnect",
				data: { procedure: procedure, data: data },
				timeout: 2000,
			})
				.then((res) => {
					if (res.data.error) reject(res.data.error);
					resolve(res.data.result);
				})
				.catch((err) => {
					console.log(err);
					reject(err);
				});
		});
	}
}

export default new API();
