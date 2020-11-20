// ! After creating new Warehouse top-left(Global) Warehouse select didn't refresh

import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../components/GlobalDataProvider";
import api from "../tools/connect";
import uuid from "react-uuid";

import {
	CustomTextInput,
	CustomButton,
	CustomSelect,
	CustomSelectItem,
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
		white-space: nowrap;
	}

	.MuiButton-root {
		text-transform: none;
		font-weight: normal;
		font-size: 1rem;
		margin-right: 15px;
		height: 100%;
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

		.MuiFormControl-root {
			width: 100%;
		}

		.MuiTextField-root {
			width: 100%;
		}
	}

	.MuiDialogActions-root {
		padding: 8px 24px;
		justify-content: flex-start;
	}
`;

class CreateWarehouseForm extends Component {
	static contextType = GlobalDataContext;
	state = {
		warehouseName: "",
		responsiblePerson: "",
		warehouseType: "",
		warehouseDepartmentId: "",
		departmentData: [],
	};

	componentDidMount() {
		this.getDepartmentData();
	}
	getDepartmentData() {
		api
			.executeProcedure("[SalaryDB].anbar.[warehouse_department_select]")
			.then((res) => this.setState({ departmentData: res }))
			.catch((err) => console.log(err));
	}

	createWarehouse(e) {
		e.preventDefault();

		api
			.executeProcedure("[SalaryDB].anbar.[storage_create_new]", {
				storage_name: this.state.warehouseName,
				storage_type: this.state.warehouseType,
				curation_department_id: parseInt(this.state.warehouseDepartmentId),
				responsible_person: this.state.responsiblePerson,
			})
			.then(() => {
				this.context.success(`Created ${this.state.warehouseName}`);
				this.props.refresh();
				this.handleClose();
			})
			.catch((err) => this.context.error(err.errText));
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
		});
	}
	handleClose() {
		this.props.close();
		this.getDepartmentData();
		this.setState({
			warehouseName: "",
			responsiblePerson: "",
			warehouseType: "",
			warehouseDepartmentId: "",
		});
	}

	render() {
		return (
			<StyledDialog
				style={{ zIndex: 2 }}
				open={this.props.open}
				onClose={this.handleClose.bind(this)}
			>
				<form autoComplete="off" onSubmit={this.createWarehouse.bind(this)}>
					<DialogTitle>Yeni anbarı yarat</DialogTitle>
					<DialogContent>
						<CustomTextInput
							required
							label="Anbaın adı"
							name="warehouseName"
							value={this.state.warehouseName}
							onChange={this.handleChange.bind(this)}
						/>
						<CustomSelect
							required
							label="Department"
							name="warehouseDepartmentId"
							value={this.state.warehouseDepartmentId}
							onChange={this.handleChange.bind(this)}
						>
							{this.state.departmentData.map(({ id, name }) => (
								<CustomSelectItem key={uuid()} value={id}>
									{name}
								</CustomSelectItem>
							))}
						</CustomSelect>
						<CustomTextInput
							required
							label="Anbaın tipi"
							name="warehouseType"
							value={this.state.warehouseType}
							onChange={this.handleChange.bind(this)}
						/>
						<CustomTextInput
							required
							label="Responsible"
							name="responsiblePerson"
							value={this.state.responsiblePerson}
							onChange={this.handleChange.bind(this)}
						/>
					</DialogContent>
					<DialogActions>
						<CustomButton type="submit">Yarat</CustomButton>
						<CustomButton onClick={this.handleClose.bind(this)}>İmtina</CustomButton>
					</DialogActions>
				</form>
			</StyledDialog>
		);
	}
}

export default class ManageWarehouses extends Component {
	static contextType = GlobalDataContext;
	state = {
		newWarehouseForm: false,
		tablesData: [],
		loading: true,
	};

	componentDidMount() {
		this.getTableData();
	}

	getTableData() {
		api
			.executeProcedure("[SalaryDB].anbar.[storage_select_all_info]")
			.then((res) => this.setState({ tablesData: res, loading: false }))
			.catch((err) => console.log(err));
	}

	render() {
		return (
			<StyledSection className="pageData">
				<Header>
					<h1 className="title">Anbarın quraşdırılması</h1>

					<CustomButton onClick={() => this.setState({ newWarehouseForm: true })}>
						Yeni Anbar yarat
					</CustomButton>

					<Divider />
				</Header>

				<MainData>
					<div className="table">
						<StyledTableContainer component={Paper}>
							<Table stickyHeader>
								<TableHead>
									<TableRow>
										<TableCell align="center">Department</TableCell>
										<TableCell align="center">Warehouse name</TableCell>
										<TableCell align="center">Warehouse type</TableCell>
										<TableCell align="center">Responsible</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.state.tablesData.map(
										({ name, storage_name, storage_type, responsible_person }) => (
											<TableRow key={uuid()}>
												<TableCell align="center">{name}</TableCell>
												<TableCell align="center">{storage_name}</TableCell>
												<TableCell align="center">{storage_type}</TableCell>
												<TableCell align="center">{responsible_person}</TableCell>
											</TableRow>
										)
									)}
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
				<CreateWarehouseForm
					open={this.state.newWarehouseForm}
					close={() => {
						this.setState({
							newWarehouseForm: false,
						});
					}}
					refresh={this.getTableData.bind(this)}
				/>
			</StyledSection>
		);
	}
}
