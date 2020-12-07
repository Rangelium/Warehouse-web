import React, { Component } from "react";
import uuid from "react-uuid";
import styled from "styled-components";
import dayjs from "dayjs";

import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@material-ui/core";

// Icons
import ArrowBackIosOutlinedIcon from "@material-ui/icons/ArrowBackIosOutlined";
import RemoveIcon from "@material-ui/icons/Remove";

export default class SingleProductInfo extends Component {
  render() {
    if (!this.props.product)
      return <SingleProduct active={this.props.active ? 1 : 0} />;

    if (this.props.product.length <= 1 && !this.props.tableData.length)
      return (
        <SingleProduct active={this.props.active ? 1 : 0}>
          <div className="row">
            <ArrowBackIosOutlinedIcon onClick={() => this.props.goBack()} />
            <h1 className="productName">{this.props.product[0]}</h1>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              height: "100%",
              width: "100%",
            }}
          >
            <h1
              style={{ color: "#000", fontSize: "3rem", marginBottom: "15px" }}
            >
              No information
            </h1>
            <p style={{ fontSize: "1.2rem" }}>Məhsul haqqında məlumat yoxdur</p>
          </div>
        </SingleProduct>
      );

    const DefaultText = 0;
    return (
      <SingleProduct active={this.props.active ? 1 : 0}>
        <div className="row">
          <ArrowBackIosOutlinedIcon onClick={() => this.props.goBack()} />
          <h1 className="productName">{this.props.productInfo.title}</h1>
        </div>
        <div className="info-blocks">
          <StyledPaper variant="outlined">
            <p className="title">Barkod</p>
            <p>
              {this.props.productInfo.barcode
                ? this.props.productInfo.barcode
                : DefaultText}
            </p>
          </StyledPaper>
          <StyledPaper variant="outlined">
            <p className="title">Ümumi daxil olunan miqdar</p>
            <p>
              {this.props.product.in_quantity
                ? `${this.props.product.in_quantity} ${this.props.product.unit_title}`
                : DefaultText}
            </p>
          </StyledPaper>
          <StyledPaper variant="outlined">
            <p className="title">Ümumi xaric olunan miqdar</p>
            <p>
              {this.props.product.out_quantity
                ? `${this.props.product.out_quantity} ${this.props.product.unit_title}`
                : DefaultText}
            </p>
          </StyledPaper>
          <StyledPaper variant="outlined">
            <p className="title">Anbardan Transfer olunan miqdar</p>
            <p>
              {this.props.product.transfer_quantity
                ? `${this.props.product.transfer_quantity} ${this.props.product.unit_title}`
                : DefaultText}
            </p>
          </StyledPaper>
          <StyledPaper variant="outlined">
            <p className="title">Orta vahid alış qiyməti</p>
            <p>
              {this.props.product.avg_price
                ? `${this.props.product.avg_price} ${this.props.product.currency}`
                : DefaultText}
            </p>
          </StyledPaper>
          <StyledPaper variant="outlined">
            <p className="title">Məhsulun ümumi dəyəri</p>
            <p>
              {this.props.product.total_sum
                ? `${this.props.product.total_sum} ${this.props.product.currency}`
                : DefaultText}
            </p>
          </StyledPaper>
          <StyledPaper variant="outlined">
            <p className="title">Silinmə</p>
            <p>
              {this.props.product.decommission_quantity
                ? `${this.props.product.decommission_quantity} ${this.props.product.unit_title}`
                : DefaultText}
            </p>
          </StyledPaper>
          <StyledPaper variant="outlined">
            <p className="title">Qalıq</p>
            <p>
              {this.props.product.left
                ? `${this.props.product.left} ${this.props.product.unit_title}`
                : DefaultText}
            </p>
          </StyledPaper>
        </div>
        <StyledTableContainer component={Paper}>
          <StyledTable stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="head">Məhsul</TableCell>
                <TableCell className="head">Miqdar</TableCell>
                <TableCell className="head">Vahid qiyməti</TableCell>
                <TableCell className="head">Ümumi qiymət</TableCell>
                <TableCell className="head">Yararlıq müddəti</TableCell>
                <TableCell className="head">Hücrə №</TableCell>
                <TableCell className="head">Fəaliyyət</TableCell>
                <TableCell className="head">Müqavilə №</TableCell>
                <TableCell className="head">Akt №</TableCell>
                <TableCell className="head">Hesab-faktura №</TableCell>
                <TableCell className="head">İnventar №</TableCell>
                <TableCell className="head">Kontragent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.tableData.map((product) => (
                <TableRow key={uuid()}>
                  <TableCell className="dataEl" align="center">
                    {product.title}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {`${product.quantity} ${product.unit_title}`}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {`${product.unit_price} ${product.currency}`}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {`${product.total_price} ${product.currency}`}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {product.exp_date ? (
                      dayjs(product.exp_date).format("YYYY-MM-DD")
                    ) : (
                      <RemoveIcon />
                    )}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {product.product_cell ? (
                      product.product_cell
                    ) : (
                      <RemoveIcon />
                    )}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {product.reason ? product.reason : <RemoveIcon />}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {product.contract_num ? (
                      product.contract_num
                    ) : (
                      <RemoveIcon />
                    )}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {product.akt_num ? product.akt_num : <RemoveIcon />}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {product.invoice_num ? product.invoice_num : <RemoveIcon />}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {product.inventory_num ? (
                      product.inventory_num
                    ) : (
                      <RemoveIcon />
                    )}
                  </TableCell>
                  <TableCell align="center" className="dataEl">
                    {product.vendor_name ? product.vendor_name : <RemoveIcon />}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow></TableRow>
            </TableBody>
          </StyledTable>
        </StyledTableContainer>
      </SingleProduct>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const SingleProduct = styled.section`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;

  opacity: ${(props) => (props.active ? 1 : 0)};
  pointer-events: ${(props) => (props.active ? "all" : "none")};
  transition: 0.3s;
  padding: 10px 15px 0 10px;

  display: flex;
  flex-direction: column;

  .row {
    display: flex;
    align-items: center;

    svg {
      cursor: pointer;
      color: #a9abac;
      transition: 0.3s;

      &:hover {
        color: #faa61a;
      }
    }

    .productName {
      flex-grow: 1;
      padding-left: 5px;
      font-size: 1.6rem;
      letter-spacing: 0.06em;
      font-weight: 600;
    }

    .MuiButton-root {
      border-color: #faa61a;
      text-transform: none;
      font-weight: normal;
      font-size: 1rem;
      margin-right: 15px;
    }
  }

  .info-blocks {
    margin-top: 10px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 10px;
  }
`;
const StyledPaper = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  flex-grow: 1;
  background-color: white;
  height: 100px;
  padding-left: 15px;

  @media (max-width: 1300px) {
    margin-right: 0;
    margin-bottom: 5px;
  }

  p {
    font-size: 1.4rem;
    font-weight: 500;
    color: #231f20;
  }

  .title {
    font-size: 0.9rem;
    font-weight: 400;
    color: #474c54;
    padding-bottom: 5px;
  }
`;
const StyledTableContainer = styled(TableContainer)`
  margin-top: 10px;
  overflow-y: scroll;
  flex-grow: 1;

  &::-webkit-scrollbar {
    width: 5px;
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
`;
const StyledTable = styled(Table)`
  .head {
    font-size: 0.9rem;
    font-weight: 400;
    text-align: center;
    color: #54585f;
  }

  .dataEl {
    font-weight: 500;
    color: #231f20;
  }
`;
