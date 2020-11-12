import React, { Component } from "react";
import styled from "styled-components";
import api from "../tools/connect";
import { GlobalDataContext } from "../components/GlobalDataProvider";
import dayjs from "dayjs";

import Treeview from "../components/Treeview";
import SingleProductInfo from "../components/SingleProductInfo";
import OverallInfo from "../components/OverallInfo";

import { Typography, Paper, Backdrop, CircularProgress } from "@material-ui/core";

// Icons
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";

const DrawerWidth = "380px";

const StyledSection = styled.section`
	display: flex;
`;
const MainData = styled.div`
	position: relative;
	width: ${(props) => (props.active ? "100%" : `calc(100% - ${DrawerWidth})`)};
	margin-left: ${(props) => (props.active ? `-${DrawerWidth}` : 0)};
	transition: 225ms;
`;
// const OverallInfo = styled.section`
// 	padding: 0 10px;
// 	display: flex;
// 	flex-direction: column;
// 	justify-content: flex-start;
// 	align-items: center;

// 	svg {
// 		color: #faa61a;
// 	}

// 	.block {
// 		width: 100%;
// 		display: inherit;
// 		flex-direction: column;

// 		.row {
// 			width: 100%;
// 			margin: 10px 0;
// 			display: inherit;
// 			align-items: center;
// 		}

// 		.special {
// 			display: grid;
// 			grid-template-columns: 1fr 1fr 1fr;
// 			grid-column-gap: 15px;
// 		}
// 		.special2 {
// 			display: grid;
// 			grid-template-columns: 1fr 1fr;
// 			grid-column-gap: 15px;
// 		}
// 	}

// 	h1 {
// 		font-size: 1.9rem;
// 		font-weight: 500;
// 		color: #231f20;
// 		padding-left: 10px;
// 	}
// 	h2 {
// 		font-size: 1.6rem;
// 		font-weight: 500;
// 		color: #231f20;
// 	}
// `;
// const StyledPaper = styled(Paper)`
// 	padding: 24px 32px;
// 	display: flex;
// 	flex-direction: column;
// 	align-items: flex-start;
// 	overflow: auto;

// 	&::-webkit-scrollbar {
// 		width: 5px;
// 		height: 5px;
// 	}
// 	/* Track */
// 	&::-webkit-scrollbar-track {
// 		box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
// 		border-radius: 10px;
// 		border-radius: 10px;
// 	}
// 	/* Handle */
// 	&::-webkit-scrollbar-thumb {
// 		border-radius: 10px;
// 		border-radius: 10px;
// 		background: #d7d8d6;
// 		box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
// 	}

// 	@media (max-width: 1300px) {
// 		margin-right: 0;
// 		margin-bottom: 5px;
// 	}

// 	p {
// 		font-size: 1.6rem;
// 		font-weight: 500;
// 		color: #231f20;
// 	}

// 	.title {
// 		width: 200px;
// 		font-size: 1rem;
// 		font-weight: 400;
// 		color: #474c54;
// 		padding-bottom: 5px;
// 	}

// 	.specialBlock {
// 		width: 100%;
// 		height: 250px;
// 		display: flex;
// 		flex-direction: column;

// 		.specialRow {
// 			padding-left: 35px;
// 			margin-top: 20px;
// 		}

// 		.specialUtil {
// 			position: relative;
// 			margin-top: 0;
// 			color: #5f6369;
// 			font-weight: 400;
// 			font-size: 1rem;

// 			.specialIcon {
// 				transform: scale(1.2);
// 				position: absolute;
// 				left: -10px;
// 				top: -3px;
// 			}
// 		}

// 		.specialTitle {
// 		}

// 		.data {
// 			.dataEl {
// 				margin-top: 3px;
// 				color: #5f6369;
// 				font-weight: 400;
// 				font-size: 1.2rem;

// 				.dataElVal {
// 					padding-left: 10px;
// 					font-size: 1.2rem;
// 					font-weight: 500;
// 					color: #231f20;
// 				}
// 			}
// 		}
// 	}
// `;

class WarehouseInfo extends Component {
	static contextType = GlobalDataContext;
	state = {
		drawer: true,
		dataForTreeview: null,
		selectedProduct: null,
		selectedProductTableData: [],
		loading: true,
		loadingSingleProduct: false,

		overallInfo: null,
	};

	async componentDidMount() {
		const data = await api.executeProcedure("anbar.warehouse_tree_select");

		let overallData = await api.executeProcedure("anbar.dashboard", {
			storage_id: this.context.storageId,
		});

		this.setState({
			dataForTreeview: data,
			overallInfo: overallData.length ? overallData[0] : {},
			loading: false,
		});
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
		this.setState({ loadingSingleProduct: true });
		const info = await api.executeProcedure("anbar.main_tree_click_info", {
			product_id: selectedProduct.product_id,
			storage_id: this.context.storageId,
		});

		const tableData = await api.executeProcedure("anbar.main_tree_click_table", {
			product_id: selectedProduct.product_id,
			storage_id: this.context.storageId,
		});

		this.setState({
			selectedProduct: info.length ? info[0] : [selectedProduct.title],
			selectedProductTableData: tableData.length ? tableData : [],
			loadingSingleProduct: false,
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
					<OverallInfo overallInfo={this.state.overallInfo} />
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
					<Backdrop
						style={{
							zIndex: 100000000,
							position: "absolute",
							backgroundColor: "rgba(0, 0, 0, 0.7)",
						}}
						open={this.state.loadingSingleProduct}
					>
						<CircularProgress style={{ color: "#fff" }} />
					</Backdrop>
				</MainData>
				<Backdrop
					style={{
						zIndex: 100000000,
						position: "absolute",
						backgroundColor: "rgba(0, 0, 0, 0.7)",
					}}
					open={this.state.loading}
				>
					<CircularProgress style={{ color: "#fff" }} />
				</Backdrop>
			</StyledSection>
		);
	}
}

export default WarehouseInfo;
