import React, { Component } from "react";
import styled from "styled-components";

import { CustomButton } from "./UtilComponents";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";

export default class InvNums extends Component {
  render() {
    return (
      <StyledDialog
        style={{ zIndex: 21474836470 }}
        open={this.props.open}
        onClose={this.props.close}
      >
        <DialogTitle>Inventory numbers</DialogTitle>

        <DialogContent>
          <ol>
            {this.props.invNums.map(({ inventory_num, key }, i) => (
              <li key={key}>
                {i + 1}) <span>{inventory_num}</span>
              </li>
            ))}
          </ol>
        </DialogContent>

        <DialogActions>
          <CustomButton onClick={() => this.props.close()}>Bağla</CustomButton>
        </DialogActions>
      </StyledDialog>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledDialog = styled(Dialog)`
  .MuiDialogTitle-root {
    background-color: #f5f5f5;

    .MuiTypography-root {
      font-size: 1.6rem;
    }
  }

  .MuiDialogContent-root {
    padding: 5px 10px;
    overflow-y: auto;

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

    ol {
      li {
        font-size: 1.3rem;
        padding: 5px 0;

        span {
          font-size: 1.4rem;
          font-weight: 600;
        }
      }
    }
  }

  .MuiDialogActions-root {
    /* padding: 8px 24px; */
    justify-content: flex-start;
  }
`;
