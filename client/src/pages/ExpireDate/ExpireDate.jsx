import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import ExpDateOverTable from "./ExpDateTable";
import ArchiveTable from "./ExpireDateArchive";
import { Tabs, Tab, Divider, Backdrop, CircularProgress } from "@material-ui/core";

export default class ExpireDate extends Component {
  static contextType = GlobalDataContext;
  state = {
    expDateTableData: [],
    archivTableData: [],
    loading: true,

    _tabValue: 0,
  };

  componentDidMount() {
    this.getData();
  }
  async getData() {
    if (!this.state.loading) {
      this.setState({
        loading: true,
      });
    }
    const expDate = await api.executeProcedure("anbar.exp_date_over", {
      storage_id: this.context.storageId,
    });

    const archiv = await api.executeProcedure("anbar.exp_date_archive", {
      storage_id: this.context.storageId,
    });

    this.setState({
      expDateTableData: expDate,
      archivTableData: archiv,
      loading: false,
    });
  }
  handleTabChange(e, newVal) {
    this.setState({
      _tabValue: newVal,
    });
  }

  render() {
    return (
      <StyledSection className="pageData">
        <Header>
          <h1 className="title">Yararlıq müddəti keçmiş məhsullar</h1>
        </Header>
        <MainData>
          <Tabs value={this.state._tabValue} onChange={this.handleTabChange.bind(this)}>
            <Tab label="Təstiq gözləyənlər" />
            <Tab label="Arxiv" />
          </Tabs>
          <Divider />
          <TabItem hidden={this.state._tabValue !== 0}>
            <ExpDateOverTable
              refresh={this.getData.bind(this)}
              tableData={this.state.expDateTableData}
            />
          </TabItem>
          <TabItem hidden={this.state._tabValue !== 1}>
            <ArchiveTable tableData={this.state.archivTableData} />
          </TabItem>
        </MainData>
        <Backdrop
          style={{
            zIndex: 100000000,
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
          open={this.state.loading}
        >
          <CircularProgress style={{ color: "#fff" }} />
        </Backdrop>
      </StyledSection>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledSection = styled.section`
  padding: 10px 15px 0 15px;
  display: flex;
  flex-direction: column;
`;
const Header = styled.div`
  display: flex;
  align-items: center;

  .title {
    font-size: 1.9rem;
    font-weight: 500;
    color: #231f20;
    flex-grow: 1;
  }
`;
const MainData = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-top: 10px;

  .MuiTabs-root {
    .MuiTab-root {
      padding: 0;
    }

    .MuiTabs-indicator {
      background-color: #ffaa00;
    }
  }
`;
const TabItem = styled.div`
  height: 1px;
  flex-grow: 1;
  padding: 15px 0 10px 0;
`;
