import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../../components/GlobalDataProvider";
import api from "../../../tools/connect";

import Table from "./FormTable";
import FormProduct from "./FormProduct";
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
  Typography,
  Divider,
} from "@material-ui/core";

// Icons
import DoubleArrowOutlinedIcon from "@material-ui/icons/DoubleArrowOutlined";

export default class TransferForm extends Component {
  static contextType = GlobalDataContext;
  constructor() {
    super();

    this.state = {
      activeStep: 0,
      toWarehouseId: "",
      warehouseData: [],
      selectedProducts: [],

      file: null,
      selectedProductPath: {
        category: "",
        subCategory: "",
      },

      quantity: "",
      productCell: "",
      contractNum: "",
      reason: "",

      invNumArr: [],
      allPossibInvNums: [],
      possibleInvNums: [],
    };
  }

  componentDidMount() {
    this.prepareForm();
  }
  async handleSubmit(e) {
    e.preventDefault();

    if (!this.state.selectedProducts.length) {
      return this.context.error("Nothing selected");
    }

    if (this.state.activeStep) {
      if (
        this.state.selectedProducts[this.state.activeStep - 1].is_inventory &&
        parseInt(this.state.quantity) !== this.state.invNumArr.length
      ) {
        return this.context.error(
          "You need to create Inventory numbers for all products"
        );
      } else {
        this.handleTransfer(this.state.activeStep - 1);
      }
    }

    // Close form if transfered product is last
    if (this.state.activeStep === this.state.selectedProducts.length) return;

    const subCategory = await api
      .executeProcedure(
        "[SalaryDB].anbar.[warehouse_select_products_subcategory]",
        {
          product_id: this.state.selectedProducts[this.state.activeStep]
            .product_id,
        }
      )
      .then((res) => res[0])
      .catch((err) => console.log(err));

    const category = await api
      .executeProcedure(
        "[SalaryDB].anbar.[warehouse_select_products_category]",
        {
          parent_id: subCategory.parent_id,
        }
      )
      .then((res) => res[0])
      .catch((err) => console.log(err));

    const allPossibInvNums =  await api
    .executeProcedure("[SalaryDB].anbar.[search_existing_inventories]", {
      document_id: this.state.selectedProducts[this.state.activeStep].document_id,
      storage_id: this.context.storageId
    })
    .then((res) => res.map(({ inventory_num }) => ({ invNum: inventory_num, key: uuid() })))
    .catch((err) => console.log(err));
    const possibleInvNums = [...allPossibInvNums];

    this.setState((prevState) => {
      return {
        activeStep: prevState.activeStep + 1,
        selectedProductPath: {
          category: category.title,
          subCategory: subCategory.title,
        },
        allPossibInvNums,
        possibleInvNums,
      };
    });
  }
  async handleTransfer(i) {
    let fileName = null;
    if (this.state.file) {
      // Generate random name for file
      fileName = "transfer_" + uuid();
      const formData = new FormData();

      formData.append("title", fileName);
      formData.append("file", this.state.file);

      let res = await api.uploadFile(formData).catch((err) => {
        console.log(err);
      });
      fileName = `${fileName}.${this.state.file.name.split(".")[1]}`;
      if (res === undefined) return;
    }

    api
      .executeProcedure(
        "[SalaryDB].anbar.[transfer_products_session_info_insert]",
        {
          quantity: this.state.quantity,
          reason: this.state.reason,
          currency: this.state.selectedProducts[i].currency_id,
          storage_from: this.context.storageId,
          storage_to: this.state.toWarehouseId,
          transfer_session_id: this.props.sessionId,
          document_num: this.state.contractNum,
          document_num_path: fileName,
          cluster_order_default: this.state.selectedProducts[i].cluster_default,
          price: this.state.selectedProducts[i].unit_price,
          exp_date: this.state.selectedProducts[i].exp_date,
          product_cell: this.state.productCell,
          barcode: this.state.selectedProducts[i].barcode,
          product_id: this.state.selectedProducts[i].product_id,
          product_manufacturer: this.state.selectedProducts[i]
            .product_manufacturer,
          left: this.state.selectedProducts[i].left,
          document_id_as_parent_id: this.state.selectedProducts[i].document_id,
        }
      )
      .then((res) => {
        if (
          this.state.selectedProducts[this.state.activeStep - 1].is_inventory
        ) {
          let InvNumsArrMats = [];
          this.state.invNumArr.forEach(({ num }) => {
            InvNumsArrMats.push([
              null,
              num,
              res[0].link_child_document_id,
              this.state.selectedProducts[i].product_id,
              3,
              res[0].session_info_id,
              this.state.toWarehouseId,
            ]);
            InvNumsArrMats.push([
              null,
              num,
              res[0].document_id,
              this.state.selectedProducts[i].product_id,
              -3,
              res[0].session_info_id,
              this.context.storageId,
            ]);
          });

          console.log(InvNumsArrMats);
          api
            .addInvNumsTable({
              table: InvNumsArrMats,
              sessionId: this.props.sessionId,
            })
            .then(() => {
              this.context.success(
                `Əlavə edildi ${this.state.selectedProducts[i].product_title}`
              );
            })
            .catch((err) => this.context.error(err));
        } else {
          this.context.success(
            `Əlavə edildi ${this.state.selectedProducts[i].product_title}`
          );
        }

        this.clearInputs();
        // Close form if transfered product is last
        if (this.state.activeStep === this.state.selectedProducts.length) {
          this.props.refresh();
          return this.handleClose();
        }
      })
      .catch((err) => {
        this.context.error(err.errText);
        console.log(err);
      });
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  clearInputs() {
    this.setState({
      quantity: "",
      productCell: "",
      contractNum: "",
      reason: "",

      invNumArr: [],
      allPossibInvNums: [],
      possibleInvNums: [],
    });
  }
  handleClose() {
    this.prepareForm();
    this.props.refresh();
    this.props.close();
  }
  async prepareForm() {
    const warehouseData = await api
      .executeProcedure("anbar.storage_select_all")
      .catch((err) => this.context.error(err.errText));

    this.setState({
      activeStep: 0,
      toWarehouseId: "",
      warehouseData,
      selectedProducts: [],

      file: null,
      selectedProductPath: {
        category: "",
        subCategory: "",
      },

      quantity: "",
      productCell: "",
      contractNum: "",
      reason: "",

      invNumArr: [],
      allPossibInvNums: [],
      possibleInvNums: [],
    });
  }
  selectProduct(data) {
    let selectedProducts = [...this.state.selectedProducts];

    let isUnique = true;
    for (let i = 0; i < selectedProducts.length; i++) {
      if (data.document_id === selectedProducts[i].document_id) {
        selectedProducts = selectedProducts.filter(
          (el) => el.document_id !== data.document_id
        );

        isUnique = false;
      }
    }

    if (isUnique) {
      selectedProducts.push(data);
    }

    this.setState({
      selectedProducts,
    });
  }
  changePossibleInvNums(userText){
    this.setState((prevState) => {
      return {
        possibleInvNums: userText
          ? prevState.possibleInvNums.filter(({ invNum }) =>
              invNum.toLowerCase().includes(userText.toLowerCase())
            )
          : prevState.allPossibInvNums,
      };
    });
  }

  render() {
    return (
      <StyledDialog
        style={{ zIndex: 21 }}
        open={this.props.open}
        onClose={this.handleClose.bind(this)}
      >
        <form
          autoComplete="off"
          onSubmit={this.handleSubmit.bind(this)}
        >
          <DialogTitle>Məhsulların Transferi</DialogTitle>

          <StyledContent>
            <div className="heading">
              <CustomTextInput
                style={{ minWidth: "200px" }}
                disabled={true}
                label="Anbardan"
                value={this.context.storageTitle}
              />

              <div className="block">
                <Typography noWrap variant="h3">
                  TRANSFER
                </Typography>
                <DoubleArrowOutlinedIcon className="icon" />
              </div>

              <CustomSelect
                required
                style={{ minWidth: "200px" }}
                disabled={Boolean(this.state.activeStep)}
                label="Anbara"
                name="toWarehouseId"
                value={this.state.toWarehouseId}
                onChange={this.handleChange.bind(this)}
              >
                {this.state.warehouseData.map((warehouse) =>
                  warehouse.id !== this.context.storageId ? (
                    <CustomSelectItem key={uuid()} value={warehouse.id}>
                      {warehouse.storage_name}
                    </CustomSelectItem>
                  ) : null
                )}
              </CustomSelect>
            </div>

            <div className="mainData">
              {!this.state.activeStep && (
                <Table
                  selectedProducts={this.state.selectedProducts}
                  selectProduct={this.selectProduct.bind(this)}
                />
              )}

              {Boolean(this.state.activeStep) && (
                <FormProduct
                changePossibleInvNums={this.changePossibleInvNums.bind(this)}
                  possibleInvNums={this.state.possibleInvNums}
                  quantity={this.state.quantity}
                  productCell={this.state.productCell}
                  contractNum={this.state.contractNum}
                  reason={this.state.reason}
                  handleChange={this.handleChange.bind(this)}
                  invNumArr={this.state.invNumArr}
                  setInvNumArr={(invNumArr) => this.setState({ invNumArr })}
                  active={this.state.activeStep}
                  file={this.state.file}
                  setFile={(file) => this.setState({ file })}
                  path={this.state.selectedProductPath}
                  selectedProduct={
                    this.state.selectedProducts[this.state.activeStep - 1]
                  }
                />
              )}
            </div>
          </StyledContent>

          <DialogActions>
            <Divider />
            <CustomButton onClick={this.handleClose.bind(this)}>
              İmtına
            </CustomButton>
            <CustomButton type="submit">Əlavə et</CustomButton>
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
    min-width: 620px;
    max-width: 620px;
    height: 1000px;
    max-height: calc(100% - 24px);

    form {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
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
  padding: 10px;
  display: flex;
  flex-direction: column;

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .block {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .MuiTypography-root {
        font-size: 1.6rem;
        margin-right: 5px;
      }

      .icon {
        transform: scale(1.4);
        color: #ffaa00;
      }
    }
  }

  .mainData {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding-top: 10px;
  }
`;
