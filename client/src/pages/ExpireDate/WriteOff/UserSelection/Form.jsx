import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../../../components/GlobalDataProvider";
import api from "../../../../tools/connect";

import { CustomButton } from "../../../../components/UtilComponents";
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
  Switch,
} from "@material-ui/core";

export default class UserSelection extends Component {
  static contextType = GlobalDataContext;

  state = {
    usersArray: [],
    rolesArray:[],
    selectedItems: [],
    sendType: 0,
  };

  componentDidMount() {
    api
      .executeProcedure("[SalaryDB].[procurement].[get_employees]", {
        user_id: this.context.userData.id,
      })
      .then((res) => {
        this.setState({
          usersArray: res,
        });
      });
    api.executeProcedure("[SalaryDB].[procurement].[get_roles]").then((res)=>{
      this.setState({
        rolesArray: res,
      });
    });
  }
  async handleSubmit(e) {
    e.preventDefault();

    let receivers =  this.state.sendType === 0 ? this.state.selectedItems.map((data,index) => index === 0 ?  [data.id, 1] : [data.id,0]) : 
                                                 this.state.selectedItems.map((data) =>  [data.id, 1]);
    api
      .writeOffUserSelectionTVP({
        receivers,
        send_type: this.state.sendType,
        number: this.props.number,
        emp_id: this.context.userData.id,
        doc_type: 2,
        doc_id: this.props.docId,
      })
      .then((res) => {
        this.context.success("Request sent");
        this.props.refresh();
        this.props.close();
      })
      .catch((err) => {
        this.context.error(err.errText);
      });
  }
  selectItem(data) {
    let selectedItems = [...this.state.selectedItems];
    
    let isUnique = true;
    for (let i = 0; i < selectedItems.length; i++) {
      if (data.id === selectedItems[i].id) {
        selectedItems = selectedItems.filter((el) => el.id !== data.id);

        isUnique = false;
      }
    }

    if (isUnique) {
      selectedItems.push(data);
    }

    this.setState({
      selectedItems,
    });
  }
  isSelected(data) {
    const array = this.state.selectedItems;
    for (let i = 0; i < array.length; i++) {
      if (data.id === array[i].id) return true;
    }

    return false;
  }

  render() {
    return (
      <StyledDialog
        style={{ zIndex: 21 }}
        open={this.props.open}
        onClose={this.props.close}
      >
        <form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
          <DialogTitle>User selection</DialogTitle>

          <StyledContent>
            <div className="mainData">
              <div className="sendTypeRow">
                <p>Manual</p>
                <Switch
                  checked={this.state.sendType === 0 ? false : true}
                  onChange={() => {
                    this.setState((prevState) => {
                      console.log(this.state.sendType)
                      return {
                        sendType: prevState.sendType === 0 ? 1 : 0,
                      };
                    });
                  }}
                />
                <p>Group</p>
              </div>
              <StyledTableContainer>
                {this.state.sendType === 0 ? <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Full name</TableCell>
                      <TableCell align="center">Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.usersArray.map((row) => (
                      <TableRow
                        key={row.id}
                        onClick={() => {
                          this.selectItem(row);
                        }}
                        hover
                        selected={this.isSelected(row)}
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell align="center">{row.full_name}</TableCell>
                        <TableCell align="center">{row.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>  :  <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Role</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.rolesArray.map((row) => (
                      <TableRow
                        key={row.id}
                        onClick={() => {
                          this.selectItem(row);
                        }}
                        hover
                        selected={this.isSelected(row)}
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell align="center">{row.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>}
              </StyledTableContainer>
            </div>
          </StyledContent>

          <DialogActions>
            <Divider />
            <CustomButton onClick={this.props.close}>İmtına</CustomButton>
            <div style={{ flexGrow: 1 }}></div>
            <CustomButton
              disabled={!this.state.selectedItems.length}
              type="submit"
            >
              Send request
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
    min-width: 620px;
    max-width: 620px;
    height: 1000px;
    max-height: calc(100% - 24px);

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
    padding: 8px 14px 8px 6px;
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
  padding: 10px;
  display: flex;
  flex-direction: column;

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .block {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .MuiTypography-root {
        font-size: 1.6rem;
        margin-right: 5px;
      }

      .icon {
        transform: scale(1.4);
        color: #ffaa00;
      }
    }
  }

  .mainData {
    height: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    .sendTypeRow {
      display: flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      gap: 10px;
      padding-bottom: 10px;

      .MuiSwitch-colorSecondary.Mui-checked {
        color: #ffaa00;
      }
      .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track {
        background-color: #ffaa00;
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
