import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import dayjs from "dayjs";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import {
  CustomTextInput,
  CustomSelect,
  CustomSelectItem,
} from "../../components/UtilComponents";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  IconButton,
  InputAdornment,
} from "@material-ui/core";

// Icons
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";

class Row extends Component {
  static contextType = GlobalDataContext;
  constructor() {
    super();

    this.state = {
      showInventory: false,
      inventoryNumArr: [],
    };

    this.InvNumInputRef = React.createRef();
  }

  addInventoryNum(num, name, needed) {
    // Clear input
    this.props.handleChange({
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
    if (this.state.inventoryNumArr.length === needed) {
      return this.context.error("Needed amount added");
    }

    // Add to arr
    let inventoryNumArr = [...this.state.inventoryNumArr];
    inventoryNumArr.push({
      id: uuid(),
      num,
    });
    this.setState(
      {
        inventoryNumArr,
        showInventory: true,
      },
      () => {
        if (this.state.inventoryNumArr.length === needed) {
          this.setState({
            showInventory: false,
          });
        } else {
          console.log(this.InvNumInputRef.current);
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

    if (!inventoryNumArr.length) {
      this.setState({
        showInventory: false,
      });
    }
  }

  render() {
    const el = this.props.el;
    const i = this.props.i;

    return (
      <>
        <StyledTableRow>
          <TableCell style={{ borderBottom: "unset" }}>
            <IconButton
              disabled={!Boolean(this.state.inventoryNumArr.length)}
              size="small"
              onClick={() =>
                this.setState((prevState) => {
                  return { showInventory: !prevState.showInventory };
                })
              }
            >
              {this.state.showInventory ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton>
          </TableCell>
          <TableCell style={{ borderBottom: "unset" }} align="center">
            {el.title}
          </TableCell>
          <TableCell style={{ borderBottom: "unset" }} align="center">
            {el.barcode}
          </TableCell>
          <TableCell
            style={{ borderBottom: "unset" }}
            align="center"
          >{`${el.amount} ${el.cluster_title}`}</TableCell>
          <TableCell style={{ borderBottom: "unset" }} align="center">
            <CustomTextInput
              style={{ width: 100 }}
              type="number"
              name={`price${i}`}
              value={this.props.tableInputs[`price${i}`]}
              onChange={this.props.handleChange.bind(this)}
            />
          </TableCell>
          <TableCell style={{ borderBottom: "unset" }} align="center">
            <CustomSelect
              label=""
              className="cstmInput"
              style={{ width: 80 }}
              name={`currency${i}`}
              value={this.props.tableInputs[`currency${i}`]}
              onChange={this.props.handleChange.bind(this)}
            >
              {this.props.currencyData.map(({ id, title }) => (
                <CustomSelectItem key={id} value={id}>
                  {title}
                </CustomSelectItem>
              ))}
            </CustomSelect>
          </TableCell>
          <TableCell style={{ borderBottom: "unset" }} align="center">
            <CustomTextInput
              style={{ width: 90 }}
              name={`productCell${i}`}
              value={this.props.tableInputs[`productCell${i}`]}
              onChange={this.props.handleChange.bind(this)}
            />
          </TableCell>
          <TableCell style={{ borderBottom: "unset" }} align="center">
            <CustomTextInput
              style={{ width: 160 }}
              type="date"
              name={`expDate${i}`}
              value={this.props.tableInputs[`expDate${i}`]}
              onChange={this.props.handleChange.bind(this)}
            />
          </TableCell>
          <TableCell style={{ borderBottom: "unset" }} align="center">
            <CustomTextInput
              _ref={this.InvNumInputRef}
              disabled={this.state.inventoryNumArr.length >= el.amount}
              style={{ width: 150 }}
              name={`inventoryNum${i}`}
              value={this.props.tableInputs[`inventoryNum${i}`]}
              onChange={this.props.handleChange.bind(this)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() =>
                        this.addInventoryNum(
                          this.props.tableInputs[`inventoryNum${i}`],
                          `inventoryNum${i}`,
                          el.amount
                        )
                      }
                    >
                      <ControlPointIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </TableCell>
        </StyledTableRow>

        <InvTableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
            <Collapse in={this.state.showInventory} timeout="auto" unmountOnExit>
              <Paper style={{ padding: "10px 0", position: "relative" }} elevation={0}>
                <div className="containerInv">
                  <h1>Inventory numbers:</h1>
                  <div className="items">
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
              </Paper>
            </Collapse>
          </TableCell>
        </InvTableRow>
      </>
    );
  }
}

export default class WarehouseAddFormFillBulk extends Component {
  static contextType = GlobalDataContext;
  constructor(props) {
    super(props);

    this.state = {
      tableInputs: this.createTableInputs(),
      currencyData: [],
    };

    this.refsArr = this.props.tableData.map(() => React.createRef());
  }

  async componentDidMount() {
    const currencyData = await api
      .executeProcedure("anbar.currency_select")
      .catch((err) => console.log(err.errText));

    this.setState({ currencyData });
  }
  handleChange(e) {
    this.setState({
      tableInputs: {
        ...this.state.tableInputs,
        [e.target.name]: e.target.value,
      },
    });
  }
  createTableInputs() {
    let obj = {};

    this.props.tableData.forEach((el, i) => {
      obj = {
        [`price${i}`]: this.props.tableData[i].approx_price,
        [`currency${i}`]: "",
        [`productCell${i}`]: "",
        [`expDate${i}`]: dayjs().add("3", "month").format("YYYY-MM-DD"),
        [`inventoryNum${i}`]: "",
        ...obj,
      };
    });

    return obj;
  }

  render() {
    return (
      <StyledSection active={this.props.active}>
        <StyledTableContainer component={Paper} elevation={0}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell align="center">Məhsul</TableCell>
                <TableCell align="center">Barkod</TableCell>
                <TableCell align="center">Miqdar</TableCell>
                <TableCell align="center">Qiymət</TableCell>
                <TableCell align="center">Valyuta</TableCell>
                <TableCell align="center">Hücrə №</TableCell>
                <TableCell align="center">Yararlılıq müddəti</TableCell>
                <TableCell align="center">İnventar №</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.tableData.map((el, i) => (
                <Row
                  ref={this.refsArr[i]}
                  key={`${el.title}${i}`}
                  handleChange={this.handleChange.bind(this)}
                  tableInputs={this.state.tableInputs}
                  currencyData={this.state.currencyData}
                  el={el}
                  i={i}
                />
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </StyledSection>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledSection = styled.div`
  flex-grow: 1;
  display: ${(props) => (props.active ? "flex" : "none")};
  flex-direction: column;
  width: 100%;

  .table {
    height: 1px;
    flex-grow: 1;
    border-left: 1px solid rgba(224, 224, 224, 1);
    border-right: 1px solid rgba(224, 224, 224, 1);
    border-bottom: 1px solid rgba(224, 224, 224, 1);
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
  max-height: 400px;
  /* padding: 0 10px; */

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

  td {
    padding: 5px;
  }
  .cstmInput {
    .MuiOutlinedInput-input {
      min-width: unset;
      text-align: left;
      padding-left: 7px;
    }
  }
`;
