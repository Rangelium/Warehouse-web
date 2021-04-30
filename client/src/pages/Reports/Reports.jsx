import React, { Component } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import {
  CustomSelect,
  CustomSelectItem,
  CustomTextInput,
  CustomButton,
} from "../../components/UtilComponents";
import { Divider, Backdrop, CircularProgress } from "@material-ui/core";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";

// Icons
import RemoveIcon from "@material-ui/icons/Remove";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import { ReactComponent as ExcelIcon } from "../../assets/excel.svg";
import { ReactComponent as HtmlIcon } from "../../assets/html.svg";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";

// *
// * GLOBALS
// *
const REPORTS_TYPES = [
  { name: "Mədaxil Report", value: "reportBuy" },
  { name: "Məxaric Report", value: "reportSale" },
  { name: "Silinmələr Report", value: "Decomission" },
  { name: "Malların dövriyəsi", value: "CommodityCirculationOfAllProducts" },
  { name: "Malın dövriyəsi", value: "CommodityCirculationOfSpecificProducts" },
];

const giveReportURL = ({
  reportType,
  reportFormat,
  startDate,
  endDate,
  storageId,
  productId,
}) => {
  switch (reportType) {
    case "reportBuy":
      return `http://127.0.0.1:8080/Reports/Report.php?ReportName=${reportType}&Format=${reportFormat}&data[dateto]=${endDate}&data[datefrom]=${startDate}&data[storageid]=${storageId}`;
    case "reportSale":
      return `http://127.0.0.1:8080/Reports/Report.php?ReportName=${reportType}&Format=${reportFormat}&data[dateto]=${endDate}&data[datefrom]=${startDate}&data[storageid]=${storageId}`;
    case "Decomission":
      return `http://127.0.0.1:8080/Reports/Report.php?ReportName=${reportType}&Format=${reportFormat}&data[dateto]=${endDate}&data[datefrom]=${startDate}&data[storageid]=${storageId}`;
    case "CommodityCirculationOfAllProducts":
      return `http://127.0.0.1:8080/Reports/Report.php?ReportName=${reportType}&Format=${reportFormat}&data[storageid]=${storageId}`;
    case "CommodityCirculationOfSpecificProducts":
      console.log(
        `http://127.0.0.1:8080/Reports/Report.php?ReportName=${reportType}&Format=${reportFormat}&data[date_to]=${endDate}&data[date_from]=${startDate}&data[storage_id]=${storageId}&data[product_id]=${productId}`
      );
      return `http://127.0.0.1:8080/Reports/Report.php?ReportName=${reportType}&Format=${reportFormat}&data[date_to]=${endDate}&data[date_from]=${startDate}&data[storage_id]=${storageId}&data[product_id]=${productId}`;

    default:
      break;
  }
};
// react-pdf setup for create-react-app src = "https://github.com/wojtekmaj/react-pdf/blob/v4.x/README.md#standard-browserify-and-others"
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default class Reports extends Component {
  static contextType = GlobalDataContext;
  state = {
    reportType: REPORTS_TYPES[0].value,
    startDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),

    selectedProductId: null,
    productInput: "",
    productIdsArr: [],

    tableName: 0,
    tablesNames: null,

    numOfPages: null,
    pdfUrl: null,
    loading: false,
    speedDealOpen: false,

    maximized: true,
  };

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
      pdfUrl: null,
      loading: false,
      selectedProductId: null,
    });
  }
  handleProductChange(e) {
    const value = e.target.value;
    if (isNaN(value)) {
      api
        .executeProcedure("[SalaryDB].anbar.[report_search_product]", {
          title: value,
        })
        .then((productIdsArr) => {
          this.setState({
            productIdsArr,
          });
        })
        .catch((err) => console.log(err.errText));
    } else {
      api
        .executeProcedure("[SalaryDB].anbar.[report_search_product]", {
          barcode: parseInt(value),
        })
        .then((productIdsArr) => {
          this.setState({
            productIdsArr,
          });
        })
        .catch((err) => console.log(err.errText));
    }

    this.setState({
      productInput: value,
    });
  }
  loadReport() {
    if (
      !this.state.selectedProductId &&
      this.state.reportType === "CommodityCirculationOfSpecificProducts"
    ) {
      return this.context.error("You need to select product!");
    }

    const url = giveReportURL({
      reportType: this.state.reportType,
      reportFormat: "PDF",
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      storageId: this.context.storageId,
      productId: this.state.selectedProductId,
    });

    if (url !== this.state.pdfUrl) {
      this.setState({
        pdfUrl: url,
        loading: true,
      });
    } else {
      this.setState(
        {
          loading: true,
          pdfUrl: null,
        },
        () => {
          this.setState({
            pdfUrl: url,
          });
        }
      );
      // this.context.error("Already loaded");
    }
  }
  downloadReport(format, ext) {
    if (
      !this.state.selectedProductId &&
      this.state.reportType === "CommodityCirculationOfSpecificProducts"
    ) {
      return this.context.error("You need to select product!");
    }

    const url = giveReportURL({
      reportType: this.state.reportType,
      reportFormat: format.toUpperCase(),
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      storageId: this.context.storageId,
      productId: this.state.selectedProductId,
    });

    axios({
      url,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Report${ext}`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => this.context.error(err.message));
  }

  render() {
    return (
      <StyledSection className="pageData">
        <ToolBar active_products={this.state.productIdsArr.length} pdfIsShowing={this.state.pdfUrl ? 1 : 0}>
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
            label="Reportun növü"
            name="reportType"
            value={this.state.reportType}
            onChange={this.handleChange.bind(this)}
          >
            {REPORTS_TYPES.map(({ name, value }) => (
              <CustomSelectItem key={value} value={value}>
                {name}
              </CustomSelectItem>
            ))}
          </CustomSelect>

          {this.state.reportType !== "Inventory" ? (
            this.state.reportType !== "CommodityCirculationOfAllProducts" && (
              <div className="dateBlock">
                <CustomTextInput
                  required
                  type="date"
                  label="Başlama tarixi"
                  name="startDate"
                  value={this.state.startDate}
                  onChange={this.handleChange.bind(this)}
                />
                <RemoveIcon />
                <CustomTextInput
                  required
                  type="date"
                  label="Bitmə tarixi"
                  name="endDate"
                  value={this.state.endDate}
                  onChange={this.handleChange.bind(this)}
                />
              </div>
            )
          ) : (
            <div className="tableNameBlock">
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
                style={{ minWidth: "260px" }}
                required
                label="Reportun adı"
                name="tableName"
                value={this.state.tableName}
                onChange={this.handleChange.bind(this)}
              >
                {this.state.tablesNames.map(({ table_name }, i) => (
                  <CustomSelectItem key={table_name + i} value={table_name}>
                    {table_name}
                  </CustomSelectItem>
                ))}
              </CustomSelect>
            </div>
          )}

          {this.state.reportType ===
            "CommodityCirculationOfSpecificProducts" && (
            <div className="selectProduct">
              <CustomTextInput
                value={this.state.productInput}
                placeholder={"Product name:"}
                onChange={this.handleProductChange.bind(this)}
              />
              <div className="foundProducts">
                {this.state.productIdsArr.map(({ title, product_id }) => (
                  <p
                    key={product_id}
                    onClick={() => {
                      this.setState({
                        productInput: title,
                        selectedProductId: product_id,
                        pdfUrl: null,
                        loading: false,
                      });
                    }}
                  >
                    {title}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="space" style={{ flexGrow: 1 }}></div>

          <CustomButton
            disabled={this.state.loading}
            onClick={this.loadReport.bind(this)}
            style={{ paddingLeft: 20, paddingRight: 20 }}
          >
            Göstər
          </CustomButton>

          <Divider />
        </ToolBar>

        <ReportContainer
          key="reportContainer"
          maxScreen={this.state.maximized ? 1 : 0}
        >
          {Boolean(this.state.pdfUrl) && (
            <Document
              key="reportDocument"
              className="pdfDocument"
              file={this.state.pdfUrl}
              loading=""
              onLoadSuccess={({ numPages }) =>
                this.setState({ loading: false, numOfPages: numPages })
              }
              onLoadError={(err) => {
                this.context.error(err.message);
                this.setState({ pdfUrl: null, loading: false });
              }}
            >
              {[...Array(this.state.numOfPages)].map((n, i) => (
                <Page pageNumber={i + 1} key={i} />
              ))}
            </Document>
          )}

          <Backdrop
            style={{
              zIndex: 1000,
              position: "absolute",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
            open={!Boolean(this.state.pdfUrl) || this.state.loading}
          >
            {!Boolean(this.state.pdfUrl) && (
              <p
                style={{
                  fontSize: "1.6rem",
                  color: "#fff",
                  userSelect: "none",
                }}
              >
                Başlamaq üçün "Göstər" düyməsinə basın
              </p>
            )}
            {this.state.loading && (
              <CircularProgress style={{ color: "#fff" }} />
            )}
          </Backdrop>
        </ReportContainer>

        <SpeedDial
          ariaLabel="SpeedDial"
          direction="up"
          icon={<SpeedDialIcon />}
          hidden={!Boolean(this.state.pdfUrl) || this.state.loading}
          onClose={() => this.setState({ speedDealOpen: false })}
          onOpen={() => this.setState({ speedDealOpen: true })}
          open={this.state.speedDealOpen}
        >
          <SpeedDialAction
            icon={<PictureAsPdfIcon />}
            tooltipTitle="PDF"
            onClick={() => {
              this.downloadReport("PDF", ".pdf");
              this.setState({ speedDealOpen: false });
            }}
          />
          <SpeedDialAction
            icon={<HtmlIcon className="MuiSvgIcon-root" />}
            tooltipTitle="HTML"
            onClick={() => {
              this.downloadReport("HTML", ".html");
              this.setState({ speedDealOpen: false });
            }}
          />
          <SpeedDialAction
            icon={<ExcelIcon className="MuiSvgIcon-root" />}
            tooltipTitle="EXCEL"
            onClick={() => {
              this.downloadReport("EXCEL", ".xls");
              this.setState({ speedDealOpen: false });
            }}
          />
          <SpeedDialAction
            icon={this.state.maximized ? <ZoomOutIcon /> : <ZoomInIcon />}
            tooltipTitle={this.state.maximized ? "Zoom out" : "Zoom in"}
            onClick={() => {
              this.setState((prevState) => {
                return { maximized: !prevState.maximized };
              });
            }}
          />
        </SpeedDial>
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

  .MuiSpeedDial-root {
    position: absolute;
    bottom: 15px;
    right: 25px;

    .MuiSpeedDial-fab {
      background-color: #ffaa00;
    }

    .MuiSpeedDial-actions {
      .MuiSpeedDialAction-fab {
        background-color: #ffaa00;

        .MuiSvgIcon-root {
          color: #231f20;
        }
      }
    }
  }
`;
const ToolBar = styled.div`
  padding: 10px 15px;
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;

  .dateBlock,
  .tableNameBlock {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
  }

  .selectProduct {
    position: relative;
    width: 270px;

    & > .MuiFormControl-root {
      width: 100%;
    }

    &:hover .foundProducts {
      opacity: ${(props) => (props.active_products ? 1 : 0)};
      pointer-events: ${(props) => (props.active_products ? "all" : "none")};
    }

    .foundProducts {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(100% - 2px);
      max-height: 280px;
      border: 1px solid rgba(0, 0, 0, 0.23);
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      z-index: 10000;
      backdrop-filter: blur(5px);
      background-color: rgba(0, 0, 0, 0.4);

      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;

      overflow-y: auto;
      overflow-x: hidden;

      &:hover {
        opacity: ${(props) => (props.active_products ? 1 : 0)};
        pointer-events: ${(props) => (props.active_products ? "all" : "none")};
      }

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

      p {
        width: 100%;
        padding: 15px;
        cursor: pointer;
        font-weight: 500;
        color: ${(props) =>
          props.pdfIsShowing ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.85)"};
        transition: transform 0.3s, color 0.3s, background-color 0.3s;

        &:hover {
          background-color: rgba(0, 0, 0, 0.2);
          /* transform: scale(1.03); */
          color: #000;
        }
      }
    }
  }

  hr {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;
const ReportContainer = styled.div`
  flex-grow: 1;
  position: relative;
  overflow: auto;
  background-color: #fff; // bg color of pdf

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
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

  .pdfDocument {
    .react-pdf__Page {
      .react-pdf__Page__canvas {
        position: relative;
        left: 50%;
        transform: translateX(-50%);

        width: ${(props) => (props.maxScreen ? "90%!important" : "unset")};
        height: ${(props) => (props.maxScreen ? "90%!important" : "unset")};
      }
    }
  }
`;
