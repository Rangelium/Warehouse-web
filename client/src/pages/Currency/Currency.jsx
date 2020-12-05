import React, { Component } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import CreateClusterForm from "./NewCurrencyForm";
import {
  CustomSelect,
  CustomSelectItem,
  CustomTextInput,
  CustomButton,
} from "../../components/UtilComponents";
import {
  Divider,
  Backdrop,
  CircularProgress,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
// Icons
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";

export default class Currency extends Component {
  static contextType = GlobalDataContext;
  state = {
    currencyTableData: [],
    currencyId: "",
    currencyData: [],
    currencyValue: "",
    currencyDate: dayjs().format("YYYY-MM-DDTHH:mm"),
    loading: true,
    newClusterForm: false,

    defaultCurrency: "",
  };

  componentDidMount() {
    this.getCurrencyData();

    this.loadDataForCurrencySelect();

    api
      .executeProcedure("anbar.currency_select_setting_value")
      .then((res) => this.setState({ defaultCurrency: res[0].id }))
      .catch((err) => console.log(err.errText));
  }

  loadDataForCurrencySelect(id = "") {
    api.executeProcedure("anbar.currency_select").then((data) => {
      this.setState({
        currencyData: data,
        currencyId: id,
      });
    });
  }

  async getCurrencyData() {
    this.setState({
      loading: true,
    });

    const currencyTableData = await api
      .executeProcedure("anbar.exchange_rate_last", {})
      .catch(() => {
        return [];
      });

    this.setState({
      loading: false,
      currencyTableData,
    });
  }

  handleChange(e) {
    if (
      e.target.name === "defaultCurrency" &&
      e.target.value !== this.state.defaultCurrency
    ) {
      api
        .executeProcedure("[SalaryDB].anbar.[settings_change_currency]", {
          id: e.target.value,
        })
        .then(() => this.context.success("Default currency changed"))
        .catch((err) => this.context.error(err.errText));
    }

    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleAddCurrency(e) {
    e.preventDefault();
    console.log(dayjs(this.state.currencyDate).format("YYYY.MM.DD HH:mm:ss"));

    api
      .executeProcedure("anbar.exchange_rate_insert", {
        currency_id: this.state.currencyId,
        value: this.state.currencyValue,
        time: dayjs(this.state.currencyDate).format("YYYY.MM.DD HH:mm"),
        user_id: this.context.userId,
      })
      .then(() => {
        this.context.success(`Added`);
        this.getCurrencyData();
        this.setState({
          currencyId: "",
          currencyValue: "",
        });
      })
      .catch((err) => {
        this.context.error(err.errText);
      });
  }

  render() {
    return (
      <StyledSection className="pageData">
        <Header>
          <h1 className="title">Məzənnə</h1>
          <Divider />
        </Header>
        <MainData>
          <div className="row">
            <form
              className="addCurrencyForm"
              onSubmit={this.handleAddCurrency.bind(this)}
              autoComplete="off"
            >
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
                style={{ minWidth: "240px" }}
                required
                label="Valyuta"
                name="currencyId"
                value={this.state.currencyId}
                onChange={this.handleChange.bind(this)}
              >
                {this.state.currencyData.map((product) => (
                  <CustomSelectItem key={uuid()} value={product.id}>
                    {product.full_title}
                  </CustomSelectItem>
                ))}
                <CustomSelectItem style={{}} value="">
                  <CustomButton
                    style={{ width: "100%" }}
                    onClick={() => {
                      this.setState({
                        newClusterForm: true,
                      });
                    }}
                  >
                    Əlavə et
                  </CustomButton>
                </CustomSelectItem>
              </CustomSelect>

              <CustomTextInput
                required
                type="integer"
                variant="outlined"
                label="Dəyər"
                name="currencyValue"
                value={this.state.currencyValue}
                onChange={this.handleChange.bind(this)}
              />

              <CustomTextInput
                required
                variant="outlined"
                label="Tarix"
                name="currencyDate"
                type="datetime-local"
                defaultValue={this.state.currencyDate}
                onChange={this.handleChange.bind(this)}
              />

              <CustomButton type="submit" variant="outlined" style={{ height: "100%" }}>
                <AddCircleOutlineOutlinedIcon style={{ transform: "scale(1.3)" }} />
              </CustomButton>
            </form>

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
              style={{ minWidth: "240px" }}
              label="Default currency"
              name="defaultCurrency"
              value={this.state.defaultCurrency}
              onChange={this.handleChange.bind(this)}
            >
              {this.state.currencyData.map(({ id, full_title }) => (
                <CustomSelectItem key={uuid()} value={id}>
                  {full_title}
                </CustomSelectItem>
              ))}
            </CustomSelect>
          </div>

          <div className="table">
            <StyledTableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Adı</TableCell>
                    <TableCell align="center">Dəyər</TableCell>
                    <TableCell align="center">Tarix</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.currencyTableData.map((currency) => (
                    <TableRow key={uuid()}>
                      <TableCell align="center">{currency.title}</TableCell>
                      <TableCell align="center">{currency.value}</TableCell>
                      <TableCell align="center">
                        {dayjs(currency.time)
                          .subtract(4, "hour")
                          .format("DD MMMM YYYY, HH:mm:ss")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </div>

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
        </MainData>

        <CreateClusterForm
          open={this.state.newClusterForm}
          close={() => {
            this.setState({
              newClusterForm: false,
            });
          }}
          setCluster={(currencyId) => {
            this.loadDataForCurrencySelect(currencyId);
          }}
        />
      </StyledSection>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
`;
const Header = styled.div`
  padding: 10px 15px;
  display: flex;
  align-items: center;
  position: relative;

  .title {
    font-size: 1.9rem;
    font-weight: 500;
    color: #231f20;
    flex-grow: 1;
  }

  .MuiButton-root {
    border-color: #faa61a;
    text-transform: none;
    font-weight: normal;
    font-size: 1rem;
    margin-right: 15px;
    height: 100%;
  }

  .dateBlock {
    display: flex;
    align-items: center;

    p {
      margin-right: 10px;
    }

    .MuiSvgIcon-root {
      margin: 0 7px;
    }

    .MuiOutlinedInput-input {
      padding: 12px 14px;
    }
  }

  hr {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;
const MainData = styled.div`
  padding: 0 15px;
  flex-grow: 1;
  position: relative;
  display: flex;
  flex-direction: column;

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;

    .addCurrencyForm {
      height: 100%;
      width: 800px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .table {
    height: 1px;
    flex-grow: 1;
    padding: 15px 0 10px 0;
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
