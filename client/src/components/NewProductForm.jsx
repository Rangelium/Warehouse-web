import React, { Component } from "react";
import styled from "styled-components";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Divider from "@material-ui/core/Divider";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const StyledDialog = styled(Dialog)`
	.MuiPaper-root {
		width: 600px;
	}

	.MuiDialogTitle-root {
		background-color: #f5f5f5;

		.MuiTypography-root {
			font-size: 1.6rem;
		}
	}

	.MuiDialogContent-root {
		overflow-y: scroll;
		height: 450px;

		&::-webkit-scrollbar {
			width: 6px;
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
	}

	.MuiDialogActions-root {
		justify-content: center;
	}
`;
const StyledButton = styled(Button)`
	background-color: ${(props) => (props.submit ? "#F9C20A" : "#D7D8D6")};
	text-transform: capitalize;

	&:hover {
		background-color: ${(props) => (props.submit ? "#F9C20A" : "")};
	}
`;
const ProdInfo = styled.div`
	.info-title {
		font-size: 1.4rem;
		margin: 20px 0;
	}

	.data {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 15px;

		.fullLength {
			grid-column-start: 1;
			grid-column-end: 3;
		}
		.MuiInputBase-input::-webkit-calendar-picker-indicator {
			color: #faa61a;
		}
	}
`;
const Clusters = styled.div`
	.info-title {
		font-size: 1.4rem;
		margin-bottom: 20px;
	}

	.MuiPaper-root {
		width: 100%;
	}
`;
const StyledTable = styled(Table)``;
const ExistedTemplate = styled.div`
	display: flex;
	.MuiFormControl-root {
		flex-grow: 1;
		margin-right: 10px;
	}
`;
const StyledTextField = styled(TextField)`
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

export default class NewProductForm extends Component {
	state = {
		prodNameVal: "",
		prodBarcodeVal: "",
		prodCatId: "Kreslolar/Stullar",
		prodMinAmountVal: "",
		prodOptAmountVal: "",
		prodExpDateVal: "2020-10-08T20:30",
		prodClusterTemplate: "",

		_forUpdate: false,
	};

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
		});
	}
	handleSubmit(e) {
		e.preventDefault();
		if (this.state._forUpdate) {
			this.props.onUpdateSubmit(this.state);
		} else {
			this.props.onCreateSubmit(this.state);
		}

		this.props.handleClose();
	}

	render() {
		console.log("render");
		if (this.props.isUpdate && !this.state._forUpdate) {
			this.setState({
				prodNameVal: this.props.updateData.title,
				prodBarcodeVal: this.props.updateData.barcode,
				prodCatId: "Kreslolar/Stullar",
				prodMinAmountVal: this.props.updateData.min_quantity,
				prodOptAmountVal: this.props.updateData.optimal_quantity,
				prodExpDateVal: this.props.product.exp_date,
				prodClusterTemplate: "",

				_forUpdate: true,
			});
		}
		if (!this.props.isUpdate && this.state._forUpdate) {
			this.setState({
				prodNameVal: "",
				prodBarcodeVal: "",
				prodCatId: "Kreslolar/Stullar",
				prodMinAmountVal: "",
				prodOptAmountVal: "",
				prodExpDateVal: "2020-10-08T20:30",
				prodClusterTemplate: "",

				_forUpdate: false,
			});
		}

		return (
			<StyledDialog
				style={{ zIndex: 21474836470 }}
				open={this.props.open}
				onClose={this.props.handleClose}
			>
				<form onSubmit={this.handleSubmit.bind(this)} autoComplete="off">
					<DialogTitle>Yeni məhsul əlavə et</DialogTitle>
					<DialogContent>
						<ProdInfo>
							<h1 className="info-title">Məhsulun məlumatı</h1>
							<div className="data">
								<StyledTextField
									className="fullLength"
									required
									variant="outlined"
									label="Məhsulun adı"
									name="prodNameVal"
									value={this.state.prodNameVal}
									onChange={this.handleChange.bind(this)}
								/>
								<StyledTextField
									required
									variant="outlined"
									label="Ştrixkod"
									name="prodBarcodeVal"
									value={this.state.prodBarcodeVal}
									onChange={this.handleChange.bind(this)}
								/>
								<FormControl variant="outlined">
									<InputLabel id="demo-simple-select-outlined-label">
										Kateqoriya
									</InputLabel>
									<Select
										labelId="demo-simple-select-outlined-label"
										id="demo-simple-select-outlined"
										name="prodCatId"
										value={this.state.prodCatId}
										onChange={this.handleChange.bind(this)}
										label="AgeKateqoriya"
									>
										<MenuItem value="">
											<em>None</em>
										</MenuItem>
										<MenuItem value="Kreslolar/Stullar">Kreslolar/Stullar</MenuItem>
									</Select>
								</FormControl>
								<StyledTextField
									required
									variant="outlined"
									label="Minimal miqdar"
									name="prodMinAmountVal"
									value={this.state.prodMinAmountVal}
									onChange={this.handleChange.bind(this)}
								/>
								<StyledTextField
									required
									variant="outlined"
									label="Optimal miqdar"
									name="prodOptAmountVal"
									value={this.state.prodOptAmountVal}
									onChange={this.handleChange.bind(this)}
								/>
								<StyledTextField
									className="fullLength"
									required
									type="datetime-local"
									variant="outlined"
									label="Son istifadə tarixi xəbərdarlıqı"
									name="prodExpDateVal"
									value={this.state.prodExpDateVal}
									onChange={this.handleChange.bind(this)}
								/>
							</div>
						</ProdInfo>
						<Divider style={{ margin: "20px 0" }} />
						<Clusters>
							<h1 className="info-title">Kəmiyyət</h1>
							<TableContainer component={Paper}>
								<StyledTable>
									<TableHead>
										<TableRow>
											<TableCell>Klasterin adı</TableCell>
											<TableCell>Capacity</TableCell>
											<TableCell>Default</TableCell>
											<TableCell>Delete</TableCell>
										</TableRow>
									</TableHead>
									<TableBody></TableBody>
								</StyledTable>
							</TableContainer>
						</Clusters>
						<Divider style={{ margin: "20px 0" }} />
						<ExistedTemplate>
							<FormControl variant="outlined">
								<InputLabel id="demo-simple-select-outlined-label">
									Hazır şablonu seç
								</InputLabel>
								<Select
									labelId="demo-simple-select-outlined-label"
									name="prodClusterTemplate"
									value={this.state.prodClusterTemplate}
									onChange={this.handleChange.bind(this)}
									label="Hazır şablonu seç"
								>
									<MenuItem value="">
										<em>None</em>
									</MenuItem>
									<MenuItem value="Kreslolar/Stullar">Kreslolar/Stullar</MenuItem>
								</Select>
							</FormControl>
							<Button variant="outlined">əlavə et</Button>
						</ExistedTemplate>
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
