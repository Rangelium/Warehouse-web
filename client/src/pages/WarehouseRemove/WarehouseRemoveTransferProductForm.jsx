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
  IconButton,
} from "@material-ui/core";

// Icons
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";

export default class WarehouseRemoveTransferProductForm extends Component {
  static contextType = GlobalDataContext;
  constructor(props) {
    super(props);
    this.state = {
      quantity:
        parseInt(this.props.product.left) > this.props.neededAmount
          ? this.props.neededAmount
          : parseInt(this.props.product.left),
      reason: "",
      documentNum: "",
      loading: false,

      inventoryNum: "",
      inventoryNumArr: [],

      allPossibInvNums: [],
      possibleInvNums: [],
    };

    this.InvNumInputRef = React.createRef();
  }

  componentDidMount() {
    api
      .executeProcedure("[SalaryDB].anbar.[search_existing_inventories]", {
        document_id: this.props.product.document_id,
        storage_id: this.context.storageId
      })
      .then((res) => {
        this.setState({
          allPossibInvNums: res.map(({ inventory_num }) => {
            return { invNum: inventory_num, key: uuid() };
          }),
          possibleInvNums: res.map(({ inventory_num }) => {
            return { invNum: inventory_num, key: uuid() };
          }),
        });
      })
      .catch((err) => console.log(err));
  }
  handleInvInputChange(e) {
    const userText = e.target.value;
    this.setState((prevState) => {
      return {
        inventoryNum: userText,
        possibleInvNums: userText
          ? prevState.possibleInvNums.filter(({ invNum }) =>
              invNum.toLowerCase().includes(userText.toLowerCase())
            )
          : prevState.allPossibInvNums,
      };
    });
  }
  handleInputsChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  addInventoryNum(invNum) {
    // Check if invNum is uinque
    for (let i = 0; i < this.state.inventoryNumArr.length; i++) {
      if (Object.values(this.state.inventoryNumArr[i]).includes(invNum)) {
        return this.context.error(`Inventoy number "${invNum}" is already exist`);
      }
    }

    // Clear input
    this.setState({
      inventoryNum: "",
    });
    // Check if empty
    if (!invNum.trim().length) {
      return this.context.error("Inventory num cannot be empty");
    }

    // Check if needed amount selected
    if (this.state.inventoryNumArr.length === parseInt(this.state.quantity)) {
      return this.context.error("Needed amount added");
    }

    // Add to arr
    let inventoryNumArr = [...this.state.inventoryNumArr];
    inventoryNumArr.push({
      id: uuid(),
      num: invNum,
    });
    this.setState({
      inventoryNumArr,
    });
  }
  removeInventoryNum(index) {
    let inventoryNumArr = [...this.state.inventoryNumArr];

    inventoryNumArr.splice(index, 1);

    this.setState({
      inventoryNumArr,
    });
  }
  async handleSubmit(e) {
    e.preventDefault();

    if (this.state.quantity + "" === "0") {
      this.context.error("Quantity value must be greater than 0");
      return;
    }
    if (
      this.props.product.is_inventory &&
      this.state.inventoryNumArr.length !== parseInt(this.state.quantity)
    ) {
      return this.context.error("Create inventory numbers for every product");
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
        reference_id: this.props.referenceId,
      })
      .then((res) => {
        if (this.props.product.is_inventory) {
          this.props.addInvNum({
            prodId: this.props.product.product_id,
            docId: res[0].document_id,
            invNums: this.state.inventoryNumArr,
          });
        }
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

          <StyledContent
            invnumsactive={
              this.state.inventoryNumArr.length < parseInt(this.state.quantity) ? 1 : 0
            }
          >
            <h1>Tələb olunan miqdar: {this.props.neededAmount}</h1>
            <div className="inputs">
              <div className="amountBlock">
                <CustomTextInput
                  required
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max:
                        parseInt(this.props.product.left) > this.props.neededAmount
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
                label="Müqavilə nömrəsi"
                name="documentNum"
                value={this.state.documentNum}
                onChange={this.handleInputsChange.bind(this)}
              />
              <CustomTextInput
                label="Səbəb"
                name="reason"
                value={this.state.reason}
                onChange={this.handleInputsChange.bind(this)}
              />

              {this.props.product.is_inventory && (
                <div className="invNums">
                  <div className="invNumCont">
                    <CustomTextInput
                      disabled={
                        this.state.inventoryNumArr.length >= parseInt(this.state.quantity)
                      }
                      label="Inventory number"
                      name="inventoryNum"
                      value={this.state.inventoryNum}
                      onChange={this.handleInvInputChange.bind(this)}
                    />
                    <div className="foundProducts">
                      {this.state.possibleInvNums.map(({ key, invNum }) => {
                        for (let i = 0; i < this.state.inventoryNumArr.length; i++) {
                          if (
                            Object.values(this.state.inventoryNumArr[i]).includes(invNum)
                          ) {
                            return null;
                          }
                        }

                        return (
                          <p
                            key={key}
                            onClick={() => {
                              this.addInventoryNum(invNum);
                            }}
                          >
                            {invNum}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <div className="invNumsContainer">
                    {this.state.inventoryNumArr.map(({ id, num }, i) => (
                      <div key={id} className="invNumItem">
                        <p>{num}</p>
                        <IconButton onClick={() => this.removeInventoryNum(i)}>
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
    height: 100%;

    max-height: calc(100% - 32px);
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

    .invNums {
      display: flex;
      flex-direction: column;

      .MuiInputAdornment-positionEnd {
        margin-left: 0;
      }
      .MuiOutlinedInput-adornedEnd {
        padding-right: 0;
      }

      .invNumCont {
        display: inherit;
        flex-direction: column;
        position: relative;
        pointer-events: ${(props) => (props.invnumsactive ? "all" : "none")};

        &:hover .foundProducts {
          opacity: 1;
          pointer-events: all;
        }

        .foundProducts {
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
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
            opacity: ${(props) => (props.invnumsactive ? 1 : 0)};
            pointer-events: ${(props) => (props.invnumsactive ? "all" : "none")};
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

      .invNumsContainer {
        padding-top: 5px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        max-height: 180px;
        overflow-x: hidden;
        overflow-y: auto;

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

        .invNumItem {
          display: flex;
          align-items: center;

          p {
            font-size: 1.2rem;
          }
        }
      }
    }
  }

  .fileImportContainer {
    margin-top: 7px;
    flex-grow: 1;
  }
`;
