import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../../../components/GlobalDataProvider";
import uuid from "react-uuid";

import FileImport from "../../../../components/FileImport";
import { CustomTextInput } from "../../../../components/UtilComponents";
import { Typography, InputAdornment, IconButton } from "@material-ui/core";

// Icons
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";

export default class FormProduct extends Component {
  static contextType = GlobalDataContext;
  constructor() {
    super();

    this.state = {
      quantity: "",
      contractNum: "",
      reason: "",

      inventoryNum: "",
      inventoryNumArr: [],
    };

    this.InvNumInputRef = React.createRef();
  }

  clearInputs() {
    this.setState({
      quantity: "",
      productCell: "",
      contractNum: "",
      reason: "",
    });
  }
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
  addInventoryNum() {
    // Clear input
    this.setState({
      inventoryNum: "",
    });
    // Check if empty
    if (!this.state.inventoryNum.trim().length) {
      return this.context.error("Inventory num cannot be empty");
    }

    // Check if needed amount selected
    if (this.state.inventoryNumArr.length === parseInt(this.state.quantity)) {
      return this.context.error("Needed amount added");
    }

    // Add to arr
    let inventoryNumArr = [...this.state.inventoryNumArr];
    inventoryNumArr.push({
      id: uuid(),
      num: this.state.inventoryNum,
    });
    this.setState(
      {
        inventoryNumArr,
      },
      () => {
        if (this.state.inventoryNumArr.length === parseInt(this.state.quantity)) {
          // this.setState({
          //   showInventory: false,
          // });
        } else {
          this.InvNumInputRef.current.focus();
        }
      }
    );
  }
  removeInventoryNum(index) {
    let inventoryNumArr = [...this.state.inventoryNumArr];

    inventoryNumArr.splice(index, 1);

    this.setState({
      inventoryNumArr,
    });
  }
  clearInvNums() {
    this.setState({
      inventoryNum: "",
      inventoryNumArr: [],
    });
  }

  render() {
    return (
      <StyledSection active={this.props.active}>
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
                inputProps: { min: 1, max: this.props.selectedProduct.left },
              }}
              label="Miqdar"
              type="number"
              name="quantity"
              value={this.state.quantity}
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

          <div className="invNums">
            <CustomTextInput
              _ref={this.InvNumInputRef}
              onKeyUp={(e) => {
                if (e.keyCode === 13) {
                  e.preventDefault();

                  this.addInventoryNum();
                }
              }}
              disabled={
                this.state.inventoryNumArr.length >= parseInt(this.state.quantity || 0)
              }
              label="Inventory number"
              name="inventoryNum"
              value={this.state.inventoryNum}
              onChange={this.handleInputsChange.bind(this)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => this.addInventoryNum()}
                    >
                      <ControlPointIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div className="invNumsContainer">
              {this.state.inventoryNumArr.map(({ id, num }, i) => (
                <div key={id} className="invNumItem">
                  <p>{num}</p>
                  <IconButton onClick={() => this.removeInventoryNum(i)}>
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </div>
              ))}
            </div>
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
      grid-gap: 10px;

      .MuiFormControl-root {
        &:first-child {
          grid-area: 1 / 1 / 2 / 3;
        }
      }
    }

    .invNums {
      padding-top: 10px;
      display: flex;
      flex-direction: column;

      .MuiInputAdornment-positionEnd {
        margin-left: 0;
      }
      .MuiOutlinedInput-adornedEnd {
        padding-right: 0;
      }

      .invNumsContainer {
        padding-top: 5px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        max-height: 160px;
        overflow-x: hidden;
        overflow-y: auto;

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

        .invNumItem {
          display: flex;
          align-items: center;

          p {
            font-size: 1.2rem;
          }
        }
      }
    }
  }

  .fileImportContainer {
    margin-top: 7px;
    flex-grow: 1;
  }
`;
