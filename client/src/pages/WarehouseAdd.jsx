import React, { Component } from "react";
import styled from "styled-components";
import api from "../tools/connect";
import { GlobalDataContext } from "../components/GlobalDataProvider";

import WarehouseAddArchive from "../components/WarehouseAddArchive";
import WarehouseAddTable from "../components/WarehouseAddTable";
import { Tabs, Tab, Divider, Backdrop, CircularProgress } from "@material-ui/core";

const StyledSection = styled.section`
	display: flex;
	flex-direction: column;

	.MuiTabs-root {
		padding: 0 15px 0 0;

		.MuiTab-root {
			padding: 0;
		}

		.MuiTabs-indicator {
			background-color: #ffaa00;
		}
	}
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
`;
const MainData = styled.div`
	padding: 0 15px;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	position: relative;
`;
const TabItem = styled.div`
	height: 1px;
	flex-grow: 1;
	padding-top: 15px;
	padding-bottom: 10px;
`;

class WarehouseAdd extends Component {
	static contextType = GlobalDataContext;
	state = {
		procurementTableData: [],
		archiveTableData: [],

		_tabValue: 0,
		loading: true,
	};

	async componentDidMount() {
		this.getProcurementsData();
	}
	handleTabChange(e, newVal) {
		this.setState({
			_tabValue: newVal,
		});
	}

	async getProcurementsData() {
		this.setState({
			loading: true,
		});

		const procurementTableData = await api
			.executeProcedure("[SalaryDB].procurement.[orders_for_warehouse]", { result: 11 })
			.catch(() => {
				return [];
			});

		const archiveTableData = await api
			.executeProcedure("[SalaryDB].anbar.[order_request_archive]", {
				storage_id: this.context.storageId,
			})
			.catch(() => {
				return [];
			});

		this.setState({
			loading: false,
			procurementTableData,
			archiveTableData,
		});
	}

	render() {
		return (
			<StyledSection className="pageData">
				<Header>
					<h1 className="title">Mədaxil</h1>
				</Header>

				<MainData>
					<Tabs value={this.state._tabValue} onChange={this.handleTabChange.bind(this)}>
						<Tab label="Təstiq gözləyənlər" />
						<Tab label="Arxiv" />
					</Tabs>

					<Divider />

					<TabItem hidden={this.state._tabValue !== 0}>
						<WarehouseAddTable
							refresh={this.getProcurementsData.bind(this)}
							tableData={this.state.procurementTableData}
						/>
					</TabItem>

					<TabItem hidden={this.state._tabValue !== 1}>
						<WarehouseAddArchive tableData={this.state.archiveTableData} />
					</TabItem>

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
			</StyledSection>
		);
	}
}

export default WarehouseAdd;
