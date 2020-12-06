import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import FileImport from "../../components/FileImport";
import { CustomButton, CustomTextInput } from "../../components/UtilComponents";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@material-ui/core";

export default class WarehouseRemoveTransferProductForm extends Component {
  static contextType = GlobalDataContext;
  state = {
    quantity:
      parseInt(this.props.product.left) > this.props.neededAmount
        ? this.props.neededAmount
        : parseInt(this.props.product.left),
    reason: "",
    documentNum: "",
    loading: false,
  };

  handleInputsChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  async handleSubmit(e) {
    e.preventDefault();
    if (this.state.quantity + "" === "0") {
      this.context.error("Quantity value must be greater than 0");
      return;
    }

    this.setState({
      loading: true,
    });

    let fileName = null;
    if (this.state.file) {
      // Generate random name for file
      fileName = "remove_" + uuid();
      this.props.addFile({
        file: this.state.file,
        fileName,
      });

      fileName = `${fileName}.${this.state.file.name.split(".")[1]}`;
    }

    api
      .executeProcedure("[SalaryDB].anbar.[order_request_handle]", {
        storage_id: this.props.product.storage_id,
        quantity: parseInt(this.state.quantity),
        reason: this.state.reason,
        document_num: this.state.documentNum,
        document_num_path: fileName,
        currency: this.props.product.currency_id,
        retail_sale_session_id: this.props.retailSaleId,
        cluster_order: this.props.product.cluster_default,
        price: this.props.product.unit_price,
        exp_date: this.props.product.exp_date,
        product_cell: this.props.product.product_cell,
        barcode: this.props.product.barcode,
        product_id: this.props.product.product_id,
        document_id_as_parent: this.props.product.document_id,
        left: this.props.product.left,
        product_num: this.props.activeStep,
        is_out: 1,
      })
      .then(() => {
        this.props.close();
        this.props.refresh();
        this.context.success(`Əlavə edildi`);
      })
      .catch((err) => {
        this.context.error(err.errText);
        this.setState({
          loading: false,
        });
      });
  }

  render() {
    return (
      <StyledDialog
        style={{ zIndex: 210 }}
        open={this.props.open}
        onClose={this.props.close}
      >
        <form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
          <DialogTitle>{this.props.product.product_title}</DialogTitle>

          <StyledContent>
            <h1>Tələb olunan miqdar: {this.props.neededAmount}</h1>
            <div className="inputs">
              <div className="amountBlock">
                <CustomTextInput
                  className="input-item"
                  required
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max:
                        parseInt(this.props.product.left) >
                        this.props.neededAmount
                          ? this.props.neededAmount
                          : parseInt(this.props.product.left),
                    },
                  }}
                  label="Miqdar"
                  type="number"
                  name="quantity"
                  value={this.state.quantity}
                  onChange={this.handleInputsChange.bind(this)}
                />
                <p className="product-left"> / {this.props.product.left}</p>
              </div>
              <CustomTextInput
                className="input-item"
                label="Müqavilə nömrəsi"
                name="documentNum"
                value={this.state.documentNum}
                onChange={this.handleInputsChange.bind(this)}
              />
              <CustomTextInput
                className="input-item"
                label="Səbəb"
                name="reason"
                value={this.state.reason}
                onChange={this.handleInputsChange.bind(this)}
              />
            </div>

            <div className="fileImportContainer">
              <FileImport
                file={this.state.file}
                setFile={(file) => this.setState({ file })}
              />
            </div>
          </StyledContent>

          <DialogActions>
            <Divider />
            <div className="gap" style={{ flexGrow: 1 }}></div>
            <CustomButton onClick={this.props.close}>Imtına</CustomButton>
            <CustomButton disabled={this.state.loading} type="submit">
              Əlavə et
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
  .MuiDialog-container > .MuiPaper-root {
    width: 500px;
    height: 550px;
  }

  form {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .MuiDialogTitle-root {
    background-color: #f5f5f5;

    .MuiTypography-root {
      font-size: 1.6rem;
    }
  }

  .MuiDialogContent-root {
    flex-grow: 1;
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
  display: flex;
  flex-direction: column;

  .inputs {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .amountBlock {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;

      .MuiFormControl-root {
        flex-grow: 1;
      }

      .product-left {
        margin-left: 10px;
        font-size: 1.4rem;
      }
    }
  }

  .fileImportContainer {
    margin-top: 7px;
    flex-grow: 1;
  }
`;
