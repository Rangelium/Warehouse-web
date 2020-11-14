import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import { AlertDialogContext } from "./AlertDialogContext";

const StyledToastContainer = styled(ToastContainer)`
	width: fit-content;
	min-width: 320px;
	max-width: 400px;

	.Toastify__toast--success {
		background-color: #167a16;
		color: #f3ffe9;
		height: 30px;

		.Toastify__progress-bar {
			background-color: #a8aaa5;
		}
	}
	.Toastify__toast--error {
		background-color: #c41b1b;
		color: #f3ffe9;
		height: 30px;
		.Toastify__progress-bar {
			background-color: #a8aaa5;
		}
	}
`;

export const GlobalDataContext = React.createContext();

export class GlobalDataProvider extends React.Component {
	static contextType = AlertDialogContext;
	state = {
		userLoggedIn: true,
		theme: {
			primary: "#000000",
		},
		storageId: null,

		success: this.showSuccess,
		error: this.showError,
		setStorage: (a) => this.setStorage(a),
		alert: (data) => this.context.alert(data),
	};

	showSuccess(msg) {
		toast.success(msg, {
			position: "bottom-right",
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
		});
	}
	showError(msg) {
		toast.error(msg, {
			position: "bottom-right",
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
		});
	}

	setStorage(id) {
		this.setState({
			storageId: id,
		});
	}

	render() {
		return (
			<>
				<GlobalDataContext.Provider value={this.state}>
					{this.props.children}
					<StyledToastContainer
						style={{
							zIndex: 100000000000000,
						}}
						position="bottom-right"
						autoClose={2000}
						hideProgressBar={false}
						newestOnTop
						closeOnClick
						rtl={false}
						pauseOnFocusLoss
						draggable
						pauseOnHover
					/>
				</GlobalDataContext.Provider>
			</>
		);
	}
}
