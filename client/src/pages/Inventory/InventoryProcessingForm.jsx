import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import { CustomButton } from "../../components/UtilComponents";
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

export default class InventoryProcessingForm extends Component {
  static contextType = GlobalDataContext;

  async createSession(e) {
    e.preventDefault();

    let isSuccess = true;
    const data = this.props.tableData;
    for (let i = 0; i < data.length; i++) {
      if (!isSuccess) break;

      isSuccess = await api
        .executeProcedure("[SalaryDB].anbar.[inventory_fix_in]", {
          cluster_id: 1,
          product_cell: "",
          currency_id: data[i].currency_id,
          row_id: data[i].id,
          barcode: data[i].barcode,
          storage_id: this.context.storageId,
          product_id: data[i].product_id,
          quantity: data[i].quantity_difference,
          unit_price: data[i].unit_price,
          price_difference: data[i].price_difference,
        })
        .then(() => true)
        .catch((err) => {
          this.context.error(err.errText);
          return false;
        });
    }

    if (!isSuccess) return;
    this.props.refresh();
    this.context.success(`Processing complete`);
    this.props.close();
  }

  render() {
    return (
      <StyledDialog
        style={{ zIndex: 2 }}
        open={this.props.open}
        onClose={this.props.close}
      >
        <form autoComplete="off" onSubmit={this.createSession.bind(this)}>
          <DialogTitle>Malların daxil edilməsi</DialogTitle>

          <DialogContent>
            <StyledTableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Məhsul</TableCell>
                    <TableCell align="center">Vahid qiymət</TableCell>
                    <TableCell align="center">Miqdar fərqi</TableCell>
                    <TableCell align="center">Qiymət fərqi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.props.tableData.map((el, i) => (
                    <TableRow key={uuid()}>
                      <TableCell align="center">{el.product_title}</TableCell>
                      <TableCell align="center">{`${parseFloat(
                        el.unit_price
                      ).toFixed(2)} ${el.currency_title}`}</TableCell>
                      <TableCell align="center">
                        {el.quantity_difference}
                      </TableCell>
                      <TableCell align="center">{`${parseFloat(
                        el.price_difference
                      ).toFixed(2)} ${el.currency_title}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </DialogContent>

          <DialogActions>
            <CustomButton onClick={this.props.close}>İmtına</CustomButton>
            <div className="gap" style={{ flexGrow: 1 }}></div>
            <CustomButton
              type="submit"
              disabled={!Boolean(this.props.tableData.length)}
            >
              Daxil et
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
    padding: 8px 12px;
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
