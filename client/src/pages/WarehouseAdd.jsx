import React, { Component } from "react";
import styled from "styled-components";

import WarehouseAddTable from "../components/WarehouseAddTable";
import { TextField, Tabs, Tab, Divider } from "@material-ui/core";

// Icons
import RemoveIcon from "@material-ui/icons/Remove";

const StyledSection = styled.section`
	padding: 10px 15px 0 15px;
	display: flex;
	flex-direction: column;
`;
const Header = styled.div`
	display: flex;
	align-items: center;

	.title {
		font-size: 1.9rem;
		font-weight: 500;
		color: #231f20;
		flex-grow: 1;
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
	flex-grow: 1;
	display: flex;
	flex-direction: column;

	.MuiTabs-root {
		.MuiTab-root {
			padding: 0;
		}

		.MuiTabs-indicator {
			background-color: #ffaa00;
		}
	}
`;

// ? I don't know wtf is going on but this does'n work without height,
// ? moreover height value can be anything lover than 500
const TableTab = styled.div`
	height: 1px;
	flex-grow: 1;
	padding: 15px 0 10px 0;
`;
const ArxivTab = styled.div``;
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

class WarehouseAdd extends Component {
	state = {
		newProdForm: false,
		startDate: "2020-10-08",
		endDate: "2020-10-10",

		_tabValue: 0,
	};

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
		});
	}
	handleTabChange(e, newVal) {
		this.setState({
			_tabValue: newVal,
		});
	}

	// * Create New Product form handlers
	handleNewProdFormOpen() {
		this.setState({ newProdForm: true });
	}
	handleNewProdFormClose() {
		this.setState({ newProdForm: false });
	}

	render() {
		return (
			<StyledSection className="pageData">
				<Header>
					<h1 className="title">Mədaxil</h1>

					<div className="dateBlock">
						<p>Tarix:</p>
						<StyledTextField
							className="fullLength"
							required
							type="date"
							variant="outlined"
							name="startDate"
							value={this.state.startDate}
							onChange={this.handleChange.bind(this)}
						/>
						<RemoveIcon />
						<StyledTextField
							className="fullLength"
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
					<TableTab hidden={this.state._tabValue !== 0}>
						<WarehouseAddTable start={this.state.startDate} end={this.state.endDate} />
					</TableTab>
					<ArxivTab hidden={this.state._tabValue !== 1}>Item two</ArxivTab>
				</MainData>
			</StyledSection>
		);
	}
}

export default WarehouseAdd;
