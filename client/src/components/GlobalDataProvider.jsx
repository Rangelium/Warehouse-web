import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import jwtDecode from "jwt-decode";
import axios from "axios";
import dayjs from "dayjs";
import { AlertDialogContext } from "./AlertDialog/AlertDialogContext";

export const GlobalDataContext = React.createContext();

export class GlobalDataProvider extends React.Component {
  static contextType = AlertDialogContext;
  state = {
    theme: {
      primary: "#000000",
    },
    storageId: null,
    storageTitle: "",
    userStructureId: null,
    userId: null,
    userData: null,
    token: null,

    baseURL: axios.defaults.baseURL,

    success: this.showSuccess,
    error: this.showError,
    setStorage: (a, b) => this.setStorage(a, b),
    setToken: (a) => this.setToken(a),
    alert: (data) => this.context.alert(data),
  };

  showSuccess(msg) {
    toast.success(msg, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
  showError(msg) {
    toast.error(msg, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  setStorage(id, title) {
    this.setState({
      storageId: id,
      storageTitle: title,
    });
  }
  setToken(token) {
    if (token === null) {
      this.setState({
        userId: null,
        userData: null,
        token: null,
      });

      localStorage.removeItem("warehouseAccessToken");
      axios.defaults.headers.common["Authorization"] = "";
      return;
    }
    const userData = jwtDecode(token);
    // console.log(userData)
    if (userData) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      this.setState({
        userId: userData.data.id,
        userData: userData.data,
        userStructureId: userData.data.structureid,
        token,
      });

      if (!localStorage.getItem("warehouseAccessToken")) {
        localStorage.setItem(
          "warehouseAccessToken",
          JSON.stringify({
            token,
            timestamp: dayjs().unix(),
          })
        );
      }
    }
  }

  render() {
    return (
      <>
        <GlobalDataContext.Provider value={this.state}>
          {this.props.children}
          <StyledToastContainer
            style={{
              zIndex: 100000000000000,
            }}
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </GlobalDataContext.Provider>
      </>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledToastContainer = styled(ToastContainer)`
  width: fit-content;
  min-width: 320px;
  max-width: 400px;

  .Toastify__toast--success {
    background-color: #167a16;
    color: #f3ffe9;
    height: 30px;

    .Toastify__progress-bar {
      background-color: #a8aaa5;
    }
  }
  .Toastify__toast--error {
    background-color: #c41b1b;
    color: #f3ffe9;
    height: 30px;

    .Toastify__progress-bar {
      background-color: #a8aaa5;
    }
  }
`;
