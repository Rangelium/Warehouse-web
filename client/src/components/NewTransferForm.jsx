import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "./GlobalDataProvider";
import api from "../tools/connect";
import uuid from "react-uuid";

import NewTransferSelectProductTable from "./NewTransferSelectProductTable";
import NewTransferTransferInfo from "./NewTransferTransferInfo";

import {
	CustomButton,
	CustomSelect,
	CustomSelectItem,
	CustomTextInput,
} from "./UtilComponents";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	Stepper,
	Step,
	StepLabel,
	Divider,
} from "@material-ui/core";

// Icons
import DoubleArrowOutlinedIcon from "@material-ui/icons/DoubleArrowOutlined";

const StyledDialog = styled(Dialog)`
	.MuiDialog-container > .MuiPaper-root {
		min-width: 620px;
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
	padding: 15px;
	display: flex;
	flex-direction: column;

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.block {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.MuiTypography-root {
				font-size: 1.6rem;
				margin-right: 5px;
			}

			.icon {
				transform: scale(1.4);
				color: #ffaa00;
			}
		}
	}

	.mainData {
		flex-grow: 1;
		display: flex;
		flex-direction: column;

		.MuiStepper-root {
			padding: 20px 0 10px 0;
		}
		.MuiStepIcon-root.MuiStepIcon-active {
			color: #ffaa00;
		}
		.MuiStepIcon-root.MuiStepIcon-completed {
			color: #ffaa00;
		}
	}
`;

export default class NewTransferForm extends Component {
	static contextType = GlobalDataContext;
	state = {
		toWarehouseId: "",
		selectedProduct: null,
		transferInfoData: null,
		selectedProductPath: {
			category: "",
			subCategory: "",
		},
		file: null,

		warehouseData: [],
		activeStep: 0,
		steps: ["Choose product", "Fill transfer info"],
	};

	componentDidMount() {
		this.prepareForm();
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
		});
	}
	async handleSubmit(e) {
		e.preventDefault();

		let fileName = null;
		if (this.state.file) {
			// Generate random name for file
			fileName = uuid();
			const formData = new FormData();

			formData.append("title", fileName);
			formData.append("file", this.state.file);

			let res = await api.uploadTransferFile(formData).catch((err) => {
				console.log(err);
			});
			fileName = `${fileName}.${this.state.file.name.split(".")[1]}`;
			if (res === undefined) return;
		}

		api
			.executeProcedure("[SalaryDB].anbar.[transfer_products_session_info_insert]", {
				quantity: this.state.transferInfoData.quantity,
				reason: this.state.transferInfoData.reason,
				currency: this.state.selectedProduct.currency_id,
				storage_from: this.context.storageId,
				storage_to: this.state.toWarehouseId,
				transfer_session_id: this.props.sessionId,
				document_num: this.state.transferInfoData.contractNum,
				document_num_path: fileName,
				cluster_order_default: this.state.selectedProduct.cluster_default,
				price: this.state.selectedProduct.unit_price,
				exp_date: this.state.selectedProduct.exp_date,
				product_cell: this.state.transferInfoData.productCell,
				barcode: this.state.selectedProduct.barcode,
				product_id: this.state.selectedProduct.product_id,
				product_manufacturer: this.state.selectedProduct.product_manufacturer,
				left: this.state.selectedProduct.left,
				document_id_as_parent_id: this.state.selectedProduct.document_id,
			})
			.then(() => {
				this.props.refresh();
				this.context.success(`Added ${this.state.selectedProduct.product_title}`);
				this.handleClose();
			})
			.catch((err) => this.context.error(err.errText));
	}
	handleClose() {
		this.prepareForm();
		this.props.close();
	}

	async getProductData() {
		const subCategory = await api
			.executeProcedure("[SalaryDB].anbar.[warehouse_select_products_subcategory]", {
				product_id: this.state.selectedProduct.product_id,
			})
			.then((res) => res[0])
			.catch((err) => console.log(err));

		const category = await api
			.executeProcedure("[SalaryDB].anbar.[warehouse_select_products_category]", {
				parent_id: subCategory.parent_id,
			})
			.then((res) => res[0])
			.catch((err) => console.log(err));

		this.setState({
			selectedProductPath: {
				category: category.title,
				subCategory: subCategory.title,
			},
		});
	}
	async prepareForm() {
		const warehouseData = await api
			.executeProcedure("anbar.storage_select_all")
			.catch((err) => this.context.error(err.errText));

		this.setState({
			toWarehouseId: "",
			selectedProduct: null,
			transferInfoData: null,
			warehouseData,
			activeStep: 0, // 0
		});
	}

	render() {
		return (
			<StyledDialog
				style={{ zIndex: 21 }}
				open={this.props.open}
				onClose={this.handleClose.bind(this)}
			>
				<form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
					<DialogTitle>Yeni transfer</DialogTitle>

					<StyledContent>
						<div className="heading">
							<CustomTextInput
								style={{ minWidth: "200px" }}
								disabled={true}
								label="From Warehouse"
								value={this.context.storageTitle}
							/>

							<div className="block">
								<Typography noWrap variant="h3">
									Transfer
								</Typography>
								<DoubleArrowOutlinedIcon className="icon" />
							</div>

							<CustomSelect
								required
								style={{ minWidth: "200px" }}
								label="To Warehouse"
								name="toWarehouseId"
								value={this.state.toWarehouseId}
								onChange={this.handleChange.bind(this)}
							>
								{this.state.warehouseData.map((warehouse) =>
									warehouse.id !== this.context.storageId ? (
										<CustomSelectItem key={uuid()} value={warehouse.id}>
											{warehouse.storage_name}
										</CustomSelectItem>
									) : null
								)}
							</CustomSelect>
						</div>

						<div className="mainData">
							<Stepper activeStep={this.state.activeStep} alternativeLabel>
								{this.state.steps.map((step) => (
									<Step key={uuid()}>
										<StepLabel>{step}</StepLabel>
									</Step>
								))}
							</Stepper>

							<NewTransferSelectProductTable
								active={this.state.activeStep === 0}
								selectProduct={(data) =>
									this.setState({
										selectedProduct: data,
									})
								}
								tableData={this.state}
							/>
							<NewTransferTransferInfo
								file={this.state.file}
								setFile={(file) => this.setState({ file })}
								active={this.state.activeStep === 1}
								path={this.state.selectedProductPath}
								setTransefInfo={(data) => {
									this.setState({ transferInfoData: data });
								}}
								selectedProduct={
									this.state.selectedProduct ? this.state.selectedProduct : {}
								}
							/>
						</div>
					</StyledContent>

					<DialogActions>
						<Divider />

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

						{Boolean(this.state.activeStep === this.state.steps.length - 1) && (
							<CustomButton type="submit">Əlavə et</CustomButton>
						)}
						{this.state.activeStep !== this.state.steps.length - 1 && (
							<CustomButton
								disabled={!Boolean(this.state.selectedProduct)}
								onClick={async () => {
									if (this.state.activeStep === 0) await this.getProductData();
									this.setState((prevState) => {
										return { activeStep: prevState.activeStep + 1 };
									});
								}}
							>
								Next
							</CustomButton>
						)}
						<CustomButton onClick={this.handleClose.bind(this)}>İmtina</CustomButton>
						<div className="div" style={{ flexGrow: 1 }}></div>
						{this.state.activeStep === 1 && this.state.file && (
							<CustomButton
								style={{}}
								onClick={() =>
									this.setState({
										file: null,
									})
								}
							>
								Clear file
							</CustomButton>
						)}
					</DialogActions>
				</form>
			</StyledDialog>
		);
	}
}
