import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import uuid from "react-uuid";
import styled from "styled-components";
import api from "../tools/connect";
import { GlobalDataContext } from "./GlobalDataProvider";

import {
	Divider,
	Typography,
	Select,
	MenuItem,
	List,
	ListItem,
	ListItemText,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { ReactComponent as ExpressLogo } from "../assets/expressLogo.svg";

const StyledAppbar = styled.nav`
	background-color: #ffffff;
	box-shadow: none;
	border-bottom: 2px solid rgb(35, 31, 32, 0.1);
	height: 56px;
	align-items: center;
	display: flex;

	hr {
		height: 2rem;
		margin-right: 12px;
	}

	.MuiSelect-root {
		color: #231f20;
		font-weight: 600;
	}

	.links {
		margin-left: auto;
		flex-grow: 0.6;
		height: 100%;
		display: flex;
		justify-content: space-around;
		align-items: center;

		.link {
			cursor: pointer;
			height: 100%;
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;

			.MuiTypography-root {
				font-size: 1rem;
				color: #231f20;
			}

			&:hover::after {
				@keyframes showUnderline {
					from {
						opacity: 0;
						left: -30%;
					}
					to {
						opacity: 1;
						left: 0;
					}
				}

				animation: showUnderline 0.3s 1 forwards;
			}

			&::after {
				content: "";
				display: block;
				position: absolute;
				bottom: -2px;
				width: 100%;
				border-bottom: 2px solid #faa61a;
				opacity: 0;
				transition: 0.3s;
			}
		}

		.navGroup {
			.groupIcon {
				transform: rotate(0deg);
				transition: 0.3s;
			}
			&::after {
				display: none;
			}
			&:hover {
				.groupIcon {
					transform: rotate(180deg);
				}

				.MuiList-root {
					z-index: 1;
					opacity: 1;
					top: 100%;
				}
			}

			.MuiList-root {
				/* z-index: 1; */
				transition: 0.3s;
				opacity: 0;
				position: absolute;
				top: 70%;
				min-width: 120%;
				border-radius: 4px;
				background-color: white;
				box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
					0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);

				.link {
					width: 100%;
					text-align: center;

					.MuiTypography-root {
						white-space: nowrap;
					}
				}
			}
		}

		.selectedLink {
			&::after {
				opacity: 1;
			}
			&:hover::after {
				animation: none;
			}
		}
	}
`;
const Logo = styled(ExpressLogo)`
	height: 2rem;
`;

export default class Navbar extends Component {
	static contextType = GlobalDataContext;
	state = {
		storageData: [],

		loading: true,
	};

	componentDidMount() {
		api
			.executeProcedure("anbar.storage_select_all")
			.then((data) => {
				this.context.setStorage(data[0].id);
				this.setState({
					storageData: data,
					loading: false,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}

	handleChange(event) {
		this.context.setStorage(event.target.value);
	}

	render() {
		return (
			<StyledAppbar position="relative">
				<Logo />
				<Divider orientation="vertical" />
				{!this.state.loading && (
					<Select
						disableUnderline
						value={this.context.storageId}
						onChange={(e) => this.handleChange(e)}
						IconComponent={ExpandMoreIcon}
						MenuProps={{
							anchorOrigin: {
								vertical: "bottom",
								horizontal: "center",
							},
							transformOrigin: {
								vertical: "top",
								horizontal: "center",
							},
							getContentAnchorEl: null,
						}}
					>
						{this.state.storageData.map((storage) => (
							<MenuItem key={uuid()} value={storage.id}>
								{storage.storage_name}
							</MenuItem>
						))}
					</Select>
				)}
				<div className="links">
					{this.props.routes.map(({ name, path, children }) => {
						if (children) {
							return (
								<div key={uuid()} className="link navGroup">
									<Typography className="group">{name}</Typography>
									<ExpandMoreIcon className="groupIcon" />
									<List>
										{children.map(({ name, path }) => (
											<ListItem button key={uuid()}>
												<NavLink
													className="link"
													title={name}
													activeClassName="selectedLink"
													exact
													to={path}
												>
													<ListItemText>{name}</ListItemText>
												</NavLink>
											</ListItem>
										))}
									</List>
								</div>
							);
						}
						return (
							<NavLink
								className="link"
								key={uuid()}
								title={name}
								activeClassName="selectedLink"
								exact
								to={path}
							>
								<Typography>{name}</Typography>
							</NavLink>
						);
					})}
				</div>
			</StyledAppbar>
		);
	}
}
