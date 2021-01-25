import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../../components/GlobalDataProvider";
import api from "../../../tools/connect";

import NewOrderForm from "./NewOrderForm";
import {
  CustomButton,
  CustomSelect,
  CustomSelectItem,
  CustomTextInput,
} from "../../../components/UtilComponents";
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
  IconButton,
} from "@material-ui/core";

// Icons
import DeleteIcon from "@material-ui/icons/Delete";

export default class OrderForm extends Component {
  static contextType = GlobalDataContext;
  constructor(props) {
    super(props);
    this.state = {
      vendorsData: [],
      // vendorId: null,

      productInput: "",
      productsData: [],
      selectedProductData: null,

      orderTableData: [],

      activeStep: 1, //Initially 0
      loading: true,
    };
  }

  componentDidMount() {
    this.prepareForm();
  }
  async prepareForm() {
    const vendorsData = await api
      .executeProcedure("[SalaryDB].anbar.[order_list_select_techizatci]")
      .catch((err) => console.log(err.errText));

    this.setState({
      vendorsData,
      vendorId: null,

      productInput: "",
      productsData: [],
      selectedProductData: null,

      orderTableData: [],

      activeStep: 1,
      loading: false,
    });
  }
  handleClose() {
    this.props.close();
    this.setState({
      vendorId: null,

      productInput: "",
      productsData: [],
      selectedProductData: null,

      orderTableData: [],

      activeStep: 1,
    });
  }
  handleProductChange(e) {
    const value = e.target.value;
    if (isNaN(value)) {
      api
        .executeProcedure("[SalaryDB].anbar.[order_list_search_product]", {
          title: value,
          techizatci_id: this.props.vendorId,
        })
        .then((productsData) => {
          this.setState({
            productsData,
          });
        })
        .catch((err) => console.log(err.errText));
    } else {
      api
        .executeProcedure("[SalaryDB].anbar.[order_list_search_product]", {
          barcode: parseInt(value),
          techizatci_id: this.props.vendorId,
        })
        .then((productsData) => {
          this.setState({
            productsData,
          });
        })
        .catch((err) => console.log(err.errText));
    }

    this.setState({
      productInput: value,
    });
  }
  handleVendorChange(e) {
    const vendorId = e.target.value;
    this.setState({
      vendorId,
      activeStep: 1,

      orderTableData: [],

      productInput: "",
      productsData: [],
      selectedProductData: null,
    });
  }
  addNewOrder(orderData) {
    this.setState((prevState) => {
      return {
        orderTableData: [...prevState.orderTableData, orderData],
      };
    });
  }
  removeOrder(key) {
    this.setState((prevState) => {
      return {
        orderTableData: prevState.orderTableData.filter((el) => el.key !== key),
      };
    });
  }
  async handleSubmit(e) {
    e.preventDefault();

    if (!this.state.orderTableData.length) {
      return this.context.error("No orders created");
    }

    const mats = this.state.orderTableData.map(
      ({ id, orderAmount, sub_gl_category_id, setting_price, reason }) => {
        return [
          id,
          orderAmount,
          parseFloat((orderAmount * parseFloat(setting_price)).toFixed(3)),
          reason,
          sub_gl_category_id,
        ];
      }
    );
    const data = {
      mats,
      empid: this.context.userId,
      ordNumb: "",
      orderType: 0,
      structureid: 0,
      direct: 1,
      basedon: this.props.vendorData.join(","),
    };

    api
      .createNewOrder(data)
      .then((res) => {
        if (res.data[0].error) {
          this.context.error(res.data[0].error);
        } else {
          this.props.close();
        }
      })
      .catch((err) => this.context.error(err.errText));
  }

  render() {
    return (
      <StyledDialog
        active={this.state.activeStep}
        style={{ zIndex: 21 }}
        open={this.props.open}
        onClose={this.handleClose.bind(this)}
      >
        <form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
          <DialogTitle>Malların sifarişi</DialogTitle>

          {!this.state.loading && (
            <StyledContent active_products={this.state.productsData.length}>
              <CustomSelect
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                required
                disabled
                label="Teçhizat"
                name="vendorId"
                value={this.props.vendorId ?? ""}
                onChange={this.handleVendorChange.bind(this)}
              >
                {this.state.vendorsData.map(({ id, name }) => (
                  <CustomSelectItem key={id} value={id}>
                    {name}
                  </CustomSelectItem>
                ))}
              </CustomSelect>

              <div className="selectProduct">
                <CustomTextInput
                  value={this.state.productInput}
                  placeholder={"Product name:"}
                  onChange={this.handleProductChange.bind(this)}
                />
                <div className="foundProducts">
                  {this.state.productsData.map((selectedProductData) => (
                    <p
                      key={selectedProductData.product_id}
                      onClick={() => {
                        this.setState({
                          productInput: "",
                          selectedProductData,
                        });
                      }}
                    >
                      {selectedProductData.title}
                    </p>
                  ))}
                </div>
              </div>

              <StyledTableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Məhsul</TableCell>
                      <TableCell align="center">Amount</TableCell>
                      <TableCell align="center">Total price</TableCell>
                      <TableCell align="center">Comment</TableCell>
                      <TableCell align="center" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.orderTableData.map(
                      ({
                        key,
                        title,
                        setting_price,
                        currency_title,
                        orderAmount,
                        reason,
                      }) => (
                        <TableRow key={key}>
                          <TableCell align="center">{title}</TableCell>
                          <TableCell align="center">{orderAmount}</TableCell>
                          <TableCell align="center">{`${(
                            parseFloat(setting_price) * orderAmount
                          ).toFixed(3)} ${currency_title}`}</TableCell>
                          <TableCell align="center">{reason}</TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => this.removeOrder(key)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </StyledContent>
          )}
          <DialogActions>
            <Divider />
            <CustomButton onClick={this.handleClose.bind(this)}>İmtına</CustomButton>
            <div className="gap" style={{ flexGrow: 1 }}></div>
            <CustomButton type="submit">Sifariş et</CustomButton>
          </DialogActions>
        </form>

        <NewOrderForm
          open={Boolean(this.state.selectedProductData)}
          close={() => {
            this.setState({ selectedProductData: null });
          }}
          data={this.state.selectedProductData}
          addOrder={this.addNewOrder.bind(this)}
        />
      </StyledDialog>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledDialog = styled(Dialog)`
  .MuiDialog-container > .MuiPaper-root {
    height: ${(props) => (props.active === 0 ? "200px" : "800px")};
    max-width: unset;
    width: 650px;
    transition: height 0.4s;

    form {
      width: 100%;
      height: 100%;

      display: grid;
      grid-template-columns: 100%;
      grid-template-rows: 70px 1fr auto;

      .MuiDialogContent-root {
        > div:not(:first-child) {
          display: ${(props) => (props.active > 0 ? "block" : "none")};
        }
      }
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
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto 1fr;
  gap: 5px;

  .MuiFormControl-root {
    width: 100%;
  }

  .selectProduct {
    position: relative;

    &:hover .foundProducts {
      opacity: ${(props) => (props.active_products ? 1 : 0)};
      pointer-events: ${(props) => (props.active_products ? "all" : "none")};
    }

    .foundProducts {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(100% - 2px);
      max-height: 240px;
      border: 1px solid rgba(0, 0, 0, 0.23);
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      z-index: 10;
      backdrop-filter: blur(5px);

      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;

      overflow-y: auto;
      overflow-x: hidden;

      &:hover {
        opacity: ${(props) => (props.active_products ? 1 : 0)};
        pointer-events: ${(props) => (props.active_products ? "all" : "none")};
      }

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

      p {
        width: 100%;
        padding: 15px;
        cursor: pointer;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.7);
        transition: transform 0.3s, color 0.3s, background-color 0.3s;

        &:hover {
          background-color: rgba(0, 0, 0, 0.2);
          /* transform: scale(1.03); */
          color: #000;
        }
      }
    }
  }
`;
const StyledTableContainer = styled(TableContainer)`
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 4px;
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
