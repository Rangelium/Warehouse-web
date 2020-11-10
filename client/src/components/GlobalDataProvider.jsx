import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import AlertDialog from "./AlertDialog";

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
	state = {
		userLoggedIn: true,
		theme: {
			primary: "#000000",
		},
		storageId: null,

		success: this.showSuccess,
		alert: (a, b) => this.showAlert(a, b),
		setStorage: (a) => this.setStorage(a),

		_dialogOpen: false,
		_dialogRes: null,
		_dialogData: {
			title: "",
			text: "",
		},
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
	showAlert(title, text) {
		this.setState({
			_dialogOpen: true,
			_dialogData: {
				title,
				text,
			},
		});

		return new Promise((resolve) => {
			let interval = setInterval(() => {
				if (this.state._dialogRes !== null) {
					clearInterval(interval);
					resolve(this.state._dialogRes);
					this.setState({ _dialogRes: null });
				}
			}, 60);
		});
	}

	setStorage(id) {
		this.setState({
			storageId: id,
		});
	}

	render() {
		return (
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
				<AlertDialog
					handleClose={(res) => {
						this.setState({ _dialogOpen: false, _dialogRes: res });
					}}
					data={this.state._dialogData}
					open={this.state._dialogOpen}
				/>
			</GlobalDataContext.Provider>
		);
	}
}
