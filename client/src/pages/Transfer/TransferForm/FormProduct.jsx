import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../../components/GlobalDataProvider";
import uuid from "react-uuid";

import FileImport from "../../../components/FileImport";
import { CustomTextInput } from "../../../components/UtilComponents";
import { Typography, InputAdornment, IconButton } from "@material-ui/core";

// Icons
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";

export default class FormProduct extends Component {
  static contextType = GlobalDataContext;
  constructor() {
    super();

    this.state = {
      inventoryNum: "",
    };

    this.InvNumInputRef = React.createRef();
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  addInventoryNum() {
    // Check if invNum is uinque
    for (let i = 0; i < this.props.invNumArr.length; i++) {
      if (Object.values(this.props.invNumArr[i]).includes(this.state.inventoryNum)) {
        return this.context.error(
          `Inventoy number "${this.state.inventoryNum}" is already exist`
        );
      }
    }

    // Check if empty
    if (!this.state.inventoryNum.trim().length) {
      return this.context.error("Inventory num cannot be empty");
    }

    // Check if needed amount selected
    if (this.props.invNumArr.length === parseInt(this.props.quantity)) {
      return this.context.error("Needed amount added");
    }

    // Add to arr
    let inventoryNumArr = [...this.props.invNumArr];
    inventoryNumArr.push({
      id: uuid(),
      num: this.state.inventoryNum,
    });

    this.props.setInvNumArr(inventoryNumArr);
    this.setState(
      {
        inventoryNum: "",
      },
      () => {
        if (this.props.invNumArr.length !== parseInt(this.props.quantity)) {
          this.InvNumInputRef.current.focus();
        }
      }
    );
  }
  removeInventoryNum(index) {
    let inventoryNumArr = [...this.props.invNumArr];

    inventoryNumArr.splice(index, 1);

    this.props.setInvNumArr(inventoryNumArr);
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
              value={this.props.quantity}
              onChange={this.props.handleChange}
            />
            <CustomTextInput
              label="Hücrə №"
              name="productCell"
              value={this.props.productCell}
              onChange={this.props.handleChange}
            />
            <CustomTextInput
              label="Müqavilə №"
              name="contractNum"
              value={this.props.contractNum}
              onChange={this.props.handleChange}
            />
            <CustomTextInput
              label="Səbəb"
              name="reason"
              value={this.props.reason}
              onChange={this.props.handleChange}
            />
          </div>

          {this.props.selectedProduct.is_inventory && (
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
                  this.props.invNumArr.length >= parseInt(this.props.quantity || 0)
                }
                label="Inventory number"
                name="inventoryNum"
                value={this.state.inventoryNum}
                onChange={this.handleChange.bind(this)}
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
                {this.props.invNumArr.map(({ id, num }, i) => (
                  <div key={id} className="invNumItem">
                    <p>{num}</p>
                    <IconButton onClick={() => this.removeInventoryNum(i)}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </div>
                ))}
              </div>
            </div>
          )}
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
