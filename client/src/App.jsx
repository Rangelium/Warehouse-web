import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import uuid from "react-uuid";
import styled from "styled-components";
import { GlobalDataContext } from "./components/GlobalDataProvider";
import { ThemeProvider } from "styled-components";

// Components
import Navbar from "./components/Navbar";

// Pages
import WarehouseInfo from "./pages/WarehouseInfo";
import WarehouseAdd from "./pages/WarehouseAdd";
import NotFound from "./pages/NotFound";

const routes = [
	{ name: "Anbar haqqında", path: "/", Component: WarehouseInfo },
	{ name: "Mədaxil", path: "/add", Component: WarehouseAdd },
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
					</StyledMain>
				</BrowserRouter>
			</ThemeProvider>
		);
	}
}

export default App;
