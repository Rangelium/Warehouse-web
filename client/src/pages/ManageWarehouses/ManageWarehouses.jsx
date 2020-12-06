import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import CreateWarehouseForm from "./CreateWarehouseForm";
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

export default class ManageWarehouses extends Component {
  static contextType = GlobalDataContext;
  state = {
    newWarehouseForm: false,
    tablesData: [],
    loading: true,
  };

  componentDidMount() {
    this.getTableData();
  }
  getTableData() {
    api
      .executeProcedure("[SalaryDB].anbar.[storage_select_all_info]")
      .then((res) => this.setState({ tablesData: res, loading: false }))
      .catch((err) => console.log(err));
  }

  render() {
    return (
      <StyledSection className="pageData">
        <Header>
          <h1 className="title">Anbarın quraşdırılması</h1>

          <CustomButton
            onClick={() => this.setState({ newWarehouseForm: true })}
          >
            Yeni Anbar yarat
          </CustomButton>

          <Divider />
        </Header>

        <MainData>
          <div className="table">
            <StyledTableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center">Anbarın adı</TableCell>
                    <TableCell align="center">Anbarın tipi</TableCell>
                    <TableCell align="center">Məsul şəxs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.tablesData.map(
                    ({
                      name,
                      storage_name,
                      storage_type,
                      responsible_person,
                    }) => (
                      <TableRow key={uuid()}>
                        <TableCell align="center">{name}</TableCell>
                        <TableCell align="center">{storage_name}</TableCell>
                        <TableCell align="center">{storage_type}</TableCell>
                        <TableCell align="center">
                          {responsible_person}
                        </TableCell>
                      </TableRow>
                    )
                  )}
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
        <CreateWarehouseForm
          open={this.state.newWarehouseForm}
          close={() => {
            this.setState({
              newWarehouseForm: false,
            });
          }}
          refresh={this.getTableData.bind(this)}
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
