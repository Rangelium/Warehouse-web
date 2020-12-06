import React, { Component } from "react";
import styled from "styled-components";

import FileImport from "../../components/FileImport";
import { CustomTextInput } from "../../components/UtilComponents";
import { Typography, Divider } from "@material-ui/core";

export default class NewTransferTransferInfo extends Component {
  state = {
    quantity: "",
    productCell: "",
    contractNum: "",
    reason: "",
  };

  handleInputsChange(e) {
    this.setState(
      {
        [e.target.name]: e.target.value,
      },
      () => {
        this.props.setTransefInfo(this.state);
      }
    );
  }

  render() {
    return (
      <StyledSection active={this.props.active}>
        <Divider />
        <div className="transferInfo">
          <Typography noWrap variant="h4" className="title">
            {this.props.selectedProduct.product_title}
          </Typography>

          <Typography noWrap variant="body1" className="path">
            <Typography variant="caption" noWrap className="path-data">
              {this.props.path.category}
            </Typography>
            {">"}
            <Typography variant="caption" noWrap className="path-data">
              {this.props.path.subCategory}
            </Typography>
          </Typography>

          <div className="data">
            <CustomTextInput
              required
              InputProps={{
                inputProps: { min: 0, max: this.props.selectedProduct.left },
              }}
              label="Miqdar"
              type="number"
              name="quantity"
              value={this.state.quantity}
              onChange={this.handleInputsChange.bind(this)}
            />
            <CustomTextInput
              label="Hücrə №"
              name="productCell"
              value={this.state.productCell}
              onChange={this.handleInputsChange.bind(this)}
            />
            <CustomTextInput
              label="Müqavilə №"
              name="contractNum"
              value={this.state.contractNum}
              onChange={this.handleInputsChange.bind(this)}
            />
            <CustomTextInput
              label="Səbəb"
              name="reason"
              value={this.state.reason}
              onChange={this.handleInputsChange.bind(this)}
            />
          </div>
        </div>
        <div className="fileImportContainer">
          <FileImport file={this.props.file} setFile={this.props.setFile} />
        </div>
      </StyledSection>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledSection = styled.div`
  display: ${(props) => (props.active ? "flex" : "none")};
  flex-direction: column;
  flex-grow: 1;
  position: relative;

  hr {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .transferInfo {
    width: 100%;

    .title {
      margin-top: 5px;
    }

    .path {
      .path-data {
        margin: 0 5px;
        font-size: 1rem;
        font-weight: 600;
        line-height: 1.5;
        letter-spacing: 0.00938em;
      }
    }

    .data {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      grid-gap: 15px;
    }
  }

  .fileImportContainer {
    margin-top: 7px;
    flex-grow: 1;
  }
`;
