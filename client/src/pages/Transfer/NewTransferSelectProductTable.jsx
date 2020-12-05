import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import { CustomTextInput } from "../../components/UtilComponents";

import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";

// Icons
import RemoveIcon from "@material-ui/icons/Remove";

export default class NewTransferSelectProductTable extends Component {
  static contextType = GlobalDataContext;
  state = {
    productSearch: "",
    searchResult: [],
    selectedRow: null,
  };

  componentDidMount() {
    api
      .executeProcedure("[SalaryDB].anbar.[transfer_products_search]", {
        title: "",
        storage_id: this.context.storageId,
      })
      .then((data) => {
        this.setState({
          searchResult: data,
        });
      });
  }
  handleSearchChange(e) {
    const val = e.target.value;
    // if (val !== "") {
    if (isNaN(val)) {
      api
        .executeProcedure("[SalaryDB].anbar.[transfer_products_search]", {
          title: val,
          storage_id: this.context.storageId,
        })
        .then((data) => {
          this.setState({
            searchResult: data,
          });
        });
    } else {
      api
        .executeProcedure("[SalaryDB].anbar.[transfer_products_search]", {
          barcode: val,
          storage_id: this.context.storageId,
        })
        .then((data) => {
          this.setState({
            searchResult: data,
          });
        });
    }
    // }

    this.setState({
      productSearch: val,
      // searchResult: [],
    });
  }

  render() {
    return (
      <StyledSection active={this.props.active}>
        <CustomTextInput
          style={{ width: "100%" }}
          label="Search product by name or barcode"
          name="productSearch"
          value={this.state.productSearch}
          onChange={this.handleSearchChange.bind(this)}
        />
        <div className="table">
          <StyledTableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Məhsul</TableCell>
                  <TableCell align="center">Barkod</TableCell>
                  <TableCell align="center">K-yət</TableCell>
                  <TableCell align="center">Qiymət</TableCell>
                  <TableCell align="center">Hüceyrə nömrəsi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.searchResult.map((row, i) => (
                  <TableRow
                    style={{ cursor: "pointer" }}
                    selected={this.state.selectedRow === i}
                    hover
                    onClick={() => {
                      this.props.selectProduct(row);
                      this.setState({
                        selectedRow: i,
                      });
                    }}
                    key={uuid()}
                  >
                    <TableCell align="center">{row.product_title}</TableCell>
                    <TableCell align="center">
                      {row.barcode !== null ? row.barcode : <RemoveIcon />}
                    </TableCell>
                    <TableCell align="center">
                      {row.left !== null ? (
                        `${row.left} ${row.unit_title}`
                      ) : (
                        <RemoveIcon />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {row.unit_price !== null ? (
                        `${row.unit_price} ${row.currency_title}`
                      ) : (
                        <RemoveIcon />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {row.product_cell !== null ? row.product_cell : <RemoveIcon />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </div>
      </StyledSection>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledSection = styled.div`
  flex-grow: 1;
  display: ${(props) => (props.active ? "flex" : "none")};
  flex-direction: column;

  .table {
    height: 1px;
    flex-grow: 1;
    border-left: 1px solid rgba(224, 224, 224, 1);
    border-right: 1px solid rgba(224, 224, 224, 1);
    border-bottom: 1px solid rgba(224, 224, 224, 1);
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
