import React, { Component } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import InventoryNewSessionForm from "./InventoryNewSessionForm";
import InventoryProcessingForm from "./InventoryProcessingForm";
import InventoryWriteOffForm from "./InventoryWriteOffForm";
import { CustomButton } from "../../components/UtilComponents";
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
import RemoveIcon from "@material-ui/icons/Remove";

export default class Inventory extends Component {
  static contextType = GlobalDataContext;
  state = {
    tableData: [],
    loading: true,
    newSessionForm: false,
    selectedSessionId: null,

    processingForm: false,
    writeOffForm: false,
  };

  componentDidMount() {
    this.getTableData();
  }
  getTableData() {
    api
      .executeProcedure("[SalaryDB].anbar.[inventory_session_selection]", {
        storage_id: this.context.storageId,
      })
      .then((res) => this.setState({ tableData: res, loading: false }))
      .catch((err) => console.log(err));
  }

  render() {
    return (
      <StyledSection className="pageData">
        <Header>
          <h1 className="title">Inventorizasiya</h1>

          <CustomButton onClick={() => this.setState({ newSessionForm: true })}>
            Yeni sessiya yarat
          </CustomButton>

          <Divider />
        </Header>

        <MainData>
          <div className="table">
            <StyledTableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Yaradıliş tarixi</TableCell>
                    <TableCell align="center">Ümumi qiymət fərqi</TableCell>
                    <TableCell align="center">Ümumi kəmiyyət fərqi</TableCell>
                    <TableCell align="center">Məhsulların miqdarı</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.tableData.map(
                    ({
                      begin_date,
                      total_price_difference,
                      total_quantity_difference,
                      numberOf_products,
                      currency_title,
                      id,
                    }) => (
                      <TableRow key={uuid()}>
                        <TableCell align="center">
                          {dayjs(begin_date)
                            .subtract(4, "hour")
                            .format("YYYY-MM-DD, HH:mm")}
                        </TableCell>
                        <TableCell align="center">
                          {total_price_difference ? (
                            `${total_price_difference} ${currency_title}`
                          ) : (
                            <RemoveIcon />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {total_quantity_difference ? (
                            total_quantity_difference
                          ) : (
                            <RemoveIcon />
                          )}
                        </TableCell>
                        <TableCell align="center">{numberOf_products}</TableCell>
                        <TableCell align="center">
                          <CustomButton
                            disabled={!Boolean(numberOf_products)}
                            style={{ marginRight: 5 }}
                            onClick={() => {
                              this.setState({
                                selectedSessionId: id,
                                processingForm: true,
                              });
                            }}
                          >
                            Processing
                          </CustomButton>
                          <CustomButton
                            onClick={() => {
                              this.setState({
                                selectedSessionId: id,
                                writeOffForm: true,
                              });
                            }}
                          >
                            Write-off
                          </CustomButton>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </div>

          {this.state.newSessionForm && (
            <InventoryNewSessionForm
              open={true}
              close={() => this.setState({ newSessionForm: false })}
              refresh={this.getTableData.bind(this)}
            />
          )}

          {this.state.processingForm && (
            <InventoryProcessingForm
              open={true}
              close={() => this.setState({ processingForm: false })}
              refresh={this.getTableData.bind(this)}
              sessionId={this.state.selectedSessionId}
            />
          )}
          {this.state.writeOffForm && (
            <InventoryWriteOffForm
              open={true}
              close={() => this.setState({ writeOffForm: false })}
              refresh={this.getTableData.bind(this)}
              sessionId={this.state.selectedSessionId}
            />
          )}

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
    white-space: nowrap;
  }

  .MuiButton-root {
    text-transform: none;
    font-weight: normal;
    font-size: 1rem;
    margin-right: 15px;
    height: 100%;
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
