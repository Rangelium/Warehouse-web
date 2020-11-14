import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "./GlobalDataProvider";
import uuid from "react-uuid";
import dayjs from "dayjs";
import api from "../tools/connect";

import { CustomButton } from "./UtilComponents";
import {
	IconButton,
	Paper,
	Box,
	Collapse,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@material-ui/core";

// Icons
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import RemoveIcon from "@material-ui/icons/Remove";
import DoneIcon from "@material-ui/icons/Done";

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

class Row extends Component {
	static contextType = GlobalDataContext;
	state = {
		infoTable: false,
		productsTableData: [],
	};

	finishSession() {
		api
			.executeProcedure("anbar.transfer_products_session_info_accept_insert", {
				transfer_session_id: this.props.row.id,
			})
			.then(() => {
				this.context.success("Sessiya təsdiq edildi");
				this.props.refresh();
			})
			.catch((err) => this.context.error(err.errText));
	}

	handleExpandRowClick() {
		if (!this.state.infoTable) {
			api
				.executeProcedure("[SalaryDB].anbar.[transfer_products_session_info_selection]", {
					session_id: this.props.row.id,
				})
				.then((res) => {
					this.setState({
						productsTableData: res,
						infoTable: true,
					});
				})
				.catch((err) => console.error(err.errText));

			return;
		}
		this.setState({
			infoTable: false,
		});
	}

	render() {
		const data = this.props.row;

		return (
			<>
				<TableRow>
					<TableCell style={{ borderBottom: "unset" }}>
						<IconButton size="small" onClick={this.handleExpandRowClick.bind(this)}>
							{this.state.infoTable ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
						</IconButton>
					</TableCell>
					<TableCell style={{ borderBottom: "unset" }} align="center">
						{dayjs(data.begin_date).subtract(4, "hour").format("DD MMMM YYYY, HH:mm:ss")}
					</TableCell>
					<TableCell style={{ borderBottom: "unset" }} align="center">
						{data.number_of_products}
					</TableCell>
					<TableCell
						style={{ borderBottom: "unset" }}
						align="center"
					>{`${data.total_sum} ${data.default_currency}`}</TableCell>
					<TableCell style={{ borderBottom: "unset" }} align="center">
						{data.done === "+" ? <DoneIcon /> : <RemoveIcon />}
					</TableCell>
					<TableCell style={{ borderBottom: "unset" }} align="center">
						<CustomButton
							disabled={data.done === "+" ? true : false}
							style={{ marginRight: "5px" }}
							onClick={() => this.props.showNewTransferForm(data.id)}
						>
							Əlavə et
						</CustomButton>
						<CustomButton
							disabled={data.done === "+" ? true : false}
							onClick={() => {
								this.context
									.alert({ title: "Finish session", description: "Are you sure?" })
									.then(() => this.finishSession())
									.catch(() => {});
							}}
						>
							Təstiq et
						</CustomButton>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
						<Collapse in={this.state.infoTable} timeout="auto" unmountOnExit>
							<Paper style={{ padding: "10px 0" }} elevation={0}>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell align="center">Məhsul</TableCell>
											<TableCell align="center">Barkod</TableCell>
											<TableCell align="center">Kəmiyyət</TableCell>
											<TableCell align="center">Qiymət</TableCell>
											<TableCell align="center">Ümumi Qiymət</TableCell>
											<TableCell align="center">Hüceyrə nömrəsi</TableCell>
											<TableCell align="center">Transfer olunan anbarın adı</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.productsTableData.map((product) => (
											<TableRow>
												<TableCell align="center">{product.title[0]}</TableCell>
												<TableCell align="center">{product.barcode}</TableCell>
												<TableCell align="center">{`${product.quantity} ${product.unit_title}`}</TableCell>
												<TableCell align="center">{`${product["price for 1"]} ${product.title[1]}`}</TableCell>
												<TableCell align="center">{`${product.sum_price} ${product.title[1]}`}</TableCell>
												<TableCell align="center">{product.product_cell}</TableCell>
												<TableCell align="center">{product.storage_name}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Paper>
						</Collapse>
					</TableCell>
				</TableRow>
			</>
		);
	}
}

export default class TransferTable extends Component {
	render() {
		return (
			<StyledTableContainer component={Paper}>
				<Table stickyHeader>
					<TableHead>
						<TableRow>
							<TableCell />
							<TableCell align="center">Yaradılış tarixi</TableCell>
							<TableCell align="center">Kəmiyyət</TableCell>
							<TableCell align="center">Ümumi qiymət</TableCell>
							<TableCell align="center">Təsdiq edilib</TableCell>
							<TableCell align="center">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{this.props.tableData.map((el) => (
							<Row
								refresh={this.props.refresh}
								showNewTransferForm={(id) => this.props.showNewTransferForm(id)}
								key={uuid()}
								row={el}
							/>
						))}
					</TableBody>
				</Table>
			</StyledTableContainer>
		);
	}
}
