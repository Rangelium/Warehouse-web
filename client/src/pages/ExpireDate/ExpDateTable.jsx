import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import dayjs from "dayjs";
import api from "../../tools/connect";
import { GlobalDataContext } from "../../components/GlobalDataProvider";

import {
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";

export default class ExpDateOverTable extends Component {
  static contextType = GlobalDataContext;

  handleClick(data) {
    this.context
      .alert({
        title: "Təstiq",
        description: `Silmək istədiyinizə əminsiniz? ${data.product_title}`,
      })
      .then(() => {
        api
          .executeProcedure("anbar.exp_date_over_decommission_product", {
            document_id: data.document_id,
            left: data.left,
            storage_id: this.context.storageId
          })
          .then((res) => {
            this.props.refresh();
            this.context.success(`${data.product_title} silindi!`);
          })
          .catch((err) => {
            this.context.error(err.errText);
          });
      });
  }

  render() {
    return (
      <StyledTableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">Məhsul</TableCell>
              <TableCell align="center">Barkod</TableCell>
              <TableCell align="center">Miqdar</TableCell>
              <TableCell align="center">Qiymət</TableCell>
              <TableCell align="center">Ümumi qiymət</TableCell>
              {/* <TableCell align="center">İstehsalçı</TableCell> */}
              <TableCell align="center">Hücrə №</TableCell>
              <TableCell align="center">Yararlılıq müddəti</TableCell>
              <TableCell align="center" />
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.tableData.map((el) => (
              <TableRow key={uuid()}>
                <TableCell align="center">{el.product_title}</TableCell>
                <TableCell align="center">{el.barcode}</TableCell>
                <TableCell align="center">{`${el.left} ${el.unit_title}`}</TableCell>
                <TableCell align="center">{`${el.price} ${el.currency_title}`}</TableCell>
                <TableCell align="center">{`${el.sum_price} ${el.currency_title}`}</TableCell>
                {/* <TableCell align="center">{el.manufacturer_title}</TableCell> */}
                <TableCell align="center">{el.product_cell}</TableCell>
                <TableCell align="center">
                  {dayjs(el.exp_date).format("MM.DD.YYYY")}
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    onClick={() => this.handleClick(el)}
                  >
                    silin
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
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
