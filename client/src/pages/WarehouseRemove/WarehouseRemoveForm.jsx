import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import TransferProductForm from "./WarehouseRemoveTransferProductForm";
import ProductAuthForm from "./ProductAuthForm";
import {
  CustomButton,
  CustomSelect,
  CustomSelectItem,
} from "../../components/UtilComponents";
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
import dayjs from "dayjs";

export default class WarehouseRemoveForm extends Component {
  static contextType = GlobalDataContext;
  state = {
    activeStep: 0,
    loading: true,

    selectedWarehouse: this.context.storageId,
    warehouseData: [],
    existingProducts: [],
    forOrderProducts: [],
    createdFiles: [],

    selectedAmounts: Array(this.props.data.length).fill(0),
    selectedProduct: null,

    showProductAuthForm: false,
  };

  async componentDidMount() {
    await this.getProductData(this.props.data[0].title);

    api
      .executeProcedure("anbar.storage_select_all")
      .then((data) => {
        this.setState({
          warehouseData: data,
          loading: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  async getProductData(productTitle) {
    const existingProducts = await api
      .executeProcedure("[SalaryDB].anbar.[order_request_product_search]", {
        storage_id: this.state.selectedWarehouse,
        title: productTitle,
      })
      .catch((err) => {
        console.error(err.errText);
        return [];
      });

    const forOrderProducts = await api
      .executeProcedure(
        "[SalaryDB].anbar.[order_request_handle_session_info]",
        {
          retail_sale_session_id: this.props.retailSaleId,
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
        product.product_title === this.props.data[this.state.activeStep].title
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
  handleWarehouseChange(e) {
    this.setState(
      {
        selectedWarehouse: e.target.value,
      },
      () => {
        this.getProductData(this.props.data[this.state.activeStep].title);
      }
    );
  }
  async handleSubmit(e, authComplete) {
    e.preventDefault();

    if (!authComplete) {
      for (let i = 0; i < this.state.selectedAmounts.length; i++) {
        if (
          this.state.selectedAmounts[i] !== parseInt(this.props.data[i].amount)
        ) {
          this.setState({
            showProductAuthForm: true,
          });

          this.context.error("Not enough products selected");
          return;
        }
      }
    }

    // Finish remove action
    api
      .executeProcedure("[SalaryDB].anbar.[order_request_complete]", {
        user_id: this.context.userId,
        retail_sale_session_id: this.props.retailSaleId,
        order_id: this.props.order_id,
        status: !authComplete ? 20 : 0, // if selectedAmount === required will be 20, after productAuth will be 21
      })
      .then(() => {
        this.context.success("Order complete");
        this.props.refresh();
        this.props.close();

        this.uploadFiles();

        // Remove session from localstorage
        const data = localStorage.getItem(
          "WarehouseRemoveUnfinishedRetailSessions"
        );
        let arr = JSON.parse(data);
        arr = arr.filter((el) => el !== this.props.retailSaleId);
        if (arr.length) {
          localStorage.setItem(
            "WarehouseRemoveUnfinishedRetailSessions",
            JSON.stringify(arr)
          );
        } else {
          localStorage.removeItem("WarehouseRemoveUnfinishedRetailSessions");
        }
      })
      .catch((err) => this.context.error(err.errText));
  }
  handlePrevStep() {
    this.getProductData(this.props.data[this.state.activeStep - 1].title);
    this.setState((prevState) => {
      return { activeStep: prevState.activeStep - 1 };
    });
  }
  handleNextStep() {
    // if (this.state.selectedAmounts[this.state.activeStep] !== 0) {
    // 	this.context.error(`You need to select at least 1 product`);
    // 	return;
    // }
    this.getProductData(this.props.data[this.state.activeStep + 1].title);
    this.setState((prevState) => {
      return { activeStep: prevState.activeStep + 1 };
    });
  }
  showTransferForm(product) {
    this.setState({
      selectedProduct: product,
    });
  }
  handleFormClose() {
    api
      .executeProcedure(
        "[SalaryDB].anbar.[order_request_session_delete_onPopupClose]",
        {
          retail_sale_session_id: this.props.retailSaleId,
        }
      )
      .then(() => {
        this.props.close();

        const data = localStorage.getItem(
          "WarehouseRemoveUnfinishedRetailSessions"
        );
        let arr = JSON.parse(data);
        arr = arr.filter((el) => el !== this.props.retailSaleId);
        if (arr.length) {
          localStorage.setItem(
            "WarehouseRemoveUnfinishedRetailSessions",
            JSON.stringify(arr)
          );
        } else {
          localStorage.removeItem("WarehouseRemoveUnfinishedRetailSessions");
        }
      })
      .catch((err) => console.log(err.errText));
  }
  removeSelectedItem(id) {
    api
      .executeProcedure(
        "[SalaryDB].anbar.[order_request_handle_session_info_delete]",
        {
          id,
        }
      )
      .then(() => {
        this.getProductData(this.props.data[this.state.activeStep].title);
      })
      .catch((err) => console.log(err.errText));
  }
  addFile(file) {
    let newArr = [...this.state.createdFiles];
    newArr.push({ ...file });
    this.setState({
      createdFiles: newArr,
    });
  }
  uploadFiles() {
    this.state.createdFiles.forEach(({ fileName, file }) => {
      const formData = new FormData();
      formData.append("title", fileName);
      formData.append("file", file);

      api.uploadFile(formData).catch((err) => {
        console.log(err);
        this.context.error("ERROR!");
      });
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
            <Stepper activeStep={this.state.activeStep}>
              {this.props.data.map((step) => (
                <Step key={uuid()}>
                  <StepLabel>{step.title}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>

          <StyledContent>
            <Divider />

            <div className="header">
              <h1>
                Sifarış olunan miqdar:
                <span>{this.props.data[this.state.activeStep].amount}</span>
              </h1>
              <h1>
                Əlavə edilib:
                <span>{this.state.selectedAmounts[this.state.activeStep]}</span>
              </h1>
              <h1>
                Qalıb:
                <span>
                  {parseInt(this.props.data[this.state.activeStep].amount) -
                    this.state.selectedAmounts[this.state.activeStep]}
                </span>
              </h1>
            </div>

            <div className="tablesContainer">
              <div className="table withDropdown">
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
                  style={{ width: "100%" }}
                  label="Anbar"
                  name="selectedWarehouse"
                  value={this.state.selectedWarehouse}
                  onChange={this.handleWarehouseChange.bind(this)}
                >
                  {this.state.warehouseData.map(({ id, storage_name }) => (
                    <CustomSelectItem key={uuid()} value={id}>
                      {storage_name}
                    </CustomSelectItem>
                  ))}
                </CustomSelect>

                <StyledTableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Məhsul</TableCell>
                        <TableCell align="center">Miqdar</TableCell>
                        <TableCell align="center">Qiymət</TableCell>
                        <TableCell align="center">Yararlılıq müddəti</TableCell>
                        <TableCell align="center">Hücrə №</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.existingProducts.map((row) => (
                        <TableRow
                          hover
                          style={{ cursor: "pointer" }}
                          onClick={() => this.showTransferForm(row)}
                          key={uuid()}
                        >
                          <TableCell align="center">
                            {row.product_title}
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
                        <TableCell align="center">Hücrə №</TableCell>
                        <TableCell align="center"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.forOrderProducts.map((row) => (
                        <TableRow key={uuid()}>
                          <TableCell align="center">
                            {row.product_title}
                          </TableCell>
                          <TableCell align="center">{row.quantity}</TableCell>
                          <TableCell align="center">
                            {row.product_cell !== null ? (
                              row.product_cell
                            ) : (
                              <RemoveIcon />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => this.removeSelectedItem(row.id)}
                            >
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

            <CustomButton onClick={this.handleFormClose.bind(this)}>
              İmtına
            </CustomButton>
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
              <CustomButton type="submit">Bitir</CustomButton>
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
            referenceId={this.props.data[this.state.activeStep].id}
            product={this.state.selectedProduct}
            retailSaleId={this.props.retailSaleId}
            neededAmount={
              parseInt(this.props.data[this.state.activeStep].amount) -
              this.state.selectedAmounts[this.state.activeStep]
            }
            activeStep={this.state.activeStep}
            addFile={this.addFile.bind(this)}
            refresh={() =>
              this.getProductData(this.props.data[this.state.activeStep].title)
            }
          />
        )}
        {this.state.showProductAuthForm && (
          <ProductAuthForm
            open={true}
            close={() => this.setState({ showProductAuthForm: false })}
            handleSubmit={this.handleSubmit.bind(this)}
            selectedAmounts={this.state.selectedAmounts}
            neededData={this.props.data}
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
      padding-top: 0;
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
    grid-template-columns: 1fr auto auto; // for equal tables 1fr auto 1fr
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
