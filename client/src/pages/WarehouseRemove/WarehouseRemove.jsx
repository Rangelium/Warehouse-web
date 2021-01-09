import React, { Component } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import XLXS from "xlsx";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import WarehouseRemoveArchive from "./WarehouseRemoveArchive";
import WarehouseRemoveTable from "./WarehouseRemoveTable";
import OrderForm from "./OrderProducts/Form";
import { CustomButton } from "../../components/UtilComponents";
import { Tabs, Tab, Divider, Backdrop, CircularProgress } from "@material-ui/core";

export default class WarehouseRemove extends Component {
  static contextType = GlobalDataContext;
  state = {
    procurementTableData: [],
    archiveTableData: [],

    _tabValue: 0,
    loading: true,

    showOrderForm: false,
  };

  async componentDidMount() {
    this.getProcurementsData();

    // Finish all unfinished retailSessions if existed
    const data = localStorage.getItem("WarehouseRemoveUnfinishedRetailSessions");
    const arr = JSON.parse(data);

    if (arr) {
      await Promise.all(
        arr.map((id) =>
          api
            .executeProcedure(
              "[SalaryDB].anbar.[order_request_session_delete_onPopupClose]",
              {
                retail_sale_session_id: id,
              }
            )
            .catch((err) => console.log(err.errText))
        )
      );

      localStorage.removeItem("WarehouseRemoveUnfinishedRetailSessions");
    }
  }
  handleTabChange(e, newVal) {
    this.setState({
      _tabValue: newVal,
    });
  }
  async getProcurementsData() {
    this.setState({
      loading: true,
    });

    const procurementTableData = await api
      .executeProcedure("[SalaryDB].procurement.[orders_for_warehouse]", {
        result: 0,
        structure_id: this.context.userData.structureid,
      })
      .catch(() => {
        return [];
      });

    const archiveTableData = await api
      .executeProcedure("[SalaryDB].anbar.[order_request_archive]", {
        storage_id: this.context.storageId,
      })
      .catch(() => {
        return [];
      });

    this.setState({
      loading: false,
      procurementTableData,
      archiveTableData,
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
  showOrderProductsForm() {
    this.setState({
      showOrderForm: true,
    });
  }

  render() {
    return (
      <StyledSection className="pageData">
        <Header>
          <h1 className="title">Məxaric</h1>
        </Header>

        <MainData>
          <div className="mainHead">
            <Tabs value={this.state._tabValue} onChange={this.handleTabChange.bind(this)}>
              <Tab label="Təstiq gözləyənlər" />
              <Tab label="Arxiv" />
            </Tabs>

            {this.state._tabValue === 0 && (
              <CustomButton onClick={this.showOrderProductsForm.bind(this)}>
                Order Products
              </CustomButton>
            )}
            {this.state._tabValue === 1 &&
              Boolean(this.state.archiveTableData.length) && (
                <CustomButton onClick={this.downloadArchiveExcel.bind(this)}>
                  Download
                </CustomButton>
              )}
          </div>

          <Divider />

          <TabItem hidden={this.state._tabValue !== 0}>
            <WarehouseRemoveTable
              // showNewTransferForm={(data) => this.setState({ selectedSessionInfo: data })}
              refresh={this.getProcurementsData.bind(this)}
              tableData={this.state.procurementTableData}
            />

            <OrderForm
              open={this.state.showOrderForm}
              close={() => this.setState({ showOrderForm: false })}
            />
          </TabItem>

          <TabItem hidden={this.state._tabValue !== 1}>
            <WarehouseRemoveArchive tableData={this.state.archiveTableData} />
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
