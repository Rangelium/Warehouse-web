import React from "react";
import { Redirect, Route, Switch, withRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import uuid from "react-uuid";
import dayjs from "dayjs";
import styled from "styled-components";
import { GlobalDataContext } from "./components/GlobalDataProvider";
import { ThemeProvider } from "styled-components";

// Components
import Navbar from "./components/Navbar";
import { CircularProgress } from "@material-ui/core";
import RedirectToProcurement from "./pages/Login/redirect.component";
// Pages

import WarehouseInfo from "./pages/WarehouseInfo/WarehouseInfo";
import WarehouseAdd from "./pages/WarehouseAdd/WarehouseAdd";
import WarehouseRemove from "./pages/WarehouseRemove/WarehouseRemove";
import Currency from "./pages/Currency/Currency";
import ExpireDate from "./pages/ExpireDate/ExpireDate";
import Transfer from "./pages/Transfer/Transfer";
import Reports from "./pages/Reports/Reports";
import Invetory from "./pages/Inventory/Inventory";
import InitialRemainders from "./pages/InitialRemainders/InitialRemainders";
import ManageWarehouses from "./pages/ManageWarehouses/ManageWarehouses";
import NotFound from "./pages/NotFound/NotFound";
import Login from "./pages/Login/Login";

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
      {
        name: "İlkin qalıqlar",
        path: "/initialRemainders",
        Component: InitialRemainders,
      },
      {
        name: "Anbarın quraşdırılması",
        path: "/manageWarehouses",
        Component: ManageWarehouses,
      },
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
  constructor() {
    super();
    this.state = {
      checkUser: true,
    };

    this.NavbarRef = React.createRef();
  }

  componentDidMount() {
    if (
      this.props.location.search.match(/from=(.*)&/) &&
      this.props.location.search.match(/from=(.*)&/)[1] === "procurement" &&
      this.props.location.search.match(/action=(.*)/)[1] === "logout"
    ) {
      console.log(this.props.location, "kek");
      this.context.setToken(null);
      window.location.replace("http://192.168.0.182:54321/login");
    }
    const data = localStorage.getItem("warehouseAccessToken");
    if (data) {
      const tokenData = JSON.parse(data);
      console.log(tokenData);
      if (parseInt(tokenData.timestamp) + 14400 < dayjs().unix()) {
        localStorage.removeItem("warehouseAccessToken");
      } else {
        this.context.setToken(tokenData.token);
      }
    } else if (this.props.location.search.match(/token=(.*)/)) {
      const token = this.props.location.search.match(/token=(.*)/)[1];
      console.log(token, "kek");
      this.context.setToken(token);
    }

    this.setState({
      checkUser: false,
    });
  }

  render() {
    let renderRoutes = [];
    routes.forEach(({ path, Component, children }) => {
      if (children) {
        children.forEach(({ path, Component }) => {
          renderRoutes.push(
            <ProtectedRoute
              reloadNavbarStorage={this.NavbarRef.current?.getStoragesList}
              exact
              key={uuid()}
              path={path}
              Component={Component}
            />
          );
        });
      } else {
        renderRoutes.push(
          <ProtectedRoute
            exact
            key={uuid()}
            path={path}
            Component={Component}
          />
        );
      }
    });

    if (this.state.checkUser) return null;

    return (
      <ThemeProvider theme={this.context.theme}>
        {!Boolean(this.context.userId) && (
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route
              path="*"
              render={(props) => <RedirectToProcurement {...props} />}
            />
          </Switch>
        )}
        {Boolean(this.context.userId) && (
          <StyledMain>
            <Navbar ref={this.NavbarRef} routes={routes} />
            {this.context.storageId && (
              <Switch>
                {renderRoutes}
                <Route path="/login" render={() => <Redirect to="/" />} />
                <Route path="*" component={NotFound} />
              </Switch>
            )}
            {!this.context.storageId && Boolean(this.context.userId) && (
              <div
                className="pageData"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <h1
                  style={{
                    color: "#000",
                    fontSize: "3rem",
                    marginBottom: "15px",
                  }}
                >
                  Loading...
                </h1>
                <p style={{ fontSize: "1.2rem" }}>
                  Check your internet connection or VPN setup
                </p>
                <CircularProgress
                  style={{ color: "#000", marginTop: "15px" }}
                />
              </div>
            )}
          </StyledMain>
        )}
      </ThemeProvider>
    );
  }
}

export default withRouter(App);
