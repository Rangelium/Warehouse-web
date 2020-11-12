import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import uuid from "react-uuid";
import styled from "styled-components";
import { GlobalDataContext } from "./components/GlobalDataProvider";
import { ThemeProvider } from "styled-components";

// Components
import Navbar from "./components/Navbar";
import { CircularProgress } from "@material-ui/core";

// Pages
import WarehouseInfo from "./pages/WarehouseInfo";
import WarehouseAdd from "./pages/WarehouseAdd";
import WarehouseRemove from "./pages/WarehouseRemove";
import Currency from "./pages/Currency";
import ExpireDate from "./pages/ExpireDate";
import Transfer from "./pages/Transfer";
import Reports from "./pages/Reports";
import Invetory from "./pages/Invetory";
import NotFound from "./pages/NotFound";

const routes = [
	{ name: "Anbar haqqında", path: "/", Component: WarehouseInfo },
	{ name: "Mədaxil", path: "/add", Component: WarehouseAdd },
	{ name: "Məxaric", path: "/remove", Component: WarehouseRemove },
	{
		name: "Siyahı",
		children: [
			{ name: "Valyutalar", path: "/currency", Component: Currency },
			{ name: "Yararlılıq keçmiş", path: "/expire", Component: ExpireDate },
			{ name: "Transfer", path: "/transfer", Component: Transfer },
		],
	},
	{
		name: "Əlavə",
		children: [
			{ name: "Reportlar", path: "/reports", Component: Reports },
			{ name: "İnventarizasiya", path: "/inventory", Component: Invetory },
		],
	},
];

const StyledMain = styled.main`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	.pageData {
		/* flex-grow: 1; */
		height: calc(100% - 56px);
		background-color: #f5f5f5;
		position: relative;
	}
`;

class App extends React.Component {
	static contextType = GlobalDataContext;

	render() {
		let renderRoutes = [];
		routes.forEach(({ path, Component, children }) => {
			if (children) {
				children.forEach(({ path, Component, children }) => {
					renderRoutes.push(
						<ProtectedRoute exact key={uuid()} path={path} Component={Component} />
					);
				});
			} else {
				renderRoutes.push(
					<ProtectedRoute exact key={uuid()} path={path} Component={Component} />
				);
			}
		});

		return (
			<ThemeProvider theme={this.context.theme}>
				<BrowserRouter>
					<StyledMain>
						<Navbar routes={routes} />
						{this.context.storageId && (
							<Switch>
								{renderRoutes}
								<Route path="*" component={NotFound} />
							</Switch>
						)}
						{!this.context.storageId && (
							<div
								className="pageData"
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									flexDirection: "column",
								}}
							>
								<h1 style={{ color: "#000", fontSize: "3rem", marginBottom: "15px" }}>
									Loading...
								</h1>
								<p style={{ fontSize: "1.2rem" }}>
									Check your internet connection or VPN setup
								</p>
								<CircularProgress style={{ color: "#000", marginTop: "15px" }} />
							</div>
						)}
					</StyledMain>
				</BrowserRouter>
			</ThemeProvider>
		);
	}
}

export default App;
