import React, { Component } from "react";
import styled from "styled-components";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

// ? @param Options object
// ?	{
// ? 		title: String , description: String
// ?  }
// ?
export default class AlertDialog extends Component {
  state = {
    title: "",
    description: "",
  };

  fillData() {
    this.setState({
      title: this.props.title,
      description: this.props.description,
    });
  }

  render() {
    return (
      <StyledDialog
        style={{ zIndex: 21474836470 }}
        open={this.props.open}
        onClose={() => this.props.onClose()}
      >
        <DialogTitle>{this.state.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{this.state.description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <StyledButton
            variant="contained"
            submit={1}
            onClick={() => this.props.onSubmit()}
          >
            {this.state.title}
          </StyledButton>
          <StyledButton variant="contained" onClick={() => this.props.onClose()}>
            İmtina
          </StyledButton>
        </DialogActions>
      </StyledDialog>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    padding-bottom: 10px;
  }

  .MuiDialogTitle-root {
    background-color: #f5f5f5;

    .MuiTypography-root {
      font-size: 1.6rem;
    }
  }

  .MuiDialogContent-root {
    .MuiTypography-root {
      color: #231f20;
    }
  }

  .MuiDialogActions-root {
    padding: 8px 24px;
    justify-content: flex-start;
  }
`;
const StyledButton = styled(Button)`
  background-color: ${(props) => (props.submit ? "red" : "#D7D8D6")};
  color: ${(props) => (props.submit ? "white" : "")};
  text-transform: capitalize;

  &:hover {
    background-color: ${(props) => (props.submit ? "red" : "")};
  }
`;
