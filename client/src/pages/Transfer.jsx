import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../components/GlobalDataProvider";
import api from "../tools/connect";
import dayjs from "dayjs";

import TransferArchive from "../components/TransferArchive";
import TransferTable from "../components/TransferTable";
import NewTransferForm from "../components/NewTransferForm";
import { CustomTextInput, CustomButton } from "../components/UtilComponents";
import { Tabs, Tab, Divider, Backdrop, CircularProgress } from "@material-ui/core";

// Icons
import RemoveIcon from "@material-ui/icons/Remove";

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

	.MuiButton-root {
		border-color: #faa61a;
		text-transform: none;
		font-weight: normal;
		font-size: 1rem;
		margin-right: 15px;
		height: 100%;
	}

	.dateBlock {
		display: flex;
		align-items: center;

		p {
			margin-right: 10px;
		}

		.MuiSvgIcon-root {
			margin: 0 7px;
		}

		.MuiOutlinedInput-input {
			padding: 12px 14px;
		}
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

class Transfer extends Component {
	static contextType = GlobalDataContext;
	state = {
		startDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
		endDate: dayjs().add(1, "year").format("YYYY-MM-DD"),
		transferTableData: [],
		archiveTableData: [],
		selectedSessionId: null, // null

		_tabValue: 0,
		loading: true,
	};

	componentDidMount() {
		this.getTransferData();
	}

	handleChange(e) {
		if (e.target.name === "startDate" || e.target.name === "endDate") {
			this.setState(
				{
					[e.target.name]: e.target.value,
				},
				() => {
					this.getTransferData();
				}
			);

			return;
		}
		this.setState({
			[e.target.name]: e.target.value,
		});
	}
	handleTabChange(e, newVal) {
		this.setState({
			_tabValue: newVal,
		});
	}

	async getTransferData() {
		this.setState({
			loading: true,
		});

		const transferTableData = await api
			.executeProcedure("anbar.transfer_products_session_selection", {
				date_from: dayjs(this.state.startDate).format("YYYY.MM.DD"),
				date_to: dayjs(this.state.endDate).format("YYYY.MM.DD"),
			})
			.catch(() => {
				return [];
			});

		const archiveTableData = await api
			.executeProcedure("[SalaryDB].anbar.[transfer_products_archive]", {
				storage_id: this.context.storageId,
			})
			.catch(() => {
				return [];
			});

		this.setState({
			loading: false,
			transferTableData,
			archiveTableData,
		});
	}

	createNewSession() {
		api
			.executeProcedure("[SalaryDB].anbar.[transfer_products_create_session]")
			.then(() => {
				this.context.success("New session created");
				this.getTransferData();
			})
			.catch((err) => this.context.error(err.errText));
	}

	render() {
		return (
			<StyledSection className="pageData">
				<Header>
					<h1 className="title">Məhsulların transferi</h1>

					<CustomButton
						onClick={() => {
							this.context
								.alert({
									title: "Yeni sessiya yarat",
									description: "Are you sure you want to create new session?",
								})
								.then(() => this.createNewSession())
								.catch(() => {});
						}}
					>
						Yeni sessiya
					</CustomButton>

					<div className="dateBlock">
						<p>Tarix:</p>
						<CustomTextInput
							required
							type="date"
							variant="outlined"
							name="startDate"
							value={this.state.startDate}
							onChange={this.handleChange.bind(this)}
						/>
						<RemoveIcon />
						<CustomTextInput
							required
							type="date"
							variant="outlined"
							name="endDate"
							value={this.state.endDate}
							onChange={this.handleChange.bind(this)}
						/>
					</div>
				</Header>

				<MainData>
					<Tabs value={this.state._tabValue} onChange={this.handleTabChange.bind(this)}>
						<Tab label="Təstiq gözləyənlər" />
						<Tab label="Arxiv" />
					</Tabs>

					<Divider />

					<TabItem hidden={this.state._tabValue !== 0}>
						<TransferTable
							showNewTransferForm={(id) => this.setState({ selectedSessionId: id })}
							refresh={this.getTransferData.bind(this)}
							tableData={this.state.transferTableData}
						/>
					</TabItem>

					<TabItem hidden={this.state._tabValue !== 1}>
						<TransferArchive tableData={this.state.archiveTableData} />
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

				<NewTransferForm
					sessionId={this.state.selectedSessionId}
					refresh={this.getTransferData.bind(this)}
					open={Boolean(this.state.selectedSessionId)}
					close={() => this.setState({ selectedSessionId: null })}
				/>
			</StyledSection>
		);
	}
}

export default Transfer;
