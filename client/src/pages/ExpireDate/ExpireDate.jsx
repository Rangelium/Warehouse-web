import React, { Component } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import XLXS from "xlsx";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

// import ExpDateOverTable from "./ExpDateTable";
import ArchiveTable from "./ExpireDateArchive";
import WriteOffPage from "./WriteOff/WriteOffPage";
import { CustomButton, CustomTextInput } from "../../components/UtilComponents";
import { Tabs, Tab, Divider, Backdrop, CircularProgress } from "@material-ui/core";

// Icons
import RemoveIcon from "@material-ui/icons/Remove";

export default class ExpireDate extends Component {
  static contextType = GlobalDataContext;
  state = {
    startDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
    endDate: dayjs().add(1, "year").format("YYYY-MM-DD"),
    writeOffTableData: [],

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

    const writeOffTableData = await api
      .executeProcedure("[SalaryDB].anbar.[decommission_session_selection]", {
        date_from: dayjs(this.state.startDate).format("YYYY.MM.DD"),
        date_to: dayjs(this.state.endDate).format("YYYY.MM.DD"),
        storage_id: this.context.storageId,
      })
      .catch(() => {
        return [];
      });

    this.setState({
      expDateTableData: expDate,
      archiveTableData: archiv.reverse(),
      writeOffTableData,
      loading: false,
    });
  }
  async getDecommisionData() {
    const writeOffTableData = await api
      .executeProcedure("[SalaryDB].anbar.[decommission_session_selection]", {
        date_from: dayjs(this.state.startDate).format("YYYY.MM.DD"),
        date_to: dayjs(this.state.endDate).format("YYYY.MM.DD"),
        storage_id: this.context.storageId,
      })
      .catch(() => {
        return [];
      });

    this.setState({
      writeOffTableData,
    });
  }
  handleTabChange(e, newVal) {
    this.setState({
      _tabValue: newVal,
    });
  }
  handleChange(e) {
    if (e.target.name === "startDate" || e.target.name === "endDate") {
      this.setState(
        {
          [e.target.name]: e.target.value,
        },
        () => {
          this.getDecommisionData();
        }
      );

      return;
    }
    this.setState({
      [e.target.name]: e.target.value,
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
  createNewSession() {
    api
      .executeProcedure("[SalaryDB].anbar.[decommission_products_create_session]", {
        storage_id: this.context.storageId,
      })
      .then(() => {
        this.context.success("Sessiya yaradıldı");
        this.getDecommisionData();
      })
      .catch((err) => this.context.error(err.errText));
  }

  render() {
    return (
      <StyledSection className="pageData">
        <Header>
          <h1 className="title">Yararlılıq müddəti keçmiş məhsullar</h1>
        </Header>

        <MainData>
          <div className="mainHead">
            <Tabs value={this.state._tabValue} onChange={this.handleTabChange.bind(this)}>
              {/* <Tab label="Təstiq gözləyənlər" /> */}
              <Tab label="Silinmə" />
              <Tab label="Arxiv" />
            </Tabs>

            {this.state._tabValue === 1 &&
              Boolean(this.state.archiveTableData.length) && (
                <CustomButton onClick={this.downloadArchiveExcel.bind(this)}>
                  EXCEL export
                </CustomButton>
              )}

            {this.state._tabValue === 0 && (
              <div className="decommisionPart">
                <CustomButton
                  onClick={() => {
                    this.context
                      .alert({
                        title: "Yeni sessiya yarat",
                        description: "Yeni bir sessiya yaratmaq istədiyinizə əminsiniz??",
                      })
                      .then(() => this.createNewSession())
                      .catch(() => {});
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
              </div>
            )}
          </div>
          <Divider />

          {/* <TabItem hidden={this.state._tabValue !== 0}>
            <ExpDateOverTable
              refresh={this.getData.bind(this)}
              tableData={this.state.expDateTableData}
            />
          </TabItem> */}

          <TabItem hidden={this.state._tabValue !== 0}>
            <WriteOffPage
              totalRefresh={this.getData.bind(this)}
              refresh={this.getDecommisionData.bind(this)}
              tableData={this.state.writeOffTableData}
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

    .decommisionPart {
      display: flex;

      .MuiButton-root {
        margin-right: 10px;
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
    }
  }
`;
const TabItem = styled.div`
  height: 1px;
  flex-grow: 1;
  padding: 15px 0 10px 0;
`;
