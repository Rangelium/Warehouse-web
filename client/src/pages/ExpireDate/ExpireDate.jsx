import React, { Component } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import XLXS from "xlsx";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import ExpDateOverTable from "./ExpDateTable";
import ArchiveTable from "./ExpireDateArchive";
import { CustomButton } from "../../components/UtilComponents";
import { Tabs, Tab, Divider, Backdrop, CircularProgress } from "@material-ui/core";

export default class ExpireDate extends Component {
  static contextType = GlobalDataContext;
  state = {
    expDateTableData: [],
    archiveTableData: [],
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
      archiveTableData: archiv,
      loading: false,
    });
  }
  handleTabChange(e, newVal) {
    this.setState({
      _tabValue: newVal,
    });
  }
  downloadArchiveExcel() {
    const wb = XLXS.utils.book_new();

    wb.Props = {
      Title: "Transfer arxiv",
      Subject: "Transfer arxiv",
      Author: "Warehouse",
      CreatedDate: dayjs().format("YYYY-MM-DD"),
    };

    wb.SheetNames.push("Archive");

    const cols = [
      "Məhsul",
      "Barkod",
      "Miqdar",
      "Ümumi Qiymət",
      "Anbar",
      "Transfer olunan anbara",
      "Transfer tarixi",
      "File",
    ];
    const data = [
      cols,
      ...this.state.archiveTableData.map((el) => {
        let arr = [
          el.product_title,
          el.barcode || "No info",
          `${el.quantity} ${el.unit_title}`,
          `${el.total_sum} ${el.currency}`,
          el.storage_from,
          el.storage_to,
          dayjs(el.transfered_date).format("YYYY-MM-DD"),
        ];

        if (el.document_num_path) {
          arr.push(
            `${this.context.baseURL}/downloadFile/?fileName=${el.document_num_path}`
          );
        } else {
          arr.push("No file");
        }

        return arr;
      }),
    ];

    wb.Sheets[wb.SheetNames[0]] = XLXS.utils.aoa_to_sheet(data);
    XLXS.writeFile(wb, "transfer.xls");
  }

  render() {
    return (
      <StyledSection className="pageData">
        <Header>
          <h1 className="title">Yararlıq müddəti keçmiş məhsullar</h1>
        </Header>
        <MainData>
          <div className="mainHead">
            <Tabs value={this.state._tabValue} onChange={this.handleTabChange.bind(this)}>
              <Tab label="Təstiq gözləyənlər" />
              <Tab label="Arxiv" />
            </Tabs>

            {this.state._tabValue === 1 &&
              Boolean(this.state.archiveTableData.length) && (
                <CustomButton onClick={this.downloadArchiveExcel.bind(this)}>
                  Download
                </CustomButton>
              )}
          </div>
          <Divider />

          <TabItem hidden={this.state._tabValue !== 0}>
            <ExpDateOverTable
              refresh={this.getData.bind(this)}
              tableData={this.state.expDateTableData}
            />
          </TabItem>

          <TabItem hidden={this.state._tabValue !== 1}>
            <ArchiveTable tableData={this.state.archiveTableData} />
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

  .mainHead {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .MuiTabs-root {
      .MuiTab-root {
        padding: 0;
      }

      .MuiTabs-indicator {
        background-color: #ffaa00;
      }
    }
  }
`;
const TabItem = styled.div`
  height: 1px;
  flex-grow: 1;
  padding: 15px 0 10px 0;
`;
