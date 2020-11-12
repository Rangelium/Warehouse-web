import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import { AlertDialogContext } from "./AlertDialogContext";

const StyledToastContainer = styled(ToastContainer).attrs({
	className: "toast-container",
	toastClassName: "toast",
	bodyClassName: "body",
	progressClassName: "progress",
})`
	.toast {
		background-color: #071107;
		color: #f3ffe9;
		height: 30px;
	}
	.progress {
		background-color: #f3ffe9;
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
