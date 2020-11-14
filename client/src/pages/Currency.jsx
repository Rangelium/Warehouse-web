import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../components/GlobalDataProvider";
import api from "../tools/connect";
import dayjs from "dayjs";
import uuid from "react-uuid";

import {
	CustomSelect,
	CustomSelectItem,
	CustomTextInput,
	CustomButton,
} from "../components/UtilComponents";
import {
	Divider,
	Backdrop,
	CircularProgress,
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@material-ui/core";
// Icons
import RemoveIcon from "@material-ui/icons/Remove";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";

const StyledSection = styled.section`
	display: flex;
	flex-direction: column;
`;
const Header = styled.div`
	padding: 10px 15px;
	display: flex;
	align-items: center;
	position: relative;

	.title {
		font-size: 1.9rem;
		font-weight: 500;
		color: #231f20;
		flex-grow: 1;
	}

	.MuiButton-root {
		border-color: #faa61a;
		text-transform: none;
		font-weight: normal;
		font-size: 1rem;
		margin-right: 15px;
		height: 100%;
	}

	.dateBlock {
		display: flex;
		align-items: center;

		p {
			margin-right: 10px;
		}

		.MuiSvgIcon-root {
			margin: 0 7px;
		}

		.MuiOutlinedInput-input {
			padding: 12px 14px;
		}
	}

	hr {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
	}
`;
const MainData = styled.div`
	padding: 0 15px;
	flex-grow: 1;
	position: relative;
	display: flex;
	flex-direction: column;

	.addCurrencyForm {
		margin-top: 15px;
		width: 800px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.table {
		height: 1px;
		flex-grow: 1;
		padding: 15px 0 10px 0;
	}
`;
const StyledTableContainer = styled(TableContainer)`
	overflow-y: auto;
	height: 100%;

	&::-webkit-scrollbar {
		width: 5px;
		height: 5px;
	}
	/* Track */
	&::-webkit-scrollbar-track {
		box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
		border-radius: 10px;
		border-radius: 10px;
	}
	/* Handle */
	&::-webkit-scrollbar-thumb {
		border-radius: 10px;
		border-radius: 10px;
		background: #d7d8d6;
		box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
	}
`;
const StyledDialog = styled(Dialog)`
	.MuiPaper-root {
		width: 500px;
	}

	.MuiDialogTitle-root {
		background-color: #f5f5f5;

		.MuiTypography-root {
			font-size: 1.6rem;
		}
	}

	.MuiDialogContent-root {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;

		.MuiTextField-root {
			width: 100%;
		}
	}

	.MuiDialogActions-root {
		padding: 8px 24px;
		justify-content: flex-start;
	}
`;

class CreateClusterForm extends Component {
	static contextType = GlobalDataContext;
	state = {
		title: "",
		fullTitle: "",
	};

	createCluster(e) {
		e.preventDefault();

		api
			.executeProcedure("anbar.currency_insert", {
				full_title: this.state.fullTitle,
				title: this.state.title,
				user_id: this.context.userId,
			})
			.then((res) => {
				this.context.success(`Created ${this.state.title}`);
				this.setState({
					fullTitle: "",
					title: "",
				});
				this.props.setCluster(res[0].row_id);
				this.props.close();
			})
			.catch((err) => this.context.error(err.errText));
	}

	handleChange(e) {
		if (e.target.name === "startDate" || e.target.name === "endDate") {
			this.setState(
				{
					[e.target.name]: e.target.value,
				},
				() => {
					this.getCurrencyData();
				}
			);

			return;
		}
		this.setState({
			[e.target.name]: e.target.value,
		});
	}

	render() {
		return (
			<StyledDialog
				style={{ zIndex: 214700 }}
				open={this.props.open}
				onClose={this.props.close}
			>
				<form autoComplete="off" onSubmit={this.createCluster.bind(this)}>
					<DialogTitle>Yeni valyuta yarat</DialogTitle>
					<DialogContent>
						<CustomTextInput
							required
							variant="outlined"
							label="Full title"
							name="fullTitle"
							value={this.state.fullTitle}
							onChange={this.handleChange.bind(this)}
						/>
						<CustomTextInput
							required
							variant="outlined"
							label="Title"
							name="title"
							value={this.state.title}
							onChange={this.handleChange.bind(this)}
						/>
					</DialogContent>
					<DialogActions>
						<CustomButton variant="outlined" type="submit">
							Əlavə et
						</CustomButton>
						<CustomButton variant="outlined" onClick={this.props.close}>
							İmtina
						</CustomButton>
					</DialogActions>
				</form>
			</StyledDialog>
		);
	}
}

export default class Currency extends Component {
	static contextType = GlobalDataContext;
	state = {
		startDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
		endDate: dayjs().add(1, "year").format("YYYY-MM-DD"),
		currencyTableData: [],

		currencyId: "",
		currencyData: [],
		currencyValue: "",
		currencyDate: dayjs().format("YYYY-MM-DDTHH:mm"),

		loading: true,
		newClusterForm: false,
	};

	componentDidMount() {
		this.getCurrencyData();

		this.loadDataForCurrencySelect();
	}

	loadDataForCurrencySelect(id = "") {
		api.executeProcedure("anbar.currency_select").then((data) => {
			this.setState({
				currencyData: data,
				currencyId: id,
			});
		});
	}

	async getCurrencyData() {
		this.setState({
			loading: true,
		});

		const currencyTableData = await api
			.executeProcedure("anbar.exchange_rate_select", {
				date_from: dayjs(this.state.startDate).format("YYYY.MM.DD"),
				date_to: dayjs(this.state.endDate).format("YYYY.MM.DD"),
			})
			.catch(() => {
				return [];
			});

		this.setState({
			loading: false,
			currencyTableData,
		});
	}

	handleChange(e) {
		if (e.target.name === "startDate" || e.target.name === "endDate") {
			this.setState(
				{
					[e.target.name]: e.target.value,
				},
				() => {
					this.getCurrencyData();
				}
			);

			return;
		}
		this.setState({
			[e.target.name]: e.target.value,
		});
	}

	handleAddCurrency(e) {
		e.preventDefault();
		console.log(dayjs(this.state.currencyDate).format("YYYY.MM.DD HH:mm:ss"));

		api
			.executeProcedure("anbar.exchange_rate_insert", {
				currency_id: this.state.currencyId,
				value: this.state.currencyValue,
				time: dayjs(this.state.currencyDate).format("YYYY.MM.DD HH:mm"),
				user_id: this.context.userId,
			})
			.then(() => {
				this.context.success(`Added`);
				this.getCurrencyData();
				this.setState({
					currencyId: "",
					currencyValue: "",
				});
			})
			.catch((err) => {
				this.context.error(err.errText);
			});
	}

	render() {
		return (
			<StyledSection className="pageData">
				<Header>
					<h1 className="title">Məzənnə</h1>

					<div className="dateBlock">
						<p>Tarix:</p>
						<CustomTextInput
							required
							type="date"
							variant="outlined"
							name="startDate"
							value={this.state.startDate}
							onChange={this.handleChange.bind(this)}
						/>
						<RemoveIcon />
						<CustomTextInput
							required
							type="date"
							variant="outlined"
							name="endDate"
							value={this.state.endDate}
							onChange={this.handleChange.bind(this)}
						/>
					</div>
					<Divider />
				</Header>
				<MainData>
					<form
						className="addCurrencyForm"
						onSubmit={this.handleAddCurrency.bind(this)}
						autoComplete="off"
					>
						<CustomSelect
							MenuProps={{
								anchorOrigin: {
									vertical: "bottom",
									horizontal: "left",
								},
								transformOrigin: {
									vertical: "top",
									horizontal: "left",
								},
								getContentAnchorEl: null,
							}}
							style={{ minWidth: "240px" }}
							required
							label="Valyuta"
							name="currencyId"
							value={this.state.currencyId}
							onChange={this.handleChange.bind(this)}
						>
							{this.state.currencyData.map((product) => (
								<CustomSelectItem key={uuid()} value={product.id}>
									{product.full_title}
								</CustomSelectItem>
							))}
							<CustomSelectItem style={{}} value="">
								<CustomButton
									style={{ width: "100%" }}
									onClick={() => {
										this.setState({
											newClusterForm: true,
										});
									}}
								>
									Əlavə et
								</CustomButton>
							</CustomSelectItem>
						</CustomSelect>

						<CustomTextInput
							required
							type="number"
							variant="outlined"
							label="Dəyər"
							name="currencyValue"
							value={this.state.currencyValue}
							onChange={this.handleChange.bind(this)}
						/>

						<CustomTextInput
							required
							type="number"
							variant="outlined"
							label="Tarix"
							name="currencyDate"
							type="datetime-local"
							defaultValue={this.state.currencyDate}
							onChange={this.handleChange.bind(this)}
						/>

						<CustomButton type="submit" variant="outlined" style={{ height: "100%" }}>
							<AddCircleOutlineOutlinedIcon style={{ transform: "scale(1.3)" }} />
						</CustomButton>
					</form>

					<div className="table">
						<StyledTableContainer component={Paper}>
							<Table stickyHeader>
								<TableHead>
									<TableRow>
										<TableCell align="center">Adı</TableCell>
										<TableCell align="center">Dəyər</TableCell>
										<TableCell align="center">Tarix</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.state.currencyTableData.map((currency) => (
										<TableRow key={uuid()}>
											<TableCell align="center">{currency.title}</TableCell>
											<TableCell align="center">{currency.value}</TableCell>
											<TableCell align="center">
												{dayjs(currency.time)
													.subtract(4, "hour")
													.format("DD MMMM YYYY, HH:mm:ss")}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</StyledTableContainer>
					</div>

					<Backdrop
						style={{
							zIndex: 1000,
							position: "absolute",
							backgroundColor: "rgba(0, 0, 0, 0.7)",
						}}
						open={this.state.loading}
					>
						<CircularProgress style={{ color: "#fff" }} />
					</Backdrop>
				</MainData>

				<CreateClusterForm
					open={this.state.newClusterForm}
					close={() => {
						this.setState({
							newClusterForm: false,
						});
					}}
					setCluster={(currencyId) => {
						this.loadDataForCurrencySelect(currencyId);
					}}
				/>
			</StyledSection>
		);
	}
}
