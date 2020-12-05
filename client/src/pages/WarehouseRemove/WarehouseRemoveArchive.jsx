import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import dayjs from "dayjs";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

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
import DescriptionIcon from "@material-ui/icons/Description";
import NoSimIcon from "@material-ui/icons/NoSim";

export default class WarehouseRemoveArchive extends Component {
  static contextType = GlobalDataContext;

  render() {
    return (
      <StyledTableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">Məhsull</TableCell>
              <TableCell align="center">Barkod</TableCell>
              <TableCell align="center">Kəmiyyət</TableCell>
              <TableCell align="center">Qiymət</TableCell>
              <TableCell align="center">Ümumi Qiymət</TableCell>
              <TableCell align="center">Hüceyrə nömrəsi</TableCell>
              <TableCell align="center">Yararlıq müddəti</TableCell>
              <TableCell align="center">Creation müddəti</TableCell>
              <TableCell align="center">File</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.tableData.map((el) => (
              <TableRow key={uuid()}>
                <TableCell align="center">{el.product_title}</TableCell>
                <TableCell align="center">{el.barcode}</TableCell>
                <TableCell align="center">{`${el.quantity} ${el.unit_title}`}</TableCell>
                <TableCell align="center">{`${el.price} ${el.currency_title}`}</TableCell>
                <TableCell align="center">{`${el.sum_price} ${el.currency_title}`}</TableCell>
                <TableCell align="center">{el.product_cell}</TableCell>
                <TableCell align="center">
                  {dayjs(el.exp_date).format("YYYY-MM-DD")}
                </TableCell>
                <TableCell align="center">
                  {dayjs(el.inserted_date).format("YYYY-MM-DD")}
                </TableCell>
                <TableCell align="center">
                  {Boolean(el.document_num_path) ? (
                    <IconButton
                      title="Download file"
                      onClick={() =>
                        api
                          .downloadFile(el.document_num_path)
                          .then((res) => {
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute(
                              "download",
                              `AttachedFile.${res.data.type.split("/")[1]}`
                            );
                            document.body.appendChild(link);
                            link.click();
                          })
                          .catch((err) => this.context.error(err.error))
                      }
                    >
                      <DescriptionIcon style={{ color: "#ffaa00" }} />
                    </IconButton>
                  ) : (
                    <NoSimIcon title="No file attached" style={{ color: "#ffaa00" }} />
                  )}
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
