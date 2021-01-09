import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import dayjs from "dayjs";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import InvNumbers from "../../components/InvNumbers";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from "@material-ui/core";

// Icons
import RemoveIcon from "@material-ui/icons/Remove";
import AssignmentIcon from "@material-ui/icons/Assignment";

export default class WarehouseAddArchive extends Component {
  static contextType = GlobalDataContext;
  state = {
    invNums: [],
  };

  showInvNums(docId, isOut) {
    api
      .executeProcedure(
        "[SalaryDB].anbar.[batch_inventory_numbers_select_for_one_party]",
        { document_id: docId, is_out: isOut }
      )
      .then((res) => {
        if (!res.length) this.context.error("No inventory numbers");

        this.setState({
          invNums: res.map((el) => {
            return { ...el, key: uuid() };
          }),
        });
      })
      .catch((err) => console.log(err.errText));
  }

  render() {
    return (
      <>
        <StyledTableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">Yaradılış tarixi</TableCell>
                <TableCell align="center">Məhsul</TableCell>
                <TableCell align="center">Barkod</TableCell>
                <TableCell align="center">Miqdar</TableCell>
                <TableCell align="center">Qiymət</TableCell>
                <TableCell align="center">Ümumi Qiymət</TableCell>
                <TableCell align="center">Hücrə nömrəsi</TableCell>
                <TableCell align="center">Yararlıq müddəti</TableCell>
                <TableCell align="center">Kontragent</TableCell>
                <TableCell align="center">Akt №</TableCell>
                <TableCell align="center">Hesab-faktura №</TableCell>
                <TableCell align="center">Inventar №</TableCell>
                <TableCell align="center">Müqavilə №</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.tableData.map((el) => (
                <TableRow key={uuid()}>
                  <TableCell align="center">
                    {dayjs(el.inserted_date).format("YYYY-MM-DD")}
                  </TableCell>
                  <TableCell align="center">{el.product_title}</TableCell>
                  <TableCell align="center">
                    {el.barcode ? el.barcode : <RemoveIcon />}
                  </TableCell>
                  <TableCell align="center">{`${el.quantity} ${el.unit_title}`}</TableCell>
                  <TableCell align="center">{`${el.price} ${el.currency_title}`}</TableCell>
                  <TableCell align="center">{`${el.sum_price} ${el.currency_title}`}</TableCell>
                  <TableCell align="center">{el.product_cell}</TableCell>
                  <TableCell align="center">
                    {dayjs(el.exp_date).format("YYYY-MM-DD")}
                  </TableCell>
                  <TableCell align="center">{el.vendor_name}</TableCell>
                  <TableCell align="center">{el.akt_num}</TableCell>
                  <TableCell align="center">{el.invoice_num}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => this.showInvNums(el.document_id, el.is_out)}
                    >
                      <AssignmentIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">{el.contract_num}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>

        <InvNumbers
          invNums={this.state.invNums}
          open={Boolean(this.state.invNums.length)}
          close={() => this.setState({ invNums: [] })}
        />
      </>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

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
