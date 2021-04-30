import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import dayjs from "dayjs";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import TransferProductForm from "./InventoryWriteOffTransferForm";
import { CustomButton } from "../../components/UtilComponents";
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";

// Icons
import DoubleArrowOutlinedIcon from "@material-ui/icons/DoubleArrowOutlined";
import RemoveIcon from "@material-ui/icons/Remove";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";

export default class InventoryWriteOffForm extends Component {
  static contextType = GlobalDataContext;
  state = {
    activeStep: 0,
    loading: true,

    existingProducts: [],
    forOrderProducts: [],
    orderProdInvNums: [],

    selectedAmounts: Array(this.props.data.length).fill(0),
    selectedProduct: null,

    showProductAuthForm: false,
  };

  async componentDidMount() {
    await this.getProductData(this.props.data[this.state.activeStep].product_title);

    this.setState({
      loading: false,
    });
  }
  async getProductData(productTitle) {
    const existingProducts = await api
      .executeProcedure("[SalaryDB].anbar.[transfer_products_search]", {
        storage_id: this.context.storageId,
        title: productTitle,
      })
      .catch((err) => {
        console.error(err.errText);
        return [];
      });

    const forOrderProducts = await api
      .executeProcedure(
        "[SalaryDB].anbar.[inventory_session_fix_out_inner_info_selection]",
        {
          inventory_session_id: this.props.inventoryId,
          product_num: this.state.activeStep,
        }
      )
      .catch((err) => {
        console.error(err.errText);
        return [];
      });

    let selectedAmount = 0;
    forOrderProducts.forEach((product) => {
      if (
        product.product_title === this.props.data[this.state.activeStep].product_title
      ) {
        selectedAmount += product.quantity;
      }
    });

    this.setState(
      (prevState) => {
        return {
          existingProducts,
          forOrderProducts,
          selectedAmounts: prevState.selectedAmounts.map((el, i) =>
            i === prevState.activeStep ? selectedAmount : el
          ),
        };
      },
      () => {
        return;
      }
    );
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  async handleSubmit(e) {
    e.preventDefault();

    for (let i = 0; i < this.state.selectedAmounts.length; i++) {
      if (
        this.state.selectedAmounts[i] !== parseInt(this.props.data[i].quantity_difference)
      ) {
        this.setState({
          showProductAuthForm: true,
        });

        this.context.error("Not enough products selected");
        return;
      }
    }

    // Finish
    api
      .executeProcedure("[SalaryDB].anbar.[inventory_session_fix_out_complete]", {
        inventory_session_id: this.props.inventoryId,
      })
      .then(() => {
        console.log("Order complete. Preparing inv nums...")
        let InvNumsArrMats = [];
        this.state.orderProdInvNums.forEach(({ invNums, docId, prodId }) => {
          invNums.forEach(({ num }) => {
            InvNumsArrMats.push([
              null,
              num,
              docId,
              prodId,
              -2,
              0,
              this.context.storageId,
            ]);
          });
        });
        console.log(this.state.orderProdInvNums)
        api
          .addInvNumsTable({ table: InvNumsArrMats })
          .then(() => {
            this.context.success("Order complete");
            this.props.refresh();
            this.props.close();
          })
          .catch((err) => this.context.error(err.errText));

        // Remove session from localstorage
        const data = localStorage.getItem("InventoryUnfinished");
        let arr = JSON.parse(data);
        arr = arr.filter((el) => el !== this.props.retailSaleId);
        if (arr.length) {
          localStorage.setItem("InventoryUnfinished", JSON.stringify(arr));
        } else {
          localStorage.removeItem("InventoryUnfinished");
        }
      })
      .catch((err) => this.context.error(err.errText));
  }
  handlePrevStep() {
    this.getProductData(this.props.data[this.state.activeStep - 1].product_title);
    this.setState((prevState) => {
      return { activeStep: prevState.activeStep - 1 };
    });
  }
  handleNextStep() {
    if (
      this.state.selectedAmounts[this.state.activeStep] !==
      parseInt(this.props.data[this.state.activeStep].quantity_difference)
    ) {
      this.context.error(
        `You need to select ${
          this.props.data[this.state.activeStep].quantity_difference
        } product`
      );
      return;
    }
    this.getProductData(this.props.data[this.state.activeStep + 1].product_title);
    this.setState((prevState) => {
      return { activeStep: prevState.activeStep + 1 };
    });
  }
  handleFormClose() {
    api
      .executeProcedure(
        "[SalaryDB].anbar.[inventory_session_fix_out_info_delete_onPopupClose]",
        {
          inventory_session_id: this.props.inventoryId,
        }
      )
      .then(() => {
        this.props.close();

        console.log(this.props.inventoryId);

        const data = localStorage.getItem("InventoryUnfinished");
        let arr = JSON.parse(data);
        arr = arr.filter((el) => el !== this.props.inventoryId);
        if (arr.length) {
          localStorage.setItem("InventoryUnfinished", JSON.stringify(arr));
        } else {
          localStorage.removeItem("InventoryUnfinished");
        }
      })
      .catch((err) => console.log(err));
  }
  removeSelectedItem(id, i) {
    api
      .executeProcedure(
        "[SalaryDB].anbar.[inventory_session_fix_out_inner_info_selection_delete]",
        {
          id,
        }
      )
      .then(() => {
        this.getProductData(this.props.data[this.state.activeStep].product_title);
        this.removeInvNum(i);
      })
      .catch((err) => console.log(err.errText));
  }
  addInvNum(data) {
    this.setState((prevState) => {
      return {
        orderProdInvNums: [...prevState.orderProdInvNums, data],
      };
    });
  }
  removeInvNum(index) {
    let orderProdInvNums = [...this.state.orderProdInvNums];

    orderProdInvNums.splice(index, 1);

    this.setState({
      orderProdInvNums,
    });
  }

  render() {
    if (this.state.loading) return null;

    return (
      <StyledDialog
        style={{ zIndex: 21 }}
        open={this.props.open}
        onClose={this.handleFormClose.bind(this)}
      >
        <form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
          <div className="head">
            <Stepper activeStep={this.state.activeStep} alternativeLabel>
              {this.props.data.map((step) => (
                <Step key={uuid()}>
                  <StepLabel>{step.product_title}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>

          <StyledContent>
            <Divider />

            <div className="header">
              <h1>
                Silinmə miqdarı:
                <span>{this.props.data[this.state.activeStep].quantity_difference}</span>
              </h1>
              <h1>
                Əlavə edilib:
                <span>{this.state.selectedAmounts[this.state.activeStep]}</span>
              </h1>
              <h1>
                Qalıb:
                <span>
                  {parseInt(this.props.data[this.state.activeStep].quantity_difference) -
                    this.state.selectedAmounts[this.state.activeStep]}
                </span>
              </h1>
            </div>

            <div className="tablesContainer">
              <div className="table">
                <StyledTableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Məhsul</TableCell>
                        <TableCell align="center">Miqdar</TableCell>
                        <TableCell align="center">Qiymət</TableCell>
                        <TableCell align="center">Yararlıq müddəti</TableCell>
                        <TableCell align="center">Hücrə №</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.existingProducts.map((row) => (
                        <TableRow
                          hover
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            this.setState({
                              selectedProduct: row,
                            });
                          }}
                          key={uuid()}
                        >
                          <TableCell align="center">{row.product_title}</TableCell>
                          <TableCell align="center">
                            {row.left !== null ? (
                              `${row.left} ${row.unit_title}`
                            ) : (
                              <RemoveIcon />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {row.unit_price !== null ? (
                              `${parseFloat(row.unit_price).toFixed(2)} ${
                                row.currency_title
                              }`
                            ) : (
                              <RemoveIcon />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {row.exp_date ? (
                              `${dayjs(row.exp_date).format("YYYY-MM-DD")}`
                            ) : (
                              <RemoveIcon />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {row.product_cell !== null ? (
                              row.product_cell
                            ) : (
                              <RemoveIcon />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </div>

              <DoubleArrowOutlinedIcon />

              <div className="table">
                <StyledTableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Məhsul</TableCell>
                        <TableCell align="center">Miqdar</TableCell>
                        <TableCell align="center">Qiymət</TableCell>
                        <TableCell align="center">Hücrə №</TableCell>
                        <TableCell align="center"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.forOrderProducts.map((row, i) => (
                        <TableRow key={uuid()}>
                          <TableCell align="center">{row.product_title}</TableCell>
                          <TableCell align="center">{`${row.quantity} ${row.unit_title}`}</TableCell>
                          <TableCell align="center">{`${parseFloat(row.sum_price).toFixed(2)} ${row.currency_title}`}</TableCell>
                          <TableCell align="center">
                            {row.product_cell !== null ? (
                              row.product_cell
                            ) : (
                              <RemoveIcon />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => this.removeSelectedItem(row.id, i)}>
                              <HighlightOffIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </div>
            </div>
          </StyledContent>

          <DialogActions>
            <Divider />

            <CustomButton onClick={this.handleFormClose.bind(this)}>Imtına</CustomButton>
            <CustomButton
              disabled={this.state.activeStep === 0}
              onClick={this.handlePrevStep.bind(this)}
            >
              Geriyə
            </CustomButton>
            <CustomButton
              disabled={this.state.activeStep === this.props.data.length - 1}
              onClick={this.handleNextStep.bind(this)}
            >
              İrəli
            </CustomButton>

            <div className="gap" style={{ flexGrow: 1 }}></div>
            {Boolean(this.state.activeStep === this.props.data.length - 1) && (
              <CustomButton type="submit">Təstiq et</CustomButton>
            )}
          </DialogActions>
        </form>

        {Boolean(this.state.selectedProduct) && (
          <TransferProductForm
            open={true}
            close={() => {
              this.setState({
                selectedProduct: null,
              });
            }}
            product={this.state.selectedProduct}
            inventoryId={this.props.inventoryId}
            neededAmount={
              parseInt(this.props.data[this.state.activeStep].quantity_difference) -
              this.state.selectedAmounts[this.state.activeStep]
            }
            activeStep={this.state.activeStep}
            refresh={() =>
              this.getProductData(this.props.data[this.state.activeStep].product_title)
            }
            addInvNum={this.addInvNum.bind(this)}
          />
        )}
      </StyledDialog>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledDialog = styled(Dialog)`
  .MuiDialog-container > .MuiPaper-root {
    min-width: 800px;
    max-width: unset;
    height: 100%;

    form {
      width: 100%;
      height: 100%;

      display: grid;
      grid-template-columns: 100%;
      grid-template-rows: 70px 1fr auto;
    }
  }

  .head {
    background-color: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: center;

    .MuiStepper-root {
      background-color: transparent;
      width: 90%;
      padding-top: 10px;
      padding-bottom: 0;
      /* padding: 0 0 10px 0; */
    }
    .MuiStepIcon-root.MuiStepIcon-active {
      color: #ffaa00;
    }
    .MuiStepIcon-root.MuiStepIcon-completed {
      color: #ffaa00;
    }
    .MuiStepLabel-label.MuiStepLabel-alternativeLabel {
      margin-top: 10px;
    }
  }

  .MuiDialogActions-root {
    padding: 8px 24px 8px 6px;
    justify-content: flex-start;
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
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto 1fr;
  grid-template-areas: "header" "tables";

  .header {
    grid-area: header;
    padding: 7px 0 0 0;
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;

    h1 {
      font-size: 1.4rem;

      span {
        font-size: 1.5rem;
        font-weight: 600;
        margin-left: 5px;
      }
    }
  }

  .tablesContainer {
    overflow-y: hidden;
    grid-area: tables;
    padding: 10px;
    display: grid;
    grid-template-columns: auto auto auto; // for equal tables 1fr auto 1fr
    justify-items: center;
    align-items: center;
    gap: 5px;

    .table.withDropdown {
      display: grid;
      grid-template-rows: auto 1fr;

      > .MuiFormControl-root {
        width: 100%;
        margin-top: 6px;
      }
    }
    .table {
      overflow-y: hidden;
      height: 100%;
      width: 100%;
    }

    .MuiSvgIcon-root {
      color: #ffaa00;
      transform: scale(1.2);
    }
  }
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
