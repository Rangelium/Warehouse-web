import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../../../components/GlobalDataProvider";
import api from "../../../../tools/connect";

import Table from "./FormTable";
import FormProduct from "./FormProduct";
import { CustomButton } from "../../../../components/UtilComponents";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@material-ui/core";

export default class DecommisionForm extends Component {
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
      transferInfoData: null,
    };

    this.FormProductRef = React.createRef();
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
        parseInt(this.state.transferInfoData.quantity) ===
        this.FormProductRef.current.state.inventoryNumArr.length
      ) {
        this.FormProductRef.current.clearInputs();
        this.handleTransfer(
          this.state.activeStep - 1,
          this.FormProductRef.current.state.inventoryNumArr
        );
      } else {
        return this.context.error(
          "You need to create Inventory numbers for all products"
        );
      }
    }
    if (this.state.activeStep === this.state.selectedProducts.length) {
      this.props.refresh();
      return this.handleClose();
    }

    const subCategory = await api
      .executeProcedure("[SalaryDB].anbar.[warehouse_select_products_subcategory]", {
        product_id: this.state.selectedProducts[this.state.activeStep].product_id,
      })
      .then((res) => res[0])
      .catch((err) => console.log(err));

    const category = await api
      .executeProcedure("[SalaryDB].anbar.[warehouse_select_products_category]", {
        parent_id: subCategory.parent_id,
      })
      .then((res) => res[0])
      .catch((err) => console.log(err));

    this.setState((prevState) => {
      return {
        activeStep: prevState.activeStep + 1,
        selectedProductPath: {
          category: category.title,
          subCategory: subCategory.title,
        },
      };
    });
  }
  handleTransfer = async (i, invNumArr) => {
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

    const docId = await api
      .executeProcedure("[SalaryDB].anbar.[decommission_product_session_info_insert]", {
        quantity: this.state.transferInfoData.quantity,
        reason: this.state.transferInfoData.reason,
        currency: this.state.selectedProducts[i].currency_id,
        storage_id: this.context.storageId,
        decommission_session_id: this.props.sessionId,
        document_num: this.state.transferInfoData.contractNum,
        document_num_path: fileName,
        cluster_order_default: this.state.selectedProducts[i].cluster_default,
        price: this.state.selectedProducts[i].unit_price,
        exp_date: this.state.selectedProducts[i].exp_date,
        product_cell: this.state.selectedProducts[i].product_cell,
        barcode: this.state.selectedProducts[i].barcode,
        product_id: this.state.selectedProducts[i].product_id,
        left: this.state.selectedProducts[i].left,
        document_id_as_parent_id: this.state.selectedProducts[i].document_id,
      })
      .then((res) => res[0].document_id)
      .catch((err) => this.context.error(err.errText));

    let InvNumsArrMats = [];
    invNumArr.forEach(({ num }) => {
      InvNumsArrMats.push([
        null,
        num,
        docId,
        this.state.selectedProducts[i].product_id,
        -1,
      ]);
    });

    await api
      .addInvNumsTable(InvNumsArrMats)
      .catch((err) => this.context.error(err.errText));

    this.context.success(`Əlavə edildi`);
  };
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  handleClose() {
    this.prepareForm();
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
      transferInfoData: null,
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
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              e.preventDefault();
            }
          }}
        >
          <DialogTitle>Products decommision</DialogTitle>

          <StyledContent>
            <div className="mainData">
              {!this.state.activeStep && (
                <Table
                  selectedProducts={this.state.selectedProducts}
                  selectProduct={this.selectProduct.bind(this)}
                />
              )}

              {Boolean(this.state.activeStep) && (
                <FormProduct
                  ref={this.FormProductRef}
                  active={this.state.activeStep}
                  file={this.state.file}
                  setFile={(file) => this.setState({ file })}
                  path={this.state.selectedProductPath}
                  setTransefInfo={(data) => {
                    this.setState({ transferInfoData: data });
                  }}
                  selectedProduct={this.state.selectedProducts[this.state.activeStep - 1]}
                />
              )}
            </div>
          </StyledContent>

          <DialogActions>
            <Divider />
            <CustomButton onClick={this.handleClose.bind(this)}>Close</CustomButton>
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
    max-width: 720px;
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

  .mainData {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    /* padding-top: 10px; */
  }
`;
