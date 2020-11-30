import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "./GlobalDataProvider";
import api from "../tools/connect";
import uuid from "react-uuid";

import TransferProductForm from "./WarehouseRemoveTransferProductForm";
import { CustomButton } from "./UtilComponents";
import {
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stepper,
	Step,
	StepLabel,
	Divider,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@material-ui/core";

// Icons
import DoubleArrowOutlinedIcon from "@material-ui/icons/DoubleArrowOutlined";
import RemoveIcon from "@material-ui/icons/Remove";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";

const StyledDialog = styled(Dialog)`
	.MuiDialog-container > .MuiPaper-root {
		min-width: 800px;
		height: 600px;

		form {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
		}
	}

	.MuiDialogTitle-root {
		background-color: #f5f5f5;

		.MuiTypography-root {
			font-size: 1.6rem;
		}
	}

	.MuiDialogContent-root {
		flex-grow: 1;
	}

	.MuiDialogActions-root {
		padding: 8px 24px 8px 6px;
		justify-content: flex-start;
		position: relative;

		hr {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
		}
	}
`;
const StyledContent = styled(DialogContent)`
	padding: 15px 0 0 0;
	display: flex;
	flex-direction: column;
	align-items: center;

	.MuiStepper-root {
		width: 90%;
		padding-top: 0;
		padding-bottom: 10px;
		/* padding: 0 0 10px 0; */
	}
	.MuiStepIcon-root.MuiStepIcon-active {
		color: #ffaa00;
	}
	.MuiStepIcon-root.MuiStepIcon-completed {
		color: #ffaa00;
	}
	.MuiStepLabel-label.MuiStepLabel-alternativeLabel {
		margin-top: 10px;
	}

	.header {
		padding: 10px;
		width: 80%;
		display: flex;
		justify-content: space-between;
		align-items: center;

		h1 {
			font-size: 1.4rem;

			span {
				font-size: 1.5rem;
				font-weight: 600;
				margin-left: 5px;
			}
		}
	}

	.tablesContainer {
		width: 100%;
		padding: 10px;
		flex-grow: 1;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		grid-template-rows: 350px;
		justify-items: center;
		align-items: center;
		gap: 5px;

		.table {
			overflow-y: auto;
			border: 1px solid rgba(224, 224, 224, 1);
			width: 100%;
			height: 100%;
		}

		.MuiSvgIcon-root {
			color: #ffaa00;
			transform: scale(1.2);
		}
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

export default class WarehouseRemoveForm extends Component {
	static contextType = GlobalDataContext;
	state = {
		activeStep: 0,

		existingProducts: [],
		forOrderProducts: [],

		selectedAmounts: Array(this.props.data.length).fill(0),
		selectedProduct: null,
		allComplete: true,
	};

	componentDidMount() {
		this.getProductData(this.props.data[0].title);
	}
	async getProductData(productTitle) {
		const existingProducts = await api
			.executeProcedure("[SalaryDB].anbar.[order_request_product_search]", {
				storage_id: this.context.storageId,
				title: productTitle,
			})
			.catch((err) => console.error(err.errText));

		const forOrderProducts = await api
			.executeProcedure("[SalaryDB].anbar.[order_request_handle_session_info]", {
				retail_sale_session_id: this.props.retailSaleId,
				product_num: this.state.activeStep,
			})
			.catch((err) => console.error(err.errText));

		let selectedAmount = 0;
		forOrderProducts.forEach((product) => {
			if (product.product_title === this.props.data[this.state.activeStep].title) {
				selectedAmount += product.quantity;
			}
		});

		this.setState((prevState) => {
			return {
				existingProducts,
				forOrderProducts,
				selectedAmounts: prevState.selectedAmounts.map((el, i) =>
					i === prevState.activeStep ? selectedAmount : el
				),
			};
		});
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
		});
	}
	// * We can check only last product because we have validation on each next button click
	async handleSubmit(e) {
		e.preventDefault();

		if (
			this.state.selectedAmounts[this.state.activeStep] !==
			parseInt(this.props.data[this.state.activeStep].amount)
		) {
			this.context.error(
				`You need to select ${
					parseInt(this.props.data[this.state.activeStep].amount) -
					this.state.selectedAmounts[this.state.activeStep]
				} products`
			);
			return;
		}

		api
			.executeProcedure("[SalaryDB].anbar.[order_request_complete]", {
				user_id: this.context.userId,
				retail_sale_session_id: this.props.retailSaleId,
				order_id: this.props.order_id,
				status: this.state.allComplete ? 20 : 21,
			})
			.then(() => {
				this.context.success("Order complete");
				this.props.refresh();
				this.props.close();
			})
			.catch((err) => this.context.error(err.errText));
	}

	handleNextStep() {
		if (
			this.state.selectedAmounts[this.state.activeStep] !==
			parseInt(this.props.data[this.state.activeStep].amount)
		) {
			this.context.error(
				`You need to select ${
					parseInt(this.props.data[this.state.activeStep].amount) -
					this.state.selectedAmounts[this.state.activeStep]
				} products`
			);
			return;
		}
		this.getProductData(this.props.data[this.state.activeStep + 1].title);
		this.setState((prevState) => {
			return { activeStep: prevState.activeStep + 1 };
		});
	}
	showTransferForm(product) {
		this.setState({
			selectedProduct: product,
		});
	}
	handleFormClose() {
		api
			.executeProcedure("[SalaryDB].anbar.[order_request_session_delete_onPopupClose]", {
				retail_sale_session_id: this.props.retailSaleId,
			})
			.then(() => {
				this.props.close();

				const data = localStorage.getItem("WarehouseRemoveUnfinishedRetailSessions");
				let arr = JSON.parse(data);
				arr = arr.filter((el) => el !== this.props.retailSaleId);
				if (arr.length) {
					localStorage.setItem(
						"WarehouseRemoveUnfinishedRetailSessions",
						JSON.stringify(arr)
					);
				} else {
					localStorage.removeItem("WarehouseRemoveUnfinishedRetailSessions");
				}
			})
			.catch((err) => console.log(err.errText));
	}
	removeSelectedItem(id) {
		api
			.executeProcedure("[SalaryDB].anbar.[order_request_handle_session_info_delete]", {
				id,
			})
			.then(() => {
				this.getProductData(this.props.data[this.state.activeStep].title);
			})
			.catch((err) => console.log(err.errText));
	}

	render() {
		return (
			<StyledDialog
				style={{ zIndex: 21 }}
				open={this.props.open}
				onClose={this.handleFormClose.bind(this)}
			>
				<form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
					<DialogTitle>Məxaric</DialogTitle>

					<StyledContent>
						<Stepper activeStep={this.state.activeStep}>
							{this.props.data.map((step) => (
								<Step key={uuid()}>
									<StepLabel>{step.title}</StepLabel>
								</Step>
							))}
						</Stepper>
						<Divider />

						<div className="header">
							<h1>
								Order amount:
								<span>{this.props.data[this.state.activeStep].amount}</span>
							</h1>
							<h1>
								Selected amount:
								<span>{this.state.selectedAmounts[this.state.activeStep]}</span>
							</h1>
							<h1>
								Need to select:
								<span>
									{parseInt(this.props.data[this.state.activeStep].amount) -
										this.state.selectedAmounts[this.state.activeStep]}
								</span>
							</h1>
						</div>

						<div className="tablesContainer">
							<div className="table">
								<StyledTableContainer>
									<Table stickyHeader>
										<TableHead>
											<TableRow>
												<TableCell align="center">Məhsul</TableCell>
												<TableCell align="center">K-yət</TableCell>
												<TableCell align="center">Hüceyrə nömrəsi</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{this.state.existingProducts.map((row) => (
												<TableRow
													hover
													style={{ cursor: "pointer" }}
													onClick={() => this.showTransferForm(row)}
													key={uuid()}
												>
													<TableCell align="center">{row.product_title}</TableCell>
													<TableCell align="center">
														{row.left !== null ? (
															`${row.left} ${row.unit_title}`
														) : (
															<RemoveIcon />
														)}
													</TableCell>
													<TableCell align="center">
														{row.product_cell !== null ? (
															row.product_cell
														) : (
															<RemoveIcon />
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</StyledTableContainer>
							</div>

							<DoubleArrowOutlinedIcon />

							<div className="table">
								<StyledTableContainer>
									<Table stickyHeader>
										<TableHead>
											<TableRow>
												<TableCell align="center">Məhsul</TableCell>
												<TableCell align="center">K-yət</TableCell>
												<TableCell align="center">Hüceyrə nömrəsi</TableCell>
												<TableCell align="center"></TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{this.state.forOrderProducts.map((row) => (
												<TableRow key={uuid()}>
													<TableCell align="center">{row.product_title}</TableCell>
													<TableCell align="center">{row.quantity}</TableCell>
													<TableCell align="center">
														{row.product_cell !== null ? (
															row.product_cell
														) : (
															<RemoveIcon />
														)}
													</TableCell>
													<TableCell align="center">
														<IconButton onClick={() => this.removeSelectedItem(row.id)}>
															<HighlightOffIcon />
														</IconButton>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</StyledTableContainer>
							</div>
						</div>
					</StyledContent>

					<DialogActions>
						<Divider />

						<CustomButton onClick={this.handleFormClose.bind(this)}>Close</CustomButton>
						<CustomButton
							disabled={this.state.activeStep === 0}
							onClick={() => {
								this.setState((prevState) => {
									return { activeStep: prevState.activeStep - 1 };
								});
							}}
						>
							Previous
						</CustomButton>
						<CustomButton
							disabled={this.state.activeStep === this.props.data.length - 1}
							onClick={this.handleNextStep.bind(this)}
						>
							Next
						</CustomButton>

						<div className="gap" style={{ flexGrow: 1 }}></div>
						{Boolean(this.state.activeStep === this.props.data.length - 1) && (
							<CustomButton type="submit">Əlavə et</CustomButton>
						)}
					</DialogActions>
				</form>

				{Boolean(this.state.selectedProduct) && (
					<TransferProductForm
						open={Boolean(this.state.selectedProduct)}
						close={() => {
							this.setState({
								selectedProduct: null,
							});
						}}
						product={this.state.selectedProduct}
						retailSaleId={this.props.retailSaleId}
						neededAmount={
							parseInt(this.props.data[this.state.activeStep].amount) -
							this.state.selectedAmounts[this.state.activeStep]
						}
						activeStep={this.state.activeStep}
						refresh={() =>
							this.getProductData(this.props.data[this.state.activeStep].title)
						}
					/>
				)}
			</StyledDialog>
		);
	}
}
