import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";

import {
	Button,
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

const StyledTableContainer = styled(TableContainer)`
	overflow-y: scroll;
	height: 100%;

	&::-webkit-scrollbar {
		width: 5px;
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
	state = {
		infoTable: false,
	};

	render() {
		const data = this.props.row;

		return (
			<>
				<TableRow>
					<TableCell>
						<IconButton
							size="small"
							onClick={() =>
								this.setState((oldProps) => {
									return { infoTable: !oldProps.infoTable };
								})
							}
						>
							{this.state.infoTable ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
						</IconButton>
					</TableCell>
					<TableCell align="center">{data.contract_id}</TableCell>
					<TableCell align="center">{data.date}</TableCell>
					<TableCell align="center">{data.seller}</TableCell>
					<TableCell align="center">{data.products}</TableCell>
					<TableCell align="center">{data.price}</TableCell>
					<TableCell align="center">{data.quantity}</TableCell>
					<TableCell align="center">{data.total_price}</TableCell>
					<TableCell align="center">
						<Button variant="outlined" onClick={() => {}}>
							təstİq et
						</Button>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
						<Collapse in={this.state.infoTable} timeout="auto" unmountOnExit>
							<Box margin={1}>
								<Table size="small" aria-label="purchases">
									<TableBody>
										<TableRow>
											<TableCell align="left">{"Mebel "}</TableCell>
											<TableCell align="center">9 AZN</TableCell>
											<TableCell align="center">10</TableCell>
											<TableCell align="center">90 AZN</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</Box>
						</Collapse>
					</TableCell>
				</TableRow>
			</>
		);
	}
}

export default class WarehouseAddTable extends Component {
	state = {
		data: [
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
		],
	};

	componentDidMount() {
		const data = [
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
			{
				contract_id: 756473823,
				date: "24.05.2020",
				seller: "Saloglu MMC",
				products: "5 məhsul",
				price: "60 AZN",
				total_price: "2 699 AZN",
				quantity: 150,
			},
		];

		this.setState({
			data,
		});
	}

	render() {
		return (
			<StyledTableContainer component={Paper}>
				<Table stickyHeader>
					<TableHead>
						<TableRow>
							<TableCell />
							<TableCell align="center">Mügavilə №</TableCell>
							<TableCell align="center">Tarix</TableCell>
							<TableCell align="center">Kontraqent</TableCell>
							<TableCell align="center">Məhsullar</TableCell>
							<TableCell align="center">Qiymət</TableCell>
							<TableCell align="center">K-yyət</TableCell>
							<TableCell align="center">Ümumi qiymət</TableCell>
							<TableCell align="center">Təstiq</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{this.state.data &&
							this.state.data.map((el) => <Row key={uuid()} row={el} />)}
					</TableBody>
				</Table>
			</StyledTableContainer>
		);
	}
}
