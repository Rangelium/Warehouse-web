import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import { CustomButton, CustomTextInput } from "../../components/UtilComponents";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Collapse,
  IconButton
} from "@material-ui/core";

// Icons 
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";

class Row extends Component {

  render() {
    const el = this.props.el;
    const i = this.props.i;

    return (
      <>
        <StyledTableRow>
          <TableCell style={{ borderBottom: "unset" }}>
            <IconButton
              disabled={!Boolean(this.props.parentState[`inventoryNumArr${i}`].length)}
              size="small"
              onClick={() => {
                this.props.handleChange({target: {name: `showInventory${i}`, value: !this.props.tableInputs[`showInventory${i}`]}})
              }}
            >
              {this.props.tableInputs[`showInventory${i}`] ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton>
          </TableCell>
          <TableCell align="center">{el.product_title}</TableCell>
          <TableCell align="center">{`${parseFloat(
            el.unit_price
          ).toFixed(2)} ${el.currency_title}`}</TableCell>
          <TableCell align="center">
            {el.quantity_difference}
          </TableCell>
          <TableCell align="center">{`${parseFloat(
            el.price_difference
          ).toFixed(2)} ${el.currency_title}`}</TableCell>
          <TableCell style={{ borderBottom: "unset" }} align="center">
            {el.is_inventory ? 
            <CustomTextInput
              _ref={this.props.tableInputs[`invInputRef${i}`]}
              onKeyUp={(e) => {
                if (e.keyCode === 13) {
                  e.preventDefault();

                  this.props.addInventoryNum(
                    this.props.tableInputs[`inventoryNum${i}`],
                    `inventoryNum${i}`,
                    el.quantity_difference,
                    i
                  );
                }
              }}
              disabled={
                this.props.parentState[`inventoryNumArr${i}`].length >= el.quantity_difference 
              }
              style={{ width: 150 }}
              name={`inventoryNum${i}`}
              value={this.props.tableInputs[`inventoryNum${i}`]}
              onChange={this.props.handleChange.bind(this)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      disabled={
                        this.props.parentState[`inventoryNumArr${i}`].length >= el.quantity_difference
                      }
                      aria-label="toggle password visibility"
                      onClick={() =>
                        this.props.addInventoryNum(
                          this.props.tableInputs[`inventoryNum${i}`],
                          `inventoryNum${i}`,
                          el.quantity_difference,
                          i
                        )
                      }
                    >
                      <ControlPointIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            /> : null}
          </TableCell>
        </StyledTableRow>

        <InvTableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
            <Collapse in={this.props.tableInputs[`showInventory${i}`]} timeout="auto" unmountOnExit>
              <Paper style={{ padding: "10px 0", position: "relative" }} elevation={0}>
                <div className="containerInv">
                  <h1>Inventory numbers:</h1>
                  <div className="items">
                    {this.props.parentState[`inventoryNumArr${i}`].map(({ id, num }, j) => (
                      <div key={id} className="invNumItem">
                        <p>{num}</p>
                        <IconButton onClick={() => this.props.removeInventoryNum(j, i)}>
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                </div>
              </Paper>
            </Collapse>
          </TableCell>
        </InvTableRow>
      </>
    );
  }
}


export default class InventoryProcessingForm extends Component {
  static contextType = GlobalDataContext;
  constructor(props){
    super(props);

    const tmpObj = {}
    for(let i = 0; i< this.props.tableData.length; i++){
      tmpObj[`inventoryNumArr${i}`] = [];
    }

    this.state = {
      tableInputs: this.createTableInputs(),
      ...tmpObj,
    }

  }

  createTableInputs() {
    let obj = {};

    this.props.tableData.forEach((el, i) => {
      obj = {
        [`inventoryNum${i}`]: "",
        [`showInventory${i}`]: false,
        [`invInputRef${i}`]: React.createRef(),
        ...obj,
      };
    });

    return obj;
  }
  handleChange(e) {
    this.setState({
      tableInputs: {
        ...this.state.tableInputs,
        [e.target.name]: e.target.value,
      },
    });
  }
  addInventoryNum(num, name, needed, iInv) {
    // Check if invNum is uinque
    for (let i = 0; i < this.state[`inventoryNumArr${iInv}`].length; i++) {
      if (Object.values(this.state[`inventoryNumArr${iInv}`][i]).includes(num)) {
        return this.context.error(`Inventoy number "${num}" is already exist`);
      }
    }

    // Clear input
    this.handleChange({
      target: {
        name,
        value: "",
      },
    });
    // Check if empty
    if (!num.trim().length) {
      return this.context.error("Inventory num cannot be empty");
    }

    // Check if needed amount selected
    if (this.state[`inventoryNumArr${iInv}`].length === needed) {
      return this.context.error("Needed amount added");
    }

    // Add to arr
    let inventoryNumArr = [...this.state[`inventoryNumArr${iInv}`]];
    inventoryNumArr.push({
      id: uuid(),
      num,
    });
    this.setState(
      {
        [`inventoryNumArr${iInv}`]: inventoryNumArr,
      },
      () => {
        if (this.state[`inventoryNumArr${iInv}`].length === needed) {
          this.handleChange({target: {name: `showInventory${iInv}`, value: false}})
        } else {
          this.handleChange({target: {name: `showInventory${iInv}`, value: true}})
          this.state.tableInputs[`invInputRef${iInv}`].current.focus();
        }
      }
    );
  }
  removeInventoryNum(index, iInv) {
    let inventoryNumArr = [...this.state[`inventoryNumArr${iInv}`]];

    inventoryNumArr.splice(index, 1);

    this.setState({
      [`inventoryNumArr${iInv}`]: inventoryNumArr,
    });

    if (!inventoryNumArr.length) {
      this.handleChange({target: {name: `showInventory${iInv}`, value: false}})
    }
  }
  
  async createSession(e) {
    e.preventDefault();

    let isSuccess = true;
    const data = this.props.tableData;
    let arrOfDocId = [];

    for (let i = 0; i < data.length; i++){
      if(this.state[`inventoryNumArr${i}`].length !== data[i].quantity_difference && data[i].is_inventory){
        return this.context.error(
          `You must create ${
            data[i].quantity_difference - this.state[`inventoryNumArr${i}`].length
          } inventory numbers for ${data[i].product_title}`
        );
      }
    }

    for (let i = 0; i < data.length; i++) {
      if (!isSuccess) break;

      isSuccess = await api
        .executeProcedure("[SalaryDB].anbar.[inventory_fix_in]", {
          cluster_id: data[i].cluster,
          product_cell: "",
          currency_id: data[i].currency_id,
          row_id: data[i].id,
          inventory_session_id: this.props.inventoryId,
          barcode: data[i].barcode,
          storage_id: this.context.storageId,
          product_id: data[i].product_id,
          quantity: data[i].quantity_difference,
          unit_price: data[i].unit_price,
          price_difference: data[i].price_difference,
        })
        .then((res) => {arrOfDocId.push(res[0].document_id); return true})
        .catch((err) => {
          this.context.error(err.errText);
          return false;
        });
    }

    if (!isSuccess) return;

    let InvNumsArrMats = [];
    for (let i = 0; i < data.length; i++) {
      this.state[`inventoryNumArr${i}`].forEach(({num}) => {
        InvNumsArrMats.push([
          null,
          num,
          arrOfDocId[i],
          data[i].product_id,
          2,
          0,
          this.context.storageId,
        ]);
      })
    }
    console.log(InvNumsArrMats)
    api
      .addInvNumsTable({ table: InvNumsArrMats })
      .then(() => {
        this.context.success("Processing complete");
        this.props.refresh();
        this.props.close();

        this.uploadFiles();
      })
      .catch((err) => this.context.error(err.errText));
  }

  render() {
    return (
      <StyledDialog
        style={{ zIndex: 2 }}
        open={this.props.open}
        onClose={this.props.close}
      >
        <form autoComplete="off" onSubmit={this.createSession.bind(this)} onKeyDown={(e) => {
            if (e.keyCode === 13) {
              e.preventDefault();
            }
          }}>
          <DialogTitle>Malların daxil edilməsi</DialogTitle>

          <DialogContent>
            <StyledTableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell align="center">Məhsul</TableCell>
                    <TableCell align="center">Vahid qiymət</TableCell>
                    <TableCell align="center">Miqdar fərqi</TableCell>
                    <TableCell align="center">Qiymət fərqi</TableCell>
                    <TableCell align="center">İnventar №</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.props.tableData.map((el, i) => (
                    <Row
                    key={`${el.product_title}${i}`}
                    handleChange={this.handleChange.bind(this)}
                    tableInputs={this.state.tableInputs}
                    parentState={this.state}
                    addInventoryNum={this.addInventoryNum.bind(this)}
                    removeInventoryNum={this.removeInventoryNum.bind(this)}
                    el={el}
                    i={i}
                  />
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </DialogContent>

          <DialogActions>
            <CustomButton onClick={this.props.close}>İmtına</CustomButton>
            <div className="gap" style={{ flexGrow: 1 }}></div>
            <CustomButton
              type="submit"
              disabled={!Boolean(this.props.tableData.length)}
            >
              Daxil et
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
  .MuiPaper-root {
    max-width: unset;

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
    display: flex;
    flex-grow: 1;
    padding: 0;
    // max-height: 400px;
  }

  .MuiDialogActions-root {
    padding: 8px 12px;
    justify-content: flex-start;
  }
`;
const StyledTableRow = styled(TableRow)`
  .MuiOutlinedInput-input {
    padding: 14px 0px 14px 14px;
  }
  .MuiInputAdornment-positionEnd {
    margin-left: 0;
  }
  .MuiOutlinedInput-adornedEnd {
    padding-right: 0;
  }
`;
const InvTableRow = styled(TableRow)`
  .containerInv {
    padding: 0 25px 5px 25px;

    h1 {
      font-size: 1.5rem;
    }

    .items {
      padding-top: 5px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 15px;

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
