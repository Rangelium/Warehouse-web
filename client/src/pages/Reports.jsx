// ! BUG
// ! Data for downloading report will be taken from current state i.e
// ! donloaded report will be the report generated from input not the showed one

// TODO: Deal with invetory part

import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../components/GlobalDataProvider";
import api from "../tools/connect";
import dayjs from "dayjs";
import uuid from "react-uuid";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";

import {
	CustomSelect,
	CustomSelectItem,
	CustomTextInput,
	CustomButton,
} from "../components/UtilComponents";
import { Divider, Backdrop, CircularProgress } from "@material-ui/core";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";

// Icons
import RemoveIcon from "@material-ui/icons/Remove";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import { ReactComponent as ExcelIcon } from "../assets/excel.svg";
import { ReactComponent as HtmlIcon } from "../assets/html.svg";

// *
// * GLOBALS
// *
const REPORTS_TYPES = [
	{ name: "Mədaxil Report", value: "reportBuy" },
	{ name: "Məxaric Report", value: "reportSale" },
	{ name: "Silinmələr Report", value: "Decomission" },
	{ name: "İnventarizasiya", value: "Inventory" },
	// { name: "Bütün malların dövriyyəsi", value: "CommodityCirculationOfAllProducts" },
];
const REPORTS_FORMATS = [
	{ name: "PDF", value: "PDF", ext: ".pdf", icon: <PictureAsPdfIcon /> },
	{
		name: "HTML",
		value: "HTML",
		ext: ".html",
		icon: <HtmlIcon className="MuiSvgIcon-root" />,
	},
	{
		name: "EXCEL",
		value: "EXCEL",
		ext: ".xls",
		icon: <ExcelIcon className="MuiSvgIcon-root" />,
	},
];

const giveReportURL = ({ reportType, reportFormat, startDate, endDate, storageId }) => {
	if (reportType === "reportBuy") {
		return `http://172.16.3.42:88/Reports/Report.php?ReportName=${reportType}&Format=${reportFormat}&data[dateto]=${endDate}&data[datefrom]=${startDate}&data[storageid]=${storageId}`;
	}
	if (reportType === "Decomission") {
		return `http://172.16.3.42:88/Reports/Report.php?ReportName=${reportType}&Format=${reportFormat}&data[dateto]=${endDate}&data[datefrom]=${startDate}`;
	}
	return `http://172.16.3.42:88/Reports/Report.php?ReportName=${reportType}&Format=${reportFormat}&data[dateto]=${endDate}&data[datefrom]=${startDate}&data[storage_id]=${storageId}`;
};
const giveInvetoryURL = ({ reportType, reportFormat, tableName }) =>
	`http://172.16.3.42:88/Reports/Report.php?ReportName=${reportType}&Format=${reportFormat}&data[table_name]=${tableName}`;

// react-pdf setup for create-react-app src = "https://github.com/wojtekmaj/react-pdf/blob/v4.x/README.md#standard-browserify-and-others"
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// *
// * STYLES
// *
const StyledSection = styled.section`
	display: flex;
	flex-direction: column;

	.MuiSpeedDial-root {
		position: absolute;
		bottom: 15px;
		right: 25px;

		.MuiSpeedDial-fab {
			background-color: #ffaa00;
		}

		.MuiSpeedDial-actions {
			.MuiSpeedDialAction-fab {
				background-color: #ffaa00;

				.MuiSvgIcon-root {
					color: #231f20;
				}
			}
		}
	}
`;
const ToolBar = styled.div`
	padding: 10px 15px;
	position: relative;
	display: flex;
	flex-wrap: nowrap;
	gap: 15px;

	.dateBlock,
	.tableNameBlock {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
	}

	hr {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
	}
`;
const ReportContainer = styled.div`
	flex-grow: 1;
	position: relative;
	overflow: auto;
	background-color: #fff; // bg color of pdf

	&::-webkit-scrollbar {
		width: 8px;
		height: 8px;
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

	.pdfDocument {
		.react-pdf__Page {
			.react-pdf__Page__canvas {
				position: relative;
				left: 50%;
				transform: translateX(-50%);
			}
		}
	}
`;

// *
// * REACT CODE
// *
export default class Reports extends Component {
	static contextType = GlobalDataContext;
	state = {
		reportType: REPORTS_TYPES[0].value,
		startDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
		endDate: dayjs().format("YYYY-MM-DD"),

		tableName: 0,
		tablesNames: null,

		numOfPages: null,
		pdfUrl: null,
		loading: false,
		speedDealOpen: false,
	};

	componentDidMount() {
		api
			.executeProcedure("[SalaryDB].inventory.[tables_list]")
			.then((res) => this.setState({ tablesNames: res, tableName: res[0].table_name }))
			.catch((err) => console.log(err));
	}
	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
			pdfUrl: null,
		});
	}

	//  TODO: use react-pdf
	loadReport() {
		if (this.state.reportType === "Inventory") {
			const config = {
				reportType: this.state.reportType,
				reportFormat: "PDF",
				tableName: this.state.tableName,
			};

			const url = giveInvetoryURL(config);

			if (url !== this.state.pdfUrl) {
				this.setState({
					pdfUrl: url,
					loading: true,
				});
			} else {
				this.context.error("Already loaded");
			}
		} else {
			const config = {
				reportType: this.state.reportType,
				reportFormat: "PDF",
				startDate: this.state.startDate,
				endDate: this.state.endDate,
				storageId: this.context.storageId,
			};

			const url = giveReportURL(config);

			if (url !== this.state.pdfUrl) {
				this.setState({
					pdfUrl: url,
					loading: true,
				});
			} else {
				this.context.error("Already loaded");
			}
		}
	}
	downloadReport(format, ext) {
		let url = null;
		if (this.state.reportType === "Inventory") {
			const config = {
				reportType: this.state.reportType,
				reportFormat: format.toUpperCase(),
				tableName: this.state.tableName,
			};

			url = giveInvetoryURL(config);
		} else {
			const config = {
				reportType: this.state.reportType,
				reportFormat: format.toUpperCase(),
				startDate: this.state.startDate,
				endDate: this.state.endDate,
				storageId: this.context.storageId,
			};

			url = giveReportURL(config);
		}
		axios({
			url,
			method: "GET",
			responseType: "blob",
		})
			.then((response) => {
				const url = window.URL.createObjectURL(new Blob([response.data]));

				const link = document.createElement("a");
				link.href = url;
				link.setAttribute("download", `Report${ext}`);
				document.body.appendChild(link);
				link.click();
			})
			.catch((err) => this.context.error(err.message));
	}

	render() {
		return (
			<StyledSection className="pageData">
				<ToolBar>
					<CustomSelect
						MenuProps={{
							anchorOrigin: {
								vertical: "bottom",
								horizontal: "left",
							},
							transformOrigin: {
								vertical: "top",
								horizontal: "left",
							},
							getContentAnchorEl: null,
						}}
						style={{ minWidth: "240px" }}
						required
						label="Reportun növü"
						name="reportType"
						value={this.state.reportType}
						onChange={this.handleChange.bind(this)}
					>
						{REPORTS_TYPES.map(({ name, value }) => (
							<CustomSelectItem key={uuid()} value={value}>
								{name}
							</CustomSelectItem>
						))}
					</CustomSelect>

					{this.state.reportType !== "Inventory" ? (
						<div className="dateBlock">
							<CustomTextInput
								required
								type="date"
								label="Başlama tarixi"
								name="startDate"
								value={this.state.startDate}
								onChange={this.handleChange.bind(this)}
							/>
							<RemoveIcon />
							<CustomTextInput
								required
								type="date"
								label="Bitmə tarixi"
								name="endDate"
								value={this.state.endDate}
								onChange={this.handleChange.bind(this)}
							/>
						</div>
					) : (
						<div className="tableNameBlock">
							<CustomSelect
								MenuProps={{
									anchorOrigin: {
										vertical: "bottom",
										horizontal: "left",
									},
									transformOrigin: {
										vertical: "top",
										horizontal: "left",
									},
									getContentAnchorEl: null,
								}}
								style={{ minWidth: "260px" }}
								required
								label="Reportun adı"
								name="tableName"
								value={this.state.tableName}
								onChange={this.handleChange.bind(this)}
							>
								{this.state.tablesNames.map(({ table_name }) => (
									<CustomSelectItem key={uuid()} value={table_name}>
										{table_name}
									</CustomSelectItem>
								))}
							</CustomSelect>
						</div>
					)}

					<div className="space" style={{ flexGrow: 1 }}></div>

					<CustomButton
						disabled={this.state.loading}
						onClick={this.loadReport.bind(this)}
						style={{ paddingLeft: 20, paddingRight: 20 }}
					>
						Göstər
					</CustomButton>

					<Divider />
				</ToolBar>

				<ReportContainer>
					{Boolean(this.state.pdfUrl) && (
						<Document
							className="pdfDocument"
							file={this.state.pdfUrl}
							loading={<></>}
							onLoadSuccess={({ numPages }) =>
								this.setState({ loading: false, numOfPages: numPages })
							}
							onLoadError={(err) => this.context.error(err.message)}
						>
							{[...Array(this.state.numOfPages)].map((n, i) => (
								<Page pageNumber={i + 1} key={uuid()} />
							))}
						</Document>
					)}

					<Backdrop
						style={{
							zIndex: 1000,
							position: "absolute",
							backgroundColor: "rgba(0, 0, 0, 0.7)",
						}}
						open={!Boolean(this.state.pdfUrl) || this.state.loading}
					>
						{!Boolean(this.state.pdfUrl) && (
							<p style={{ fontSize: "1.6rem", color: "#fff", userSelect: "none" }}>
								Başlamaq üçün "Göstər" düyməsinə basın
							</p>
						)}
						{this.state.loading && <CircularProgress style={{ color: "#fff" }} />}
					</Backdrop>
				</ReportContainer>

				<SpeedDial
					ariaLabel="SpeedDial"
					direction="up"
					icon={<SpeedDialIcon />}
					hidden={!Boolean(this.state.pdfUrl) || this.state.loading}
					onClose={() => this.setState({ speedDealOpen: false })}
					onOpen={() => this.setState({ speedDealOpen: true })}
					open={this.state.speedDealOpen}
				>
					{REPORTS_FORMATS.map(({ name, value, ext, icon }) => (
						<SpeedDialAction
							key={uuid()}
							icon={icon}
							tooltipTitle={name}
							value={value}
							onClick={() => {
								this.downloadReport(value, ext);
								this.setState({ speedDealOpen: false });
							}}
						>
							PDF
						</SpeedDialAction>
					))}
				</SpeedDial>
			</StyledSection>
		);
	}
}
