import React, { Component } from "react";
import styled from "styled-components";
import api from "../tools/connect";
import { GlobalDataContext } from "../components/GlobalDataProvider";
import dayjs from "dayjs";

import Treeview from "../components/Treeview";
import SingleProductInfo from "../components/SingleProductInfo";

import { Typography, Paper } from "@material-ui/core";

// Icons
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";

const DrawerWidth = "440px";

const StyledSection = styled.section`
	display: flex;
`;
const MainData = styled.div`
	position: relative;
	width: ${(props) => (props.active ? "100%" : `calc(100% - ${DrawerWidth})`)};
	margin-left: ${(props) => (props.active ? `-${DrawerWidth}` : 0)};
	transition: 225ms;
`;
const OverallInfo = styled.section`
	padding: 0 10px;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;

	svg {
		color: #faa61a;
	}

	.block {
		width: 100%;
		display: inherit;
		flex-direction: column;

		.row {
			width: 100%;
			margin: 10px 0;
			display: inherit;
			align-items: center;
		}

		.special {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			grid-column-gap: 15px;
		}
		.special2 {
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-column-gap: 15px;
		}
	}

	h1 {
		font-size: 1.9rem;
		font-weight: 500;
		color: #231f20;
		padding-left: 10px;
	}
	h2 {
		font-size: 1.6rem;
		font-weight: 500;
		color: #231f20;
	}
`;
const StyledPaper = styled(Paper)`
	padding: 24px 32px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;

	@media (max-width: 1300px) {
		margin-right: 0;
		margin-bottom: 5px;
	}

	p {
		font-size: 1.6rem;
		font-weight: 500;
		color: #231f20;
	}

	.title {
		width: 200px;
		font-size: 1rem;
		font-weight: 400;
		color: #474c54;
		padding-bottom: 5px;
	}

	.specialBlock {
		width: 100%;
		display: flex;
		flex-direction: column;

		.specialRow {
			padding-left: 35px;
			margin-top: 20px;
		}

		.specialUtil {
			position: relative;
			margin-top: 0;
			color: #5f6369;
			font-weight: 400;
			font-size: 1rem;

			.specialIcon {
				transform: scale(1.2);
				position: absolute;
				left: -10px;
				top: -3px;
			}
		}

		.specialTitle {
		}

		.data {
			.dataEl {
				margin-top: 3px;
				color: #5f6369;
				font-weight: 400;
				font-size: 1.2rem;

				.dataElVal {
					padding-left: 10px;
					font-size: 1.2rem;
					font-weight: 500;
					color: #231f20;
				}
			}
		}
	}
`;

class WarehouseInfo extends Component {
	static contextType = GlobalDataContext;
	state = {
		drawer: true,
		dataForTreeview: null,
		selectedProduct: null,
		selectedProductTableData: [],

		overallInfo: {
			quantity: "",
			totalLeft: "",
			totalCost: "",
			last_in_act_num: "",
			last_in_currency: "",
			last_in_date: "",
			last_in_id: "",
			last_in_invoice_num: "",
			last_in_name: "",
			last_in_price: "",
			last_in_price_total: "",
			last_in_quantity: "",
			last_out_currency: "",
			last_out_date: "",
			last_out_id: "",
			last_out_name: "",
			last_out_price: "",
			last_out_price_total: "",
			last_out_quantity: "",
		},
	};

	async componentDidMount() {
		const data = await api.executeProcedure("anbar.warehouse_tree_select", {
			storage_id: this.context.storageId,
		});

		let overallData = await api.executeProcedure("anbar.dashboard", {
			storage_id: this.context.storageId,
		});
		overallData = overallData[0];

		try {
			this.setState({
				dataForTreeview: data,
				overallInfo: {
					quantity: overallData.quantity,
					totalLeft: overallData.remaining_products,
					totalCost: overallData.cost,
					last_in_act_num: overallData.last_in_act_num,
					last_in_currency: overallData.last_in_currency,
					last_in_date: overallData.last_in_date,
					last_in_id: overallData.last_in_id,
					last_in_invoice_num: overallData.last_in_invoice_num,
					last_in_name: overallData.last_in_name,
					last_in_price: overallData.last_in_price,
					last_in_price_total: overallData.last_in_price_total,
					last_in_quantity: overallData.last_in_quantity,
					last_out_currency: overallData.last_out_currency,
					last_out_date: overallData.last_out_date,
					last_out_id: overallData.last_out_id,
					last_out_name: overallData.last_out_name,
					last_out_price: overallData.last_out_price,
					last_out_price_total: overallData.last_out_price_total,
					last_out_quantity: overallData.last_out_quantity,
				},
			});
		} catch (error) {
			console.log(error);
		}
	}

	openDrawer() {
		this.setState({
			drawer: true,
		});
	}
	closeDrawer() {
		this.setState({
			drawer: false,
		});
	}

	async selectProduct(selectedProduct) {
		const info = await api.executeProcedure("anbar.main_tree_click_info", {
			product_id: selectedProduct.product_id,
			storage_id: this.context.storageId,
		});

		const tableData = await api.executeProcedure("anbar.main_tree_click_table", {
			product_id: selectedProduct.product_id,
			storage_id: this.context.storageId,
		});

		this.setState({
			selectedProduct: info.length ? info[0] : info,
			selectedProductTableData: tableData.length ? tableData : [],
		});
	}

	render() {
		return (
			<StyledSection className="pageData">
				<Treeview
					selectProduct={(a) => this.selectProduct(a)}
					data={this.state.dataForTreeview}
					drawerwidth={DrawerWidth}
					active={this.state.drawer ? 1 : 0}
					open={() => this.openDrawer()}
					close={() => this.closeDrawer()}
				/>
				<MainData active={this.state.drawer ? 0 : 1}>
					<OverallInfo>
						<div className="block">
							<div className="row">
								<InfoOutlinedIcon style={{ width: "25px", height: "25px" }} />
								<Typography variant="h1">Ümumi məlumat</Typography>
							</div>
						</div>
						<div className="block">
							<div className="row">
								<Typography variant="h2">Statistika</Typography>
							</div>

							<div className="row special">
								<StyledPaper elevation={3}>
									<p className="title">Məhsulun miqdarı</p>
									<p>{this.state.overallInfo.quantity}</p>
								</StyledPaper>
								<StyledPaper elevation={3}>
									<p className="title">Məhsulların qalan hissəsi</p>
									<p>{this.state.overallInfo.totalLeft}</p>
								</StyledPaper>
								<StyledPaper elevation={3}>
									<p className="title">Anbarın ümumi dəyəri</p>
									<p>{this.state.overallInfo.totalCost}</p>
								</StyledPaper>
							</div>
						</div>
						<div className="block">
							<div className="row">
								<Typography variant="h2">Son dəyişiklər</Typography>
							</div>
							<div className="row special2">
								<StyledPaper elevation={3}>
									<div className="specialBlock">
										<p className="specialUtil specialRow">
											<InfoOutlinedIcon className="specialIcon" /> Son daxil olunmuş
											məhsul
										</p>
										<h2 className="specialTitle specialRow">
											{this.state.overallInfo.last_in_name}
										</h2>
										<div className="data specialRow">
											<p className="dataEl">
												Tarix:
												<span className="dataElVal">
													{dayjs(this.state.overallInfo.last_in_date).format(
														"MMMM DD YYYY, HH:mm"
													)}
												</span>
											</p>
											<p className="dataEl">
												Qiymət:
												<span className="dataElVal">{`${this.state.overallInfo.last_in_price} ${this.state.overallInfo.last_in_currency}`}</span>
											</p>
											<p className="dataEl">
												Miqdar:
												<span className="dataElVal">
													{this.state.overallInfo.last_in_quantity}
												</span>
											</p>
											<p className="dataEl">
												Ümumi qiymət:
												<span className="dataElVal">{`${this.state.overallInfo.last_in_price_total} ${this.state.overallInfo.last_in_currency}`}</span>
											</p>
										</div>
									</div>
								</StyledPaper>
								<StyledPaper elevation={3}>
									<div className="specialBlock">
										<p className="specialUtil specialRow">
											<InfoOutlinedIcon className="specialIcon" /> Son satılan məhsul
										</p>
										<h2 className="specialTitle specialRow">
											{this.state.overallInfo.last_out_name}
										</h2>
										<div className="data specialRow">
											<p className="dataEl">
												Tarix:
												<span className="dataElVal">
													{dayjs(this.state.overallInfo.last_out_date).format(
														"MMMM DD YYYY, HH:mm"
													)}
												</span>
											</p>
											<p className="dataEl">
												Qiymət:
												<span className="dataElVal">{`${this.state.overallInfo.last_out_price} ${this.state.overallInfo.last_out_currency}`}</span>
											</p>
											<p className="dataEl">
												Miqdar:
												<span className="dataElVal">
													{this.state.overallInfo.last_out_quantity}
												</span>
											</p>
											<p className="dataEl">
												Ümumi qiymət:
												<span className="dataElVal">{`${this.state.overallInfo.last_out_price} ${this.state.overallInfo.last_out_currency}`}</span>
											</p>
										</div>
									</div>
								</StyledPaper>
							</div>
						</div>
					</OverallInfo>
					<SingleProductInfo
						goBack={() =>
							this.setState({
								selectedProduct: null,
							})
						}
						product={this.state.selectedProduct}
						tableData={this.state.selectedProductTableData}
						active={this.state.selectedProduct ? 1 : 0}
					/>
				</MainData>
			</StyledSection>
		);
	}
}

export default WarehouseInfo;
