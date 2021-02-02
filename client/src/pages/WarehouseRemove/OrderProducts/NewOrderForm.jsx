import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../../components/GlobalDataProvider";
import uuid from "react-uuid";

import { CustomButton, CustomTextInput } from "../../../components/UtilComponents";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
} from "@material-ui/core";

// Icons
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";

export default class NewOrderForm extends Component {
  static contextType = GlobalDataContext;
  constructor() {
    super();
    this.state = {
      quantity: "",
      reason: "",

      inventoryNum: "",
      inventoryNumArr: [],

      _CRUTCH_checkedForEdit: false,
    };

    this.InvNumInputRef = React.createRef();
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  handleSubmit(e) {
    e.preventDefault();

    if (
      this.props.data.is_service &&
      parseInt(this.state.quantity) !== this.state.inventoryNumArr.length
    ) {
      return this.context.error(
        `You need to create ${
          parseInt(this.state.quantity) - this.state.inventoryNumArr.length
        } inventory numbers`
      );
    }

    this.handleClose();
    if (this.props.data.editMode) {
      this.props.editOrder({
        ...this.props.data,
        orderAmount: parseInt(this.state.quantity),
        reason: this.state.reason,
      });
    } else {
      const key = uuid();
      this.props.addOrder({
        ...this.props.data,
        key,
        orderAmount: parseInt(this.state.quantity),
        reason: this.state.reason,
        invNums: this.state.inventoryNumArr,
      });
    }
  }
  handleClose() {
    this.props.close();
    this.setState({
      quantity: "",
      reason: "",
      inventoryNumArr: [],

      _CRUTCH_checkedForEdit: false,
    });
  }
  addInventoryNum() {
    // Check if invNum is uinque
    for (let i = 0; i < this.state.inventoryNumArr.length; i++) {
      if (
        Object.values(this.state.inventoryNumArr[i]).includes(this.state.inventoryNum)
      ) {
        return this.context.error(
          `Inventoy number "${this.state.inventoryNum}" is already exist`
        );
      }
    }

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
    inventoryNumArr.push(this.state.inventoryNum);
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

  render() {
    if (!this.props.data) return null;

    if (this.props.data.editMode && !this.state._CRUTCH_checkedForEdit) {
      this.setState({
        quantity: this.props.data.orderAmount,
        reason: this.props.data.reason || "",

        _CRUTCH_checkedForEdit: true,
      });
    }

    return (
      <StyledDialog
        style={{ zIndex: 21 }}
        open={this.props.open}
        onClose={this.handleClose.bind(this)}
      >
        <form
          autoComplete="off"
          onSubmit={this.handleSubmit.bind(this)}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              e.preventDefault();
            }
          }}
        >
          <DialogTitle
            title={this.props.data.title.length > 35 ? this.props.data.title : ""}
          >
            {this.props.data.title.length > 35
              ? this.props.data.title.slice(0, 35) + "..."
              : this.props.data.title}
          </DialogTitle>

          <StyledContent>
            <p>
              Approximate price: {this.props.data.setting_price}{" "}
              {this.props.data.currency_title}
            </p>
            <p>
              Order price:{" "}
              {(
                parseInt(this.state.quantity || 0) *
                parseFloat(this.props.data.setting_price)
              ).toFixed(2)}{" "}
              {this.props.data.currency_title}
            </p>
            <CustomTextInput
              required
              type="number"
              InputProps={{
                inputProps: {
                  min: 1,
                },
              }}
              name="quantity"
              value={this.state.quantity}
              onChange={this.handleChange.bind(this)}
              placeholder="Order amount:"
            />
            <CustomTextInput
              name="reason"
              value={this.state.reason}
              onChange={this.handleChange.bind(this)}
              placeholder="Comment:"
            />

            {this.props.data.is_service && (
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
                    this.state.inventoryNumArr.length >=
                    parseInt(this.state.quantity || 0)
                  }
                  label="Inventory number"
                  name="inventoryNum"
                  value={this.state.inventoryNum}
                  onChange={this.handleChange.bind(this)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          disabled={
                            this.state.inventoryNumArr.length >=
                            parseInt(this.state.quantity || 0)
                          }
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
                  {this.state.inventoryNumArr.map((num, i) => (
                    <div key={num} className="invNumItem">
                      <p>{num}</p>
                      <IconButton onClick={() => this.removeInventoryNum(i)}>
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </StyledContent>

          <DialogActions>
            <Divider />
            <CustomButton onClick={this.handleClose.bind(this)}>Bağla</CustomButton>
            <div className="gap" style={{ flexGrow: 1 }}></div>
            <CustomButton type="submit">
              {this.props.data.editMode ? "Edit" : "Əlavə et"}
            </CustomButton>
          </DialogActions>
        </form>
      </StyledDialog>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledDialog = styled(Dialog)`
  .MuiDialog-container > .MuiPaper-root {
    /* min-width: 400px; */
    width: 550px;
    /* width: 350px; */
    /* height: 400px; */

    form {
      width: 100%;
      height: 100%;

      display: grid;
      grid-template-columns: 100%;
      grid-template-rows: 70px 1fr auto;
    }
  }

  .MuiDialogTitle-root {
    background-color: #f5f5f5;

    .MuiTypography-root {
      font-size: 1.6rem;
    }
  }

  .MuiDialogActions-root {
    padding: 8px;
    position: relative;

    hr {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
  }
`;
const StyledContent = styled(DialogContent)`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .MuiFormControl-root {
    width: 100%;
  }

  .invNums {
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
`;
