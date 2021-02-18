import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../../../components/GlobalDataProvider";
import uuid from "react-uuid";

import FileImport from "../../../../components/FileImport";
import { CustomTextInput } from "../../../../components/UtilComponents";
import { Typography, IconButton } from "@material-ui/core";

// Icons
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

  handleInvInputChange(e) {
    const userText = e.target.value;
    this.props.changePossibleInvNums(userText)
    this.setState({
      inventoryNum: userText,
    }
    );
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  addInventoryNum(invNum) {
    // Check if invNum is uinque
    for (let i = 0; i < this.props.invNumArr.length; i++) {
      if (Object.values(this.props.invNumArr[i]).includes(invNum)) {
        return this.context.error(
          `Inventoy number "${invNum}" is already exist`
        );
      }
    }

    // Check if empty
    if (!invNum.trim().length) {
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
      num: invNum,
    });

    this.props.setInvNumArr(inventoryNumArr);
    this.setState(
      {
        inventoryNum: "",
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
      <StyledSection active={this.props.active} invnumsactive={
        this.props.invNumArr.length < parseInt(this.props.quantity) ? 1 : 0
      }>
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
              <div className="invNumCont">
                <CustomTextInput
                  disabled={
                    this.props.invNumArr.length >= parseInt(this.props.quantity || 0)
                  }
                  label="Inventory number"
                  name="inventoryNum"
                  value={this.state.inventoryNum}
                  onChange={this.handleInvInputChange.bind(this)}
                />
                <div className="foundProducts">
                  {this.props.possibleInvNums.map(({ key, invNum }) => {
                    for (let i = 0; i < this.props.invNumArr.length; i++) {
                      if (
                        Object.values(this.props.invNumArr[i]).includes(invNum)
                      ) {
                        return null;
                      }
                    }

                    return (
                      <p
                        key={key}
                        onClick={() => {
                          this.addInventoryNum(invNum);
                        }}
                      >
                        {invNum}
                      </p>
                    );
                  })}
                </div>
              </div>

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

      .invNumCont {
        display: inherit;
        flex-direction: column;
        position: relative;
        pointer-events: ${(props) => (props.invnumsactive ? "all" : "none")};

        &:hover .foundProducts {
          opacity: 1;
          pointer-events: all;
        }

        .foundProducts {
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
          max-height: 240px;
          border: 1px solid rgba(0, 0, 0, 0.23);
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          z-index: 10;
          backdrop-filter: blur(5px);

          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;

          overflow-y: auto;
          overflow-x: hidden;

          &:hover {
            opacity: ${(props) => (props.invnumsactive ? 1 : 0)};
            pointer-events: ${(props) => (props.invnumsactive ? "all" : "none")};
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
            color: rgba(0, 0, 0, 0.7);
            transition: transform 0.3s, color 0.3s, background-color 0.3s;

            &:hover {
              background-color: rgba(0, 0, 0, 0.2);
              /* transform: scale(1.03); */
              color: #000;
            }
          }
        }
      }

      .invNumsContainer {
        padding-top: 5px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        max-height: 180px;
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
