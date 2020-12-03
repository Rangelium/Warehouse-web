import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "./GlobalDataProvider";
import api from "../tools/connect";
import uuid from "react-uuid";

import WarehouseAddFromCreateBulk from "./WarehouseAddFromCreateBulk";
import WarehouseAddFormFillBulk from "./WarehouseAddFormFillBulk";
import { CustomButton } from "./UtilComponents";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stepper,
	Step,
	StepLabel,
	Divider,
} from "@material-ui/core";

const StyledDialog = styled(Dialog)`
	.MuiDialog-container > .MuiPaper-root {
		/* min-width: 800px;
		min-height: 600px; */
		max-width: unset;

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
		padding: 8px 15px 8px 6px;
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

export default class WarehouseAddForm extends Component {
	static contextType = GlobalDataContext;
	constructor() {
		super();
		this.state = {
			steps: ["Create bulk", "Fill data"],
			activeStep: 0,

			sessionId: null,
		};

		this.createBulkFormRef = React.createRef();
		this.fillBulkFormRef = React.createRef();
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
		});
	}
	async handleSubmit(e) {
		e.preventDefault();

		const inputsData = this.fillBulkFormRef.current.state.tableInputs;
		let isValid = true;
		this.props.dataForFill.forEach((el, i) => {
			if (!Boolean(inputsData[`price${i}`]) || parseInt(inputsData[`price${i}`]) <= 0) {
				isValid = false;
				return;
			}
			if (!Boolean(inputsData[`currency${i}`])) {
				isValid = false;
				return;
			}
			if (!Boolean(inputsData[`clusterId${i}`])) {
				isValid = false;
				return;
			}
		});

		if (!isValid) {
			this.context.error("Fill all fields correctly");
			return;
		}

		let isRight = true;
		for (let i = 0; i < this.props.dataForFill.length; i++) {
			if (!isRight) return;
			isRight = await api
				.executeProcedure("[SalaryDB].anbar.[order_acception_handle]", {
					cluster_id: inputsData[`clusterId${i}`],
					product_cell: inputsData[`productCell${i}`],
					currency: inputsData[`currency${i}`],
					exp_date: inputsData[`expDate${i}`],
					reason: "",
					inventory_num: inputsData[`inventoryNum${i}`],
					barcode: this.props.dataForFill[i].barcode,
					session_id: this.state.sessionId,
					storage_id: this.context.storageId,
					product_id: this.props.dataForFill[i].product_id,
					quantity: this.props.dataForFill[i].amount,
					price: inputsData[`price${i}`],
				})
				.then(() => true)
				.catch((err) => {
					this.context.error("accept product" + err.errText);
					return false;
				});
		}

		if (!isRight) return;
		console.log("End func");
		api
			.executeProcedure("[SalaryDB].anbar.[order_acception_complete]", {
				session_id: this.state.sessionId,
				order_id: this.props.orderId,
				status: 25,
			})
			.then(() => {
				this.props.refresh();
				this.context.success("Bulk finished");
				this.props.close();
			})
			.catch((err) => this.context.error(err.errText));
	}
	completeBulkCreation(sessionId) {
		this.setState((prevState) => {
			return {
				activeStep: prevState.activeStep + 1,
				sessionId,
			};
		});
	}
	handleFormClose() {
		this.props.close();

		if (this.state.sessionId) {
			api
				.executeProcedure(
					"[SalaryDB].anbar.[order_acception_session_delete_onPopupClose]",
					{ session_id: this.state.sessionId }
				)
				.catch((err) => console.log(err.errText));
		}
	}
	handlePreviousBtn() {
		api
			.executeProcedure(
				"[SalaryDB].anbar.[order_acception_session_delete_onPopupClose]",
				{ session_id: this.state.sessionId }
			)
			.then(() => {
				this.setState({
					activeStep: 0,
					sessionId: null,
				});
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
					<DialogTitle>{this.state.steps[this.state.activeStep]}</DialogTitle>

					<StyledContent>
						<Stepper activeStep={this.state.activeStep}>
							{this.state.steps.map((step) => (
								<Step key={uuid()}>
									<StepLabel>{step}</StepLabel>
								</Step>
							))}
						</Stepper>
						<Divider />

						<WarehouseAddFromCreateBulk
							ref={this.createBulkFormRef}
							active={this.state.activeStep === 0}
							finishCreation={this.completeBulkCreation.bind(this)}
						/>

						<WarehouseAddFormFillBulk
							ref={this.fillBulkFormRef}
							active={this.state.activeStep === 1}
							tableData={this.props.dataForFill}
						/>
					</StyledContent>

					<DialogActions>
						<Divider />
						<CustomButton onClick={this.handleFormClose.bind(this)}>Close</CustomButton>
						{this.state.activeStep === 1 && (
							<CustomButton onClick={this.handlePreviousBtn.bind(this)}>
								Previous
							</CustomButton>
						)}

						<div className="gap" style={{ flexGrow: 1 }}></div>

						{this.state.activeStep === 0 && (
							<CustomButton onClick={() => this.createBulkFormRef.current.createBulk()}>
								Create bulk
							</CustomButton>
						)}
						{this.state.activeStep === 1 && (
							<CustomButton type="submit">Əlavə et</CustomButton>
						)}
					</DialogActions>
				</form>
			</StyledDialog>
		);
	}
}
