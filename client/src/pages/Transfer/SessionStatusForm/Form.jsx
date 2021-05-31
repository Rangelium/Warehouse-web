import React, { Component } from "react";
import styled from "styled-components";

import { CustomButton } from "../../../components/UtilComponents";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from "@material-ui/core";

// Icons
import RemoveIcon from "@material-ui/icons/Remove";
import LocalShippingIcon from "@material-ui/icons/LocalShipping";

export default class SessionStatusForm extends Component {
  render() {
    const activeStep = this.props.sessionInfo?.result || 0;
    const allWarehousesArr = this.props.sessionInfo?.allWarehousesInfo;
    const orderedWarehousesArr = this.props.sessionInfo?.storages_through
      ?.split(",")
      .map((id) => parseInt(id));

    const findWarehouseTitleById = (id) =>
      allWarehousesArr.find(({ id: wid }) => wid === id).storage_name;

    return (
      <StyledDialog
        style={{ zIndex: 21 }}
        open={this.props.open}
        onClose={this.props.close}
      >
        <DialogTitle>Session's status</DialogTitle>

        <StyledContent>
          <div className="currentStatus">
            <Stepper alternativeLabel activeStep={activeStep}>
              {Boolean(orderedWarehousesArr) &&
                orderedWarehousesArr.map((id, i) => (
                  <Step key={id}>
                    <StepLabel
                      StepIconComponent={
                        activeStep === i
                          ? CircularProgress
                          : activeStep < i
                          ? LocalShippingIcon
                          : null
                      }
                    >
                      {findWarehouseTitleById(id)}
                    </StepLabel>
                  </Step>
                ))}
            </Stepper>
          </div>

          <div className="info">
            <StyledTableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Məhsul</TableCell>
                    <TableCell align="center">Barkod</TableCell>
                    <TableCell align="center">Miqdar</TableCell>
                    <TableCell align="center">Qiymət</TableCell>
                    <TableCell align="center">Ümumi Qiymət</TableCell>
                    <TableCell align="center">Hücrə №</TableCell>
                    <TableCell align="center">
                      Transfer olunan anbarın adı
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.props.sessionInfo?.transferInfoArr.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell align="center">{product.title[0]}</TableCell>
                      <TableCell align="center">
                        {product.barcode || <RemoveIcon />}
                      </TableCell>
                      <TableCell align="center">{`${product.quantity} ${product.unit_title}`}</TableCell>
                      <TableCell align="center">{`${product["price for 1"]} ${product.title[1]}`}</TableCell>
                      <TableCell align="center">{`${product.sum_price} ${product.title[1]}`}</TableCell>
                      <TableCell align="center">
                        {product.product_cell || <RemoveIcon />}
                      </TableCell>
                      <TableCell align="center">
                        {product.storage_name}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>

            {!Boolean(this.props.sessionInfo?.transferInfoArr.length) && (
              <div className="noProducts">
                <h2>No products added yet</h2>
              </div>
            )}
          </div>
        </StyledContent>

        <DialogActions>
          <Divider />
          <CustomButton onClick={this.props.close}>Close</CustomButton>
        </DialogActions>
      </StyledDialog>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledDialog = styled(Dialog)`
  .MuiDialog-container > .MuiPaper-root {
    // width: 680px;
    max-width: unset;
    height: calc(100% - 64px);

    form {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .MuiDialogTitle-root {
    background-color: #f5f5f5;

    .MuiTypography-root {
      font-size: 1.6rem;
    }
  }

  .MuiDialogContent-root {
    flex-grow: 1;
  }

  .MuiDialogActions-root {
    padding: 8px 24px 8px 6px;
    justify-content: flex-start;
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
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;

  .currentStatus {
    .MuiStepper-root{
        padding: 18px 0;
        align-items: center
    }
    .MuiStepper-root {
      .MuiCircularProgress-root {
        width: 30px !important;
        height: 30px !important;
      }
      .MuiCircularProgress-colorPrimary {
        color: #ffaa00;
      }
      .MuiStepLabel-label.MuiStepLabel-completed {
        color: rgba(0, 0, 0, 0.54);
        font-weight: 400;
      }
      .MuiStepIcon-root.MuiStepIcon-completed {
        color: #ffaa00;
      }
      .MuiStep-completed {
        .MuiStepConnector-line {
          border-color: #ffaa00;
        }
      }
    }
  }

  .info {
    position: relative;
    overflow: hidden;

    .noProducts {
      position: absolute;
      top: 0;
      z-index: 110000000;
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.4);
      border-radius: 4px;

      h2 {
        color: rgba(255, 255, 255, 1);
        font-size: 1.3rem;
        font-weight: 400;
      }
    }
  }
`;
const StyledTableContainer = styled(TableContainer)`
  overflow-y: auto;
  height: 100%;

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
`;
