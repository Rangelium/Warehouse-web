import React from "react";

import styled from "styled-components";
import { TextField, Button } from "@material-ui/core";

const StyledInput = styled(TextField)`
	width: 100%;
	margin: 5px 0;

	.PrivateNotchedOutline-root-1 {
		transition: 0.3s;
	}

	label.Mui-focused {
		color: ${(props) => props.theme.colors.primary};
	}
	.Mui-focused fieldset {
		border-color: ${(props) => props.theme.colors.primary}!important;
	}
`;
export const Input = (props) => {
	return <StyledInput {...props} />;
};

const StyledButton = styled(Button)`
	color: ${(props) => props.theme.colors.primary};
	border-color: ${(props) => props.theme.colors.primary};
	font-size: 1.4rem;
`;
export const Button1 = (props) => {
	return <StyledButton {...props}>{props.children}</StyledButton>;
};
