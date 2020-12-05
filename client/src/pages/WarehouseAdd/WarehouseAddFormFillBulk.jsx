import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";
import uuid from "react-uuid";
import dayjs from "dayjs";

import {
  CustomTextInput,
  CustomSelect,
  CustomSelectItem,
} from "../../components/UtilComponents";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";

export default class WarehouseAddFormFillBulk extends Component {
  static contextType = GlobalDataContext;
  state = {
    tableInputs: this.createTableInputs(),
    currencyData: [],
    clustersData: [],
  };

  async componentDidMount() {
    const currencyData = await api
      .executeProcedure("anbar.currency_select")
      .catch((err) => console.log(err.errText));

    const clustersData = await api.executeProcedure(
      "[SalaryDB].anbar.[cluster_names_select_all]"
    );

    this.setState({ currencyData, clustersData });
  }
  handleChange(e) {
    this.setState({
      tableInputs: {
        ...this.state.tableInputs,
        [e.target.name]: e.target.value,
      },
    });
  }
  createTableInputs() {
    let obj = {};

    this.props.tableData.forEach((el, i) => {
      obj = {
        [`price${i}`]: this.props.tableData[i].approx_price,
        [`currency${i}`]: "",
        [`clusterId${i}`]: "",
        [`productCell${i}`]: "",
        [`expDate${i}`]: dayjs().add("3", "month").format("YYYY-MM-DD"),
        [`inventoryNum${i}`]: "",
        ...obj,
      };
    });

    return obj;
  }

  render() {
    return (
      <StyledSection active={this.props.active}>
        <StyledTableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">Məhsull</TableCell>
                <TableCell align="center">Barkod</TableCell>
                <TableCell align="center">Ölçü vahidi</TableCell>
                <TableCell align="center">Kəmiyyət</TableCell>
                <TableCell align="center">Qiymət</TableCell>
                <TableCell align="center">Valyuta</TableCell>
                <TableCell align="center">Hüceyrə nömrəsi</TableCell>
                <TableCell align="center">Yararlılıq müddəti</TableCell>
                <TableCell align="center">İnventar №</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.tableData.map((el, i) => (
                <TableRow key={`${el.title}${i}`}>
                  <TableCell align="center">{el.title}</TableCell>
                  <TableCell align="center">{el.barcode}</TableCell>
                  <TableCell align="center">
                    <CustomSelect
                      label=""
                      className="cstmInput"
                      style={{ width: 80 }}
                      name={`clusterId${i}`}
                      value={this.state.tableInputs[`clusterId${i}`]}
                      onChange={this.handleChange.bind(this)}
                    >
                      {this.state.clustersData.map((cluster) => (
                        <CustomSelectItem key={uuid()} value={cluster.id}>
                          {cluster.title}
                        </CustomSelectItem>
                      ))}
                    </CustomSelect>
                  </TableCell>
                  <TableCell align="center">{el.amount}</TableCell>
                  <TableCell align="center">
                    <CustomTextInput
                      style={{ width: 100 }}
                      type="number"
                      name={`price${i}`}
                      value={this.state.tableInputs[`price${i}`]}
                      onChange={this.handleChange.bind(this)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <CustomSelect
                      label=""
                      className="cstmInput"
                      style={{ width: 80 }}
                      name={`currency${i}`}
                      value={this.state.tableInputs[`currency${i}`]}
                      onChange={this.handleChange.bind(this)}
                    >
                      {this.state.currencyData.map(({ id, title }) => (
                        <CustomSelectItem key={uuid()} value={id}>
                          {title}
                        </CustomSelectItem>
                      ))}
                    </CustomSelect>
                  </TableCell>
                  <TableCell align="center">
                    <CustomTextInput
                      style={{ width: 90 }}
                      name={`productCell${i}`}
                      value={this.state.tableInputs[`productCell${i}`]}
                      onChange={this.handleChange.bind(this)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <CustomTextInput
                      style={{ width: 180 }}
                      type="date"
                      name={`expDate${i}`}
                      value={this.state.tableInputs[`expDate${i}`]}
                      onChange={this.handleChange.bind(this)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <CustomTextInput
                      style={{ width: 90 }}
                      name={`inventoryNum${i}`}
                      value={this.state.tableInputs[`inventoryNum${i}`]}
                      onChange={this.handleChange.bind(this)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </StyledSection>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledSection = styled.div`
  flex-grow: 1;
  display: ${(props) => (props.active ? "flex" : "none")};
  flex-direction: column;

  .table {
    height: 1px;
    flex-grow: 1;
    border-left: 1px solid rgba(224, 224, 224, 1);
    border-right: 1px solid rgba(224, 224, 224, 1);
    border-bottom: 1px solid rgba(224, 224, 224, 1);
  }
`;
const StyledTableContainer = styled(TableContainer)`
  overflow-y: auto;
  max-height: 400px;
  /* padding: 0 10px; */

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

  td {
    padding: 5px;
  }
  .cstmInput {
    .MuiOutlinedInput-input {
      min-width: unset;
      text-align: left;
      padding-left: 7px;
    }
  }
`;
