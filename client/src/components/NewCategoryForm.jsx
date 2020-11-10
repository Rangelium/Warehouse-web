import React, { Component } from "react";
import styled from "styled-components";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";

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
		margin-top: 15px;
	}

	.MuiDialogActions-root {
		padding: 8px 24px;
		justify-content: flex-start;
	}
`;
const StyledButton = styled(Button)`
	background-color: ${(props) => (props.submit ? "#F9C20A" : "#D7D8D6")};
	text-transform: capitalize;

	&:hover {
		background-color: ${(props) => (props.submit ? "#F9C20A" : "")};
	}
`;
const StyledTextField = styled(TextField)`
	width: 400px;

	.MuiFormLabel-root.Mui-focused {
		color: #f9c20a;
	}
	.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
		border-color: #f9c20a;
	}
`;

export default class NewCategoryForm extends Component {
	state = {
		newCategoryText: "",
	};

	handleChange(e) {
		this.setState({
			newCategoryText: e.target.value,
		});
	}

	handleSubmit(e) {
		e.preventDefault();
	}

	render() {
		return (
			<StyledDialog open={this.props.open} onClose={this.props.handleClose}>
				<form onSubmit={this.handleSubmit} autoComplete="off">
					<DialogTitle>Yeni kateqoriya yarat</DialogTitle>
					<DialogContent>
						<StyledTextField
							required
							variant="outlined"
							label="Kateqoriyanın adı"
							value={this.state.newCategoryText}
							onChange={this.handleChange.bind(this)}
						/>
					</DialogContent>
					<DialogActions>
						<StyledButton type="submit" variant="contained" submit={1}>
							Yadda saxla
						</StyledButton>
						<StyledButton variant="contained" onClick={this.props.handleClose}>
							İmtina
						</StyledButton>
					</DialogActions>
				</form>
			</StyledDialog>
		);
	}
}
