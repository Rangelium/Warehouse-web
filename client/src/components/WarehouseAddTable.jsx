import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "./GlobalDataProvider";
import uuid from "react-uuid";
import api from "../tools/connect";

import WarehouseAddForm from "./WarehouseAddForm";

import { CustomButton } from "./UtilComponents";
import {
  IconButton,
  Paper,
  Collapse,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";

// Icons
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

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

class Row extends Component {
  static contextType = GlobalDataContext;
  state = {
    infoTable: false,
    productsTableData: [],
    loading: false,

    showForm: false,
    dataForFill: [],
  };

  handleExpandRowClick() {
    this.setState(
      (prevState) => {
        return {
          infoTable: !prevState.infoTable,
          loading: !prevState.infoTable,
        };
      },
      () => {
        if (this.state.infoTable) {
          api
            .executeProcedure("[SalaryDB].procurement.[get_order_req_data]", {
              ord_numb: this.props.row.ord_numb,
              emp_version: this.props.row.emp_id,
            })
            .then((res) => {
              this.setState({
                productsTableData: res,
                infoTable: true,
                loading: false,
              });
            })
            .catch((err) => console.error(err.errText));
        }
      }
    );
  }

  render() {
    const data = this.props.row;

    return (
      <>
        <TableRow>
          <TableCell style={{ borderBottom: "unset" }}>
            <IconButton size="small" onClick={this.handleExpandRowClick.bind(this)}>
              {this.state.infoTable ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>

          <TableCell style={{ borderBottom: "unset" }} align="center">
            {data.products_quantity}
          </TableCell>
          <TableCell style={{ borderBottom: "unset" }} align="center">
            {data.create_date_time}
          </TableCell>
          <TableCell style={{ borderBottom: "unset" }} align="center">
            <CustomButton
              onClick={() => {
                api
                  .executeProcedure("[SalaryDB].procurement.[get_order_req_data]", {
                    ord_numb: this.props.row.ord_numb,
                    emp_version: this.props.row.emp_id,
                  })
                  .then((dataForFill) => {
                    this.setState({
                      dataForFill,
                      showForm: true,
                    });
                  })
                  .catch((err) => console.error(err.errText));
              }}
            >
              Təstiq et
            </CustomButton>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
            <Collapse in={this.state.infoTable} timeout="auto" unmountOnExit>
              <Paper style={{ padding: "10px 0", position: "relative" }} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Məhsul</TableCell>
                      <TableCell align="center">Kəmiyyət</TableCell>
                      <TableCell align="center">Kurasiya</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.productsTableData.map((product) => (
                      <TableRow key={uuid()}>
                        <TableCell align="center">{product.title}</TableCell>
                        <TableCell align="center">{product.amount}</TableCell>
                        <TableCell align="center">{product.department_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

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
              </Paper>
            </Collapse>
          </TableCell>
        </TableRow>

        {this.state.showForm && (
          <WarehouseAddForm
            open={true}
            close={() => {
              this.setState({
                showForm: false,
              });
            }}
            dataForFill={this.state.dataForFill}
            refresh={this.props.refresh}
            orderId={data.id}
          />
        )}
      </>
    );
  }
}

export default class WarehouseAddTable extends Component {
  render() {
    return (
      <StyledTableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="center">Məhsulların Kəmiyyəti</TableCell>
              <TableCell align="center">Tarix</TableCell>
              <TableCell align="center">Tesdiq</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.tableData.map((el) => (
              <Row refresh={this.props.refresh} key={uuid()} row={el} />
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    );
  }
}
