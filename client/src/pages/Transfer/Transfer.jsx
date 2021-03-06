import React, { Component } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import XLXS from "xlsx";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import CreateSessionForm from "./CreateNewSessionForm/Form";
import TransferArchive from "./TransferArchive";
import TransferTable from "./TransferTable";
import TransferForm from "./TransferForm/Form";
import PendingApprove from "./PendingApprove";
import { CustomTextInput, CustomButton } from "../../components/UtilComponents";
import {
  Tabs,
  Tab,
  Divider,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";

// Icons
import RemoveIcon from "@material-ui/icons/Remove";

export default class Transfer extends Component {
  static contextType = GlobalDataContext;
  state = {
    startDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
    endDate: dayjs().add(1, "year").format("YYYY-MM-DD"),
    transferTableData: [],
    archiveTableData: [],
    awaitedTableData: [],
    selectedSessionInfo: null, // null

    isCreateSessionFormOpen: false,

    _tabValue: 0,
    loading: true,
  };

  componentDidMount() {
    this.getTransferData();
  }
  handleChange(e) {
    if (e.target.name === "startDate" || e.target.name === "endDate") {
      this.setState(
        {
          [e.target.name]: e.target.value,
        },
        () => {
          this.getTransferData();
        }
      );

      return;
    }
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  handleTabChange(e, newVal) {
    this.setState({
      _tabValue: newVal,
    });
  }
  async getTransferData() {
    this.setState({
      loading: true,
    });

    const transferTableData = await api
      .executeProcedure("anbar.transfer_products_session_selection", {
        date_from: dayjs(this.state.startDate).format("YYYY.MM.DD"),
        date_to: dayjs(this.state.endDate).format("YYYY.MM.DD"),
        storage_id: this.context.storageId,
      })
      .catch(() => {
        return [];
      });

    const awaitedTableData = await api
      .executeProcedure("anbar.transfer_products_session_selection_acception", {
        storage_id: this.context.storageId,
      })
      .catch(() => {
        return [];
      });

    const archiveTableData = await api
      .executeProcedure("[SalaryDB].anbar.[transfer_products_archive]", {
        storage_id: this.context.storageId,
      })
      .catch(() => {
        return [];
      });

    this.setState({
      loading: false,
      transferTableData,
      archiveTableData,
      awaitedTableData,
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
          <h1 className="title">Məhsulların transferi</h1>

          {this.state._tabValue !== 2 && (
            <>
              <CustomButton
                onClick={() => {
                  this.setState({ isCreateSessionFormOpen: true });
                }}
              >
                Yeni sessiya
              </CustomButton>

              <div className="dateBlock">
                <p>Tarix:</p>
                <CustomTextInput
                  required
                  type="date"
                  variant="outlined"
                  name="startDate"
                  value={this.state.startDate}
                  onChange={this.handleChange.bind(this)}
                />
                <RemoveIcon />
                <CustomTextInput
                  required
                  type="date"
                  variant="outlined"
                  name="endDate"
                  value={this.state.endDate}
                  onChange={this.handleChange.bind(this)}
                />
              </div>
            </>
          )}
        </Header>

        <MainData>
          <div className="mainHead">
            <Tabs
              value={this.state._tabValue}
              onChange={this.handleTabChange.bind(this)}
            >
              <Tab label="Transfer" />
              <Tab label="Arxiv" />
              <Tab label="Təstiqi gözləyənlər" />
            </Tabs>

            {this.state._tabValue === 1 &&
              Boolean(this.state.archiveTableData.length) && (
                <CustomButton onClick={this.downloadArchiveExcel.bind(this)}>
                  EXCEL export
                </CustomButton>
              )}
          </div>

          <Divider />

          <TabItem hidden={this.state._tabValue !== 0}>
            <TransferTable
              showNewTransferForm={(selectedSessionInfo) =>
                this.setState({ selectedSessionInfo })
              }
              refresh={this.getTransferData.bind(this)}
              tableData={this.state.transferTableData}
            />
          </TabItem>

          <TabItem hidden={this.state._tabValue !== 1}>
            <TransferArchive tableData={this.state.archiveTableData} />
          </TabItem>

          <TabItem hidden={this.state._tabValue !== 2}>
            <PendingApprove
              refresh={this.getTransferData.bind(this)}
              tableData={this.state.awaitedTableData}
            />
          </TabItem>

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

        <TransferForm
          sessionInfo={this.state.selectedSessionInfo}
          refresh={this.getTransferData.bind(this)}
          open={Boolean(this.state.selectedSessionInfo)}
          close={() => this.setState({ selectedSessionInfo: null })}
        />
        <CreateSessionForm
          open={this.state.isCreateSessionFormOpen}
          close={() => this.setState({ isCreateSessionFormOpen: false })}
          refresh={this.getTransferData.bind(this)}
        />
      </StyledSection>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledSection = styled.section`
  // display: flex;
  // flex-direction: column;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 60px 1fr;

  .MuiTabs-root {
    padding: 0 15px 0 0;

    .MuiTab-root {
      padding: 0;
    }

    .MuiTabs-indicator {
      background-color: #ffaa00;
    }
  }
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
`;
const MainData = styled.div`
  padding: 0 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;

  .mainHead {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;
const TabItem = styled.div`
  height: 1px;
  flex-grow: 1;
  padding-top: 15px;
  padding-bottom: 10px;
`;
