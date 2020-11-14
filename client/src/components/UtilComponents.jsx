// Created by Emin Azadov
// Based on Material UI design

import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";

import {
	TextField,
	Button,
	FormControl,
	Select,
	MenuItem,
	InputLabel,
} from "@material-ui/core";

// * ==============================================================================================
// *                                        Custom Select
// * ==============================================================================================

const StyledSelect = styled(FormControl)`
	.MuiOutlinedInput-input {
		min-width: 160px;
		padding: 14px 14px;

		&:focus {
			background-color: transparent;
		}
	}
	.MuiInputLabel-outlined {
		transform: translate(14px, 16px) scale(1);
	}
	.MuiInputLabel-outlined.MuiInputLabel-shrink {
		transform: translate(14px, -6px) scale(0.75);
	}

	.MuiFormLabel-root.Mui-disabled {
		color: rgba(0, 0, 0, 0.38);
	}

	.MuiFormLabel-root {
		color: #231f20;
	}
	.MuiFormLabel-root.Mui-focused {
		color: #f9c20a;
	}
	.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
		border-color: #f9c20a;
	}
`;

export class CustomSelect extends Component {
	render() {
		return (
			<StyledSelect variant="outlined">
				<InputLabel disabled={this.props.disabled}>{`${this.props.label} ${
					this.props.required ? "*" : ""
				}`}</InputLabel>
				<Select {...this.props}>{this.props.children}</Select>
			</StyledSelect>
		);
	}
}
export class CustomSelectItem extends Component {
	render() {
		return <MenuItem {...this.props}>{this.props.children}</MenuItem>;
	}
}

// * ==============================================================================================
// *                                        Custom TextField
// * ==============================================================================================

const StyledTextField = styled(TextField)`
	.MuiOutlinedInput-input {
		padding: 14px 14px;
	}
	.MuiInputLabel-outlined {
		transform: translate(14px, 16px) scale(1);
	}
	.MuiInputLabel-outlined.MuiInputLabel-shrink {
		transform: translate(14px, -6px) scale(0.75);
	}

	.MuiFormLabel-root.Mui-disabled {
		color: rgba(0, 0, 0, 0.38);
	}

	.MuiFormLabel-root {
		color: #231f20;
	}
	.MuiFormLabel-root.Mui-focused {
		color: #f9c20a;
	}
	.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
		border-color: #f9c20a;
	}
`;

export class CustomTextInput extends Component {
	render() {
		return <StyledTextField {...this.props} />;
	}
}

// * ==============================================================================================
// *                                        Custom Button
// * ==============================================================================================

const StyledContainedButton = styled(Button)`
	text-transform: capitalize;
	white-space: nowrap;
	/* height: 100%; */

	&:hover {
		background-color: transparent;
		border-color: #f9c20a;

		.MuiButton-label {
			color: #f9c20a;
		}
	}

	.MuiButton-label {
		color: rgba(0, 0, 0, 0.87);
		transition: 250ms;
	}
`;

export class CustomButton extends Component {
	render() {
		return (
			<StyledContainedButton {...this.props}>{this.props.children}</StyledContainedButton>
		);
	}
}
