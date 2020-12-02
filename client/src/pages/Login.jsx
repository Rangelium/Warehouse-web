import React from "react";

import { GlobalDataContext } from "../components/GlobalDataProvider";
import api from "../tools/connect";

import styled from "styled-components";
import { InputAdornment, IconButton } from "@material-ui/core";
import { AccountCircle, Visibility, VisibilityOff } from "@material-ui/icons/";

import { CustomButton, CustomTextInput } from "../components/UtilComponents";

import bgImage from "../assets/login_BG.jpg";
import WavesSvg from "../assets/waves.svg";

const StyledSection = styled.section`
	width: 100vw;
	height: 100vh;
	position: relative;
	display: flex;
	background-color: #fff;
	overflow: hidden;

	.block {
		height: 100%;
		display: flex;
		align-items: center;
		background-color: transparent;
		z-index: 10;
	}

	.left {
		flex-grow: 1;

		@media only screen and (max-width: 1100px) {
			display: none;
		}
	}

	.right {
		width: 35%;
		left: 0;
		max-width: 600px;

		position: relative;
		justify-content: center;
		align-items: flex-start;
		transition: 0.4s;

		@media only screen and (max-width: 1100px) {
			width: 100%;
			left: 50%;
			transform: translateX(-50%);
		}
	}
`;
const WarehouseWindow = styled.div`
	width: 100%;
	height: 100%;
	box-shadow: inset 0px 0px 20px 40px rgba(0, 0, 0, 0.7);
	border-right: 3px solid #000;
	border-radius: 0px 500px 500px 0px;
	overflow: hidden;
	filter: brightness(70%);
	background-image: url(${bgImage});
	background-repeat: no-repeat;
	background-size: cover;
`;
const Waves = styled.img`
	position: absolute;
	left: 0;
	bottom: 0;
	z-index: 1;
`;
const StyledForm = styled.form`
	display: flex;
	flex-direction: column;
	/* justify-content: center; */
	justify-content: space-around;
	align-items: center;
	width: 75%;
	height: 70%;
	position: relative;
	top: 45%;
	transform: translateY(-50%);
	border: 1px solid ${(props) => (props.error ? "red" : "#242423")};
	padding: 10px 30px;
	transition: 0.3s;

	border-radius: 50px;

	h1 {
		margin: 0;
		position: relative;
		/* top: 20px; */
		font-family: "Montserrat";
		text-transform: uppercase;
		font-weight: 700;
		font-size: 3.6em;
		color: #242423;
	}

	.row {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-around;
		flex-direction: column;
		gap: 20px;

		.MuiFormControl-root {
			width: 100%;
		}
	}
`;

class Login extends React.Component {
	static contextType = GlobalDataContext;
	constructor() {
		super();

		this.state = {
			username: {
				value: "",
				error: false,
				errorText: "",
			},
			password: {
				value: "",
				error: false,
				errorText: "",
				showPassword: false,
			},
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
		this.resetAfterError = this.resetAfterError.bind(this);
		this.handleIncorrectLoginData = this.handleIncorrectLoginData.bind(this);
	}

	handleClickShowPassword() {
		this.setState((prevState) => {
			return {
				password: {
					...prevState.password,
					showPassword: !prevState.password.showPassword,
				},
			};
		});
	}
	handleChange(event) {
		this.setState({
			[event.target.name]: {
				...this.state[event.target.name],
				value: event.target.value,
			},
		});
	}
	resetAfterError(timeout = 1400) {
		setTimeout(() => {
			this.setState({
				username: {
					...this.state.username,
					error: false,
					errorText: "",
				},
				password: {
					...this.state.password,
					error: false,
					errorText: "",
				},
			});
		}, timeout);
	}
	checkValidity(username, password) {
		if (username.trim() === "") {
			this.setState({
				username: {
					...this.state.username,
					error: true,
					errorText: "Username cannot be empty",
				},
			});

			this.resetAfterError();
		}
		if (password.trim() === "") {
			this.setState({
				password: {
					...this.state.password,
					error: true,
					errorText: "Password cannot be empty",
				},
			});

			this.resetAfterError();
		}
		if (username.trim() === "" || password.trim() === "") return false;
		return true;
	}
	handleIncorrectLoginData() {
		this.setState({
			username: {
				...this.state.username,
				error: true,
			},
			password: {
				...this.state.password,
				error: true,
				value: "",
				errorText: "Incorect username or password",
			},
		});

		this.resetAfterError();
	}
	handleSubmit(event) {
		event.preventDefault();
		if (!this.checkValidity(this.state.username.value, this.state.password.value)) return;

		api
			.login(this.state.username.value, this.state.password.value)
			.then((res) => {
				if (res.data[0]) {
					if (res.data[0].hasOwnProperty("error")) {
						this.context.error("Invalid username or password");
						this.handleIncorrectLoginData();
					}
				} else {
					this.context.setToken(res.data.token);
					this.props.history.push("/");
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}

	render() {
		return (
			<StyledSection>
				<div className=" block left">
					<WarehouseWindow />
				</div>
				<div className="block right">
					<StyledForm
						error={this.state.username.error || this.state.password.error}
						onSubmit={this.handleSubmit}
						autoComplete="off"
					>
						<h1>Login</h1>
						<div className="row">
							<CustomTextInput
								autoFocus={true}
								name="username"
								value={this.state.username.value}
								onChange={this.handleChange}
								label="Username:"
								error={this.state.username.error}
								helperText={
									this.state.username.errorText ? this.state.username.errorText : false
								}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<AccountCircle />
										</InputAdornment>
									),
								}}
							/>
							<CustomTextInput
								name="password"
								value={this.state.password.value}
								onChange={this.handleChange}
								type={this.state.password.showPassword ? "text" : "password"}
								label="Password"
								variant="outlined"
								error={this.state.password.error}
								helperText={
									this.state.password.errorText ? this.state.password.errorText : false
								}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton onClick={this.handleClickShowPassword} edge="end">
												{this.state.password.showPassword ? (
													<VisibilityOff />
												) : (
													<Visibility />
												)}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
						</div>
						<CustomButton variant="outlined" size="large" type="submit">
							LOGIN
						</CustomButton>
					</StyledForm>
				</div>
				<Waves src={WavesSvg} alt="Waves" />
			</StyledSection>
		);
	}
}

export default Login;
