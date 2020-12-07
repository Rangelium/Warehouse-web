import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import { CustomTextInput, CustomButton } from "../../components/UtilComponents";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";

// Icons
import RemoveIcon from "@material-ui/icons/Remove";

export default class InventoryNewSessionForm extends Component {
  static contextType = GlobalDataContext;
  state = {
    sessionId: null,
    givenTableData: [],
    tableInputs: null,
  };

  async componentDidMount() {
    const sessionId = await api
      .executeProcedure("[SalaryDB].anbar.[inventory_session_create]", {
        storage_id: this.context.storageId,
      })
      .then((res) => res[0].session_id)
      .catch((err) => {
        console.log(err.errText);
        this.props.close();
      });

    const givenTableData = await api
      .executeProcedure("[SalaryDB].anbar.[inventory_select_products]", {
        storage_id: this.context.storageId,
      })
      .catch((err) => {
        console.log(err.errText);
        return [];
      });

    this.setState({
      sessionId,
      givenTableData,
      tableInputs: this.createTableInputs(givenTableData),
    });
  }
  handleChange(e) {
    this.setState({
      tableInputs: {
        ...this.state.tableInputs,
        [e.target.name]: e.target.value,
      },
    });
  }
  async createSession(e) {
    e.preventDefault();

    if (!this.state.givenTableData.length) {
      this.context.error("No info");
      return;
    }

    let isSuccess = true;
    const data = this.state.givenTableData;
    for (let i = 0; i < data.length; i++) {
      if (!isSuccess) return;

      isSuccess = await api
        .executeProcedure("[SalaryDB].anbar.[inventory_session_info_insert]", {
          inventory_session_id: this.state.sessionId,
          quantity_real: this.state.tableInputs[`quantity${i}`],
          quantity_inDB: data[i].quantity_inDB,
          quantity_difference:
            parseInt(this.state.tableInputs[`quantity${i}`]) -
            parseInt(data[i].quantity_inDB),
          price_difference:
            (parseInt(this.state.tableInputs[`quantity${i}`]) -
              parseInt(data[i].quantity_inDB)) *
            parseFloat(data[i].avg_price_for_1),
          avg_price: data[i].avg_price_for_1,
          product_id: data[i].product_id,
          storage_id: this.context.storageId,
          currency_id: data[i].currency_id,
        })
        .then(() => true)
        .catch((err) => {
          this.context.error(err.errText);
          return false;
        });
    }

    this.props.refresh();
    this.context.success(`Created`);
    this.props.close();
  }
  createTableInputs(arr) {
    let obj = {};

    arr.forEach((el, i) => {
      obj = {
        [`quantity${i}`]: "",
        ...obj,
      };
    });

    return obj;
  }
  handleClose() {
    this.props.close();
    api.executeProcedure("[SalaryDB].anbar.[inventory_session_delete_onPopupClose]", {
      inventory_session_id: this.state.sessionId,
    });
  }

  render() {
    return (
      <StyledDialog
        style={{ zIndex: 2 }}
        open={this.props.open}
        onClose={this.handleClose.bind(this)}
      >
        <form autoComplete="off" onSubmit={this.createSession.bind(this)}>
          <DialogTitle>Yeni sessiya yarat</DialogTitle>

          <DialogContent>
            <StyledTableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Məhsul</TableCell>
                    <TableCell align="center">Anbardaki miqdar</TableCell>
                    <TableCell align="center">Orta qiymət</TableCell>
                    <TableCell align="center">Həqiqi miqdar</TableCell>
                    <TableCell align="center">Fərq</TableCell>
                    <TableCell align="center">Qiymət fərqi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.givenTableData.map(
                    (
                      {
                        title,
                        quantity_inDB,
                        avg_price_for_1,
                        unit_title,
                        currency_title,
                      },
                      i
                    ) => (
                      <TableRow key={`${title}${i}`}>
                        <TableCell align="center">{title}</TableCell>
                        <TableCell align="center">{`${quantity_inDB} ${unit_title}`}</TableCell>
                        <TableCell align="center">
                          {`${parseFloat(avg_price_for_1).toFixed(2)} ${currency_title}`}
                        </TableCell>
                        <TableCell align="center">
                          <CustomTextInput
                            required
                            style={{ width: 120 }}
                            type="number"
                            InputProps={{
                              inputProps: { min: 0 },
                            }}
                            name={`quantity${i}`}
                            value={this.state.tableInputs[`quantity${i}`]}
                            onChange={this.handleChange.bind(this)}
                          />
                        </TableCell>
                        <TableCell
                          style={{
                            color:
                              parseInt(this.state.tableInputs[`quantity${i}`]) -
                                parseInt(quantity_inDB) >
                              0
                                ? "green"
                                : "red",
                          }}
                          align="center"
                        >
                          {this.state.tableInputs[`quantity${i}`] ? (
                            `${
                              parseInt(this.state.tableInputs[`quantity${i}`]) -
                              parseInt(quantity_inDB)
                            } ${unit_title}`
                          ) : (
                            <RemoveIcon style={{ color: "rgba(0, 0, 0, 0.87)" }} />
                          )}
                        </TableCell>
                        <TableCell
                          style={{
                            color:
                              parseInt(this.state.tableInputs[`quantity${i}`]) -
                                parseInt(quantity_inDB) >
                              0
                                ? "green"
                                : "red",
                          }}
                          align="center"
                        >
                          {this.state.tableInputs[`quantity${i}`] ? (
                            `${(
                              (parseInt(this.state.tableInputs[`quantity${i}`]) -
                                parseInt(quantity_inDB)) *
                              parseFloat(avg_price_for_1)
                            ).toFixed(2)} ${currency_title}`
                          ) : (
                            <RemoveIcon style={{ color: "rgba(0, 0, 0, 0.87)" }} />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </DialogContent>

          <DialogActions>
            <CustomButton onClick={this.handleClose.bind(this)}>İmtına</CustomButton>
            <div className="gap" style={{ flexGrow: 1 }}></div>
            <CustomButton disabled={!this.state.givenTableData.length} type="submit">
              Yarat
            </CustomButton>
          </DialogActions>
        </form>
      </StyledDialog>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    max-width: unset;

    form {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .MuiDialogTitle-root {
    background-color: #f5f5f5;

    .MuiTypography-root {
      font-size: 1.6rem;
    }
  }

  .MuiDialogContent-root {
    display: flex;
    flex-grow: 1;
    padding: 0;
    max-height: 400px;
  }

  .MuiDialogActions-root {
    padding: 8px 24px;
    justify-content: flex-start;
  }
`;
const StyledTableContainer = styled(TableContainer)`
  overflow-y: auto;
  height: 100%;

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
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
`;
