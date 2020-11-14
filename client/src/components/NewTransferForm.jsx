import React, { Component } from "react";
import styled from "styled-components";

import { CustomButton } from "./UtilComponents";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const StyledDialog = styled(Dialog)`
	.MuiPaper-root {
		padding-bottom: 10px;
	}

	.MuiDialogTitle-root {
		background-color: #f5f5f5;

		.MuiTypography-root {
			font-size: 1.6rem;
		}
	}

	.MuiDialogContent-root {
		.MuiTypography-root {
			color: #231f20;
		}
	}

	.MuiDialogActions-root {
		padding: 8px 24px;
		justify-content: flex-start;
	}
`;

export default class NewTransferForm extends Component {
	handleSubmit(e) {
		e.preventDefault();

		this.props.close();
	}

	render() {
		return (
			<StyledDialog
				style={{ zIndex: 2147 }}
				open={this.props.open}
				onClose={this.props.close}
			>
				<form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
					<DialogTitle>Yeni transfer</DialogTitle>
					<DialogContent></DialogContent>
					<DialogActions>
						<CustomButton type="submit">Əlavə et</CustomButton>
						<CustomButton onClick={this.props.close}>İmtina</CustomButton>
					</DialogActions>
				</form>
			</StyledDialog>
		);
	}
}
