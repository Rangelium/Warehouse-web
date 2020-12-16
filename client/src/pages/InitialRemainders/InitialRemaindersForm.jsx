import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import dayjs from "dayjs";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import {
  CustomSelect,
  CustomSelectItem,
  CustomTextInput,
  CustomButton,
} from "../../components/UtilComponents";
import {
  Typography,
  Paper,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";

export default class InitialRemaindersForm extends Component {
  static contextType = GlobalDataContext;
  state = {
    title: "",
    barcode: "",
    productId: "",
    searchData: [],
    quantity: "",
    clusterId: "",
    unit_title: "",
    price: "",
    currency: "",
    currencyData: [],
    expDate: dayjs().format("YYYY-MM-DD"),
    productCell: "",
    manufactorer: "",
    manufactorerData: [],
    inventoryNum: "",
    reason: "",

    loading: false,
  };

  async componentDidMount() {
    const searchResult = await api.executeProcedure(
      "[SalaryDB].anbar.[initial_remainders_info_search]",
      { title: "" }
    );

    this.setState({
      searchData: searchResult,
    });
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  handleSubmit(e) {
    e.preventDefault();
    if (!this.props.sessionId) {
      this.context.error("Something went wrong, try loading page");
      return;
    }

    this.setState({
      loading: true,
    });

    api
      .executeProcedure("anbar.input_initial_remainders", {
        product_id: this.state.productId ? this.state.productId : null,
        storage_id: this.context.storageId ? this.context.storageId : null,
        cluster_id: this.state.clusterId ? this.state.clusterId : 1,
        session_id: this.props.sessionId ? this.props.sessionId : null,
        barcode: this.state.barcode ? this.state.barcode : null,
        inventory_num: this.state.inventoryNum ? this.state.inventoryNum : null,
        exp_date: this.state.expDate
          ? dayjs(this.state.expDate).format("YYYY.MM.DD")
          : null,
        currency: this.state.currency ? this.state.currency : null,
        product_cell: this.state.productCell ? this.state.productCell : null,
        quantity: this.state.quantity ? this.state.quantity : null,
        price: this.state.price ? this.state.price : null,
        reason: this.state.reason ? this.state.reason : null,
      })
      .then(() => {
        this.context.success(`Əlavə edildi ${this.state.title}`);
        this.setState({
          loading: false,
          title: "",
          barcode: "",
          productId: "",
          searchData: [],
          quantity: "",
          clusterId: "",
          unit_title: "",
          price: "",
          currency: "",
          currencyData: [],
          expDate: dayjs().format("YYYY-MM-DD"),
          productCell: "",
          reason: "",
        });
      })
      .catch((err) => {
        this.context.error(err.errText);
        this.setState({
          loading: false,
        });
      });
  }
  async prepareForm(product) {
    this.setState({
      loading: true,
    });

    const currencyData = await api.executeProcedure("anbar.currency_select");

    this.setState({
      productId: product.product_id,
      title: product.title,
      barcode: product.barcode,
      currencyData,
      clusterId: product.cluster,
      unit_title: product.unit_title,
      quantity: "",
      price: "",
      currency: "",
      inventoryNum: "",
      expDate: dayjs().format("YYYY-MM-DD"),
      productCell: "",
      reason: "",
      loading: false,
    });
  }

  render() {
    return (
      <StyledForm onSubmit={this.handleSubmit.bind(this)} autoComplete="off">
        <StyledPaper elevation={3}>
          <Typography noWrap className="title" variant="h4">
            Məhsulu əlavə et
          </Typography>

          <div className="main">
            <CustomSelect
              required
              label="Məhsulun adı"
              name="title"
              value={this.state.title}
              onChange={this.handleChange.bind(this)}
            >
              {this.state.searchData.map((product) => (
                <CustomSelectItem
                  onClick={() => this.prepareForm(product)}
                  key={uuid()}
                  value={product.title}
                >
                  {product.title}
                </CustomSelectItem>
              ))}
            </CustomSelect>

            <CustomTextInput
              disabled
              label="Barkod"
              value={this.state.barcode}
            />
            {/* <CustomSelect
              required
              label="Barkod"
              name="barcode"
              value={this.state.barcode}
              onChange={this.handleChange.bind(this)}
            >
              {this.state.searchData.map((product) => (
                <CustomSelectItem
                  onClick={() => this.prepareForm(product)}
                  key={uuid()}
                  value={product.barcode}
                >
                  {product.barcode}
                </CustomSelectItem>
              ))}
            </CustomSelect> */}

            <CustomTextInput
              disabled={this.state.productId ? false : true}
              required
              type="number"
              label="Vahid qiyməti"
              name="price"
              value={this.state.price}
              onChange={this.handleChange.bind(this)}
            />

            <CustomSelect
              disabled={this.state.productId ? false : true}
              required
              label="Valyuta"
              name="currency"
              value={this.state.currency}
              onChange={this.handleChange.bind(this)}
            >
              {this.state.currencyData.map((currency) => (
                <CustomSelectItem key={uuid()} value={currency.id}>
                  {currency.full_title}
                </CustomSelectItem>
              ))}
            </CustomSelect>

            <CustomTextInput
              disabled={this.state.productId ? false : true}
              required
              type="number"
              label="Miqdar"
              name="quantity"
              value={this.state.quantity}
              onChange={this.handleChange.bind(this)}
            />

            <CustomTextInput
              disabled
              label="Ölçü vahidi"
              value={this.state.unit_title}
            />
            {/* <CustomSelect
              disabled={this.state.productId ? false : true}
              label="Ölçü vahidi"
              name="clusterId"
              value={this.state.clusterId}
              onChange={this.handleChange.bind(this)}
            >
              {this.state.clustersData.map((cluster) => (
                <CustomSelectItem key={uuid()} value={cluster.id}>
                  {cluster.title}
                </CustomSelectItem>
              ))}
            </CustomSelect> */}

            <CustomTextInput
              disabled={this.state.productId ? false : true}
              label="Yararlıq müddəti"
              name="expDate"
              type="date"
              value={this.state.expDate}
              onChange={this.handleChange.bind(this)}
            />

            <CustomTextInput
              disabled={this.state.productId ? false : true}
              label="Hücrə №"
              name="productCell"
              value={this.state.productCell}
              onChange={this.handleChange.bind(this)}
            />
            <CustomTextInput
              disabled={this.state.productId ? false : true}
              variant="outlined"
              label="Inventar №"
              name="inventoryNum"
              value={this.state.inventoryNum}
              onChange={this.handleChange.bind(this)}
            />
            <CustomTextInput
              disabled={this.state.productId ? false : true}
              variant="outlined"
              label="Səbəb..."
              name="reason"
              value={this.state.reason}
              onChange={this.handleChange.bind(this)}
            />
          </div>

          <CustomButton
            type="submit"
            variant="outlined"
            style={{ padding: "15px 35px" }}
            onClick={() => {
              if (!this.state.productId) {
                this.context.error("Select product first");
              }
            }}
          >
            Əlavə et
          </CustomButton>
        </StyledPaper>
        <Backdrop
          style={{
            zIndex: 1000,
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
          open={this.state.loading}
        >
          <CircularProgress style={{ color: "#fff" }} />
        </Backdrop>
      </StyledForm>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledForm = styled.form`
  width: 100%;
  height: 100%;
  position: relative;

  padding: 25px 45px;
`;
const StyledPaper = styled(Paper)`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;

  .main {
    width: 90%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
    grid-gap: 15px;
  }
`;
