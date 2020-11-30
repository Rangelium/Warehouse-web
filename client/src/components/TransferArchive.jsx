import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import dayjs from "dayjs";

import {
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@material-ui/core";

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

export default class TransferArchive extends Component {
	render() {
		console.log(this.props.tableData);
		return (
			<StyledTableContainer component={Paper}>
				<Table stickyHeader>
					<TableHead>
						<TableRow>
							<TableCell align="center">Məhsull</TableCell>
							<TableCell align="center">Barkod</TableCell>
							<TableCell align="center">Kəmiyyət</TableCell>
							<TableCell align="center">Ümumi Qiymət</TableCell>
							<TableCell align="center">Storage from</TableCell>
							<TableCell align="center">Storage to</TableCell>
							<TableCell align="center">Transfer date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{this.props.tableData.map((el) => (
							<TableRow key={uuid()}>
								<TableCell align="center">{el.product_title}</TableCell>
								<TableCell align="center">{el.barcode}</TableCell>
								<TableCell align="center">{`${el.quantity} ${el.unit_title}`}</TableCell>
								<TableCell align="center">{`${el.total_sum} ${el.currency}`}</TableCell>
								<TableCell align="center">{el.storage_from}</TableCell>
								<TableCell align="center">{el.storage_to}</TableCell>
								<TableCell align="center">
									{dayjs(el.transfered_date).format("MM.DD.YYYY")}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</StyledTableContainer>
		);
	}
}
