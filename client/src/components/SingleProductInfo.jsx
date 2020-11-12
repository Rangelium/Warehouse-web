import React, { Component } from "react";
import uuid from "react-uuid";
import styled from "styled-components";
import dayjs from "dayjs";

import {
	Paper,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	TableContainer,
} from "@material-ui/core";

// Icons
import ArrowBackIosOutlinedIcon from "@material-ui/icons/ArrowBackIosOutlined";

const SingleProduct = styled.section`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f5f5f5;

	opacity: ${(props) => (props.active ? 1 : 0)};
	pointer-events: ${(props) => (props.active ? "all" : "none")};
	transition: 0.3s;
	padding: 10px 15px 0 10px;

	display: flex;
	flex-direction: column;

	.row {
		display: flex;
		align-items: center;

		svg {
			cursor: pointer;
			color: #a9abac;
			transition: 0.3s;

			&:hover {
				color: #faa61a;
			}
		}

		.productName {
			flex-grow: 1;
			padding-left: 5px;
			font-size: 1.6rem;
			letter-spacing: 0.06em;
			font-weight: 600;
		}

		.MuiButton-root {
			border-color: #faa61a;
			text-transform: none;
			font-weight: normal;
			font-size: 1rem;
			margin-right: 15px;
		}
	}

	.info-blocks {
		margin-top: 10px;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 10px;
	}
`;
const StyledPaper = styled(Paper)`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	flex-grow: 1;
	background-color: transparent;
	height: 100px;
	padding-left: 15px;

	@media (max-width: 1300px) {
		margin-right: 0;
		margin-bottom: 5px;
	}

	p {
		font-size: 1.4rem;
		font-weight: 500;
		color: #231f20;
	}

	.title {
		font-size: 0.9rem;
		font-weight: 400;
		color: #474c54;
		padding-bottom: 5px;
	}
`;
const StyledTableContainer = styled(TableContainer)`
	margin-top: 10px;
	overflow-y: scroll;
	flex-grow: 1;

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
const StyledTable = styled(Table)`
	.head {
		font-size: 0.9rem;
		font-weight: 400;
		color: #54585f;
	}

	.dataEl {
		font-weight: 500;
		color: #231f20;
	}
`;

export default class SingleProductInfo extends Component {
	render() {
		if (!this.props.product) return <SingleProduct active={this.props.active ? 1 : 0} />;

		if (this.props.product.length <= 1)
			return (
				<SingleProduct active={this.props.active ? 1 : 0}>
					<div className="row">
						<ArrowBackIosOutlinedIcon onClick={() => this.props.goBack()} />
						<h1 className="productName">{this.props.product[0]}</h1>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							flexDirection: "column",
							height: "100%",
							width: "100%",
						}}
					>
						<h1 style={{ color: "#000", fontSize: "3rem", marginBottom: "15px" }}>
							No information
						</h1>
						<p style={{ fontSize: "1.2rem" }}>
							Looks like there is no information about this product yet
						</p>
					</div>
				</SingleProduct>
			);

		const DefaultText = 0;
		return (
			<SingleProduct active={this.props.active ? 1 : 0}>
				<div className="row">
					<ArrowBackIosOutlinedIcon onClick={() => this.props.goBack()} />
					<h1 className="productName">{this.props.product.title}</h1>
				</div>
				<div className="info-blocks">
					<StyledPaper variant="outlined">
						<p className="title">Məhsulun kodu</p>
						<p>
							{this.props.product.product_id
								? this.props.product.product_id
								: DefaultText}
						</p>
					</StyledPaper>
					<StyledPaper variant="outlined">
						<p className="title">Ümumi daxil olunan miqdar</p>
						<p>
							{this.props.product.in_quantity
								? this.props.product.in_quantity
								: DefaultText}
						</p>
					</StyledPaper>
					<StyledPaper variant="outlined">
						<p className="title">Ümumi satılan miqdar</p>
						<p>
							{this.props.product.out_quantity
								? this.props.product.out_quantity
								: DefaultText}
						</p>
					</StyledPaper>
					<StyledPaper variant="outlined">
						<p className="title">Yararlıq müddəti</p>
						<p>
							{this.props.product.exp_date
								? dayjs(this.props.product.exp_date).format("DD-MM-YYYY HH:mm")
								: DefaultText}
						</p>
					</StyledPaper>
					<StyledPaper variant="outlined">
						<p className="title">Orta alış qiyməti</p>
						<p>
							{this.props.product.avg_price
								? `${this.props.product.avg_price} ${this.props.product.currency}`
								: DefaultText}
						</p>
					</StyledPaper>
					<StyledPaper variant="outlined">
						<p className="title">Orta salış qiyməti</p>
						<p>
							{this.props.product.avg_out_price
								? `${this.props.product.avg_out_price} ${this.props.product.currency}`
								: DefaultText}
						</p>
					</StyledPaper>
					<StyledPaper variant="outlined">
						<p className="title">Qalıq</p>
						<p>{this.props.product.left ? this.props.product.left : DefaultText}</p>
					</StyledPaper>
					<StyledPaper variant="outlined">
						<p className="title">Hüceyrə nömrəsi</p>
						<p>
							{this.props.product.document_id
								? this.props.product.document_id
								: DefaultText}
						</p>
					</StyledPaper>
				</div>
				<StyledTableContainer component={Paper}>
					<StyledTable stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell className="head">Məhsul</TableCell>
								<TableCell className="head">K-yyət</TableCell>
								<TableCell className="head">Ölçü vahidi</TableCell>
								<TableCell className="head">Vahid qiyməti</TableCell>
								<TableCell className="head">Ümumi qiymət</TableCell>
								<TableCell className="head">Valyuta</TableCell>
								<TableCell className="head">Yararlıq müddəti</TableCell>
								<TableCell className="head">Fəaliyyət</TableCell>
								<TableCell className="head">Təstiq edilib</TableCell>
								<TableCell className="head">Hüceyrə nömrəsi</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.props.tableData.map((product) => (
								<TableRow key={uuid()}>
									<TableCell className="dataEl">{product.title}</TableCell>
									<TableCell align="center" className="dataEl">
										{product.quantity}
									</TableCell>
									<TableCell align="center" className="dataEl">
										{product.unit_title}
									</TableCell>
									<TableCell align="center" className="dataEl">
										{product.unit_price}
									</TableCell>
									<TableCell align="center" className="dataEl">
										{product.total_price}
									</TableCell>
									<TableCell align="center" className="dataEl">
										{product.currency}
									</TableCell>
									<TableCell align="center" className="dataEl">
										{dayjs(product.exp_date).format("DD-MM-YYYY")}
									</TableCell>
									<TableCell align="center" className="dataEl">
										{product.reason}
									</TableCell>
									<TableCell align="center" className="dataEl">
										{product.is_out ? "+" : "-"}
									</TableCell>
									<TableCell align="center" className="dataEl">
										{product.document_id}
									</TableCell>
								</TableRow>
							))}
							<TableRow></TableRow>
						</TableBody>
					</StyledTable>
				</StyledTableContainer>
			</SingleProduct>
		);
	}
}
