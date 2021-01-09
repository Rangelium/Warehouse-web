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
} from "@material-ui/core";

export default class NewOrderForm extends Component {
  static contextType = GlobalDataContext;
  state = {
    quantity: "",
    reason: "",
  };

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  handleSubmit(e) {
    e.preventDefault();

    this.handleClose();
    this.props.addOrder({
      ...this.props.data,
      key: uuid(),
      orderAmount: parseInt(this.state.quantity),
      reason: this.state.reason,
    });
  }
  handleClose() {
    this.props.close();
    this.setState({
      quantity: "",
      reason: "",
    });
  }

  render() {
    if (!this.props.data) return null;

    return (
      <StyledDialog
        style={{ zIndex: 21 }}
        open={this.props.open}
        onClose={this.handleClose.bind(this)}
      >
        <form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
          <DialogTitle>{this.props.data.title}</DialogTitle>

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
              ).toFixed(3)}{" "}
              {this.props.data.currency_title}
            </p>
            <CustomTextInput
              required
              type="number"
              InputProps={{
                inputProps: {
                  min: 0,
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
          </StyledContent>

          <DialogActions>
            <Divider />
            <CustomButton onClick={this.handleClose.bind(this)}>Bağla</CustomButton>
            <div className="gap" style={{ flexGrow: 1 }}></div>
            <CustomButton type="submit">Əlavə et</CustomButton>
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
    min-width: 400px;
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
`;
