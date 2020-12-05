import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import { CustomButton, CustomTextInput } from "../../components/UtilComponents";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";

export default class ProductAuthForm extends Component {
  static contextType = GlobalDataContext;
  state = {
    tableData: [],
    loading: true,
  };

  async componentDidMount() {
    const tableData = await this.prepareTableData();

    this.setState({
      tableData,
      loading: false,
    });
  }
  handleChange(e, i) {
    let tableData = [...this.state.tableData];
    tableData = tableData.map((el, index) => {
      if (index === i) {
        return {
          ...el,
          [e.target.name]: e.target.value,
        };
      } else {
        return el;
      }
    });

    this.setState({
      tableData,
    });
  }
  async handleSubmit(e) {
    e.preventDefault();
    const mats = this.state.tableData.map(
      ({ id, comment, neededAmount, approx_price, sub_category_id }) => {
        return [id, neededAmount, approx_price * neededAmount, comment, sub_category_id];
      }
    );
    const data = {
      mats,
      empid: this.context.userId,
      ordNumb: "",
      orderType: 0,
      structureid: 0,
      direct: 1,
    };

    api
      .createNewOrder(data)
      .then((res) => {
        this.props.handleSubmit(e, true);
        console.log(res);
        this.props.close();
      })
      .catch((err) => this.context.error(err.errText));
  }
  async prepareTableData() {
    let arr = [];

    for (let i = 0; i < this.props.neededData.length; i++) {
      if (this.props.neededData[i].amount !== this.props.selectedAmounts[i]) {
        const data = await api
          .executeProcedure("[SalaryDB].anbar.[order_list_search_product]", {
            product_id: this.props.neededData[i].product_id,
          })
          .then((res) => res[0])
          .catch((err) => {
            console.log(err);
            return {};
          });
        arr.push({
          neededAmount: this.props.neededData[i].amount - this.props.selectedAmounts[i],
          comment: "",
          ...data,
        });
      }
    }

    return arr;
  }

  render() {
    if (this.state.loading) return null;

    return (
      <StyledDialog
        style={{ zIndex: 21 }}
        open={this.props.open}
        onClose={this.props.close}
      >
        <form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
          <DialogTitle>Malların sifarişi</DialogTitle>

          <StyledContent>
            <StyledTableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Məhsul</TableCell>
                    <TableCell align="center">Qiymət</TableCell>
                    <TableCell align="center">Lazım Kəmiyyət</TableCell>
                    <TableCell align="center">Comment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.tableData.map((row, i) => (
                    <TableRow key={row.product_id}>
                      <TableCell align="center">{row.title}</TableCell>
                      <TableCell align="center">{`${row.setting_price} ${row.currency_title}`}</TableCell>
                      <TableCell align="center">{row.neededAmount}</TableCell>
                      <TableCell align="center">
                        <CustomTextInput
                          placeholder="Your comment..."
                          name="comment"
                          value={this.state.tableData[i].comment}
                          onChange={(e) => this.handleChange(e, i)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </StyledContent>

          <DialogActions>
            <Divider />
            <CustomButton onClick={this.props.close}>Close</CustomButton>
            <div className="gap" style={{ flexGrow: 1 }}></div>
            <CustomButton type="submit">Sifariş</CustomButton>
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
  .MuiDialog-container > .MuiPaper-root {
    height: 100%;
    max-width: unset;

    form {
      width: 100%;
      height: 100%;

      display: grid;
      grid-template-columns: 100%;
      grid-template-rows: 70px 1fr auto;
    }
  }

  .MuiDialogTitle-root {
    background-color: #f5f5f5;

    .MuiTypography-root {
      font-size: 1.6rem;
    }
  }

  .MuiDialogActions-root {
    padding: 8px;
    position: relative;

    hr {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
  }
`;
const StyledContent = styled(DialogContent)`
  padding: 0;
`;
const StyledTableContainer = styled(TableContainer)`
  border: 1px solid rgba(224, 224, 224, 1);
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
