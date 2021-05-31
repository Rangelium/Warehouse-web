import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../../components/GlobalDataProvider";
import api from "../../../tools/connect";

import {
  CustomButton,
  CustomSelect,
  CustomSelectItem,
  CustomTextInput,
} from "../../../components/UtilComponents";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Button,
} from "@material-ui/core";

// Icons
import DoubleArrowOutlinedIcon from "@material-ui/icons/DoubleArrowOutlined";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

export default class CreateNewSessionForm extends Component {
  static contextType = GlobalDataContext;

  state = {
    toWarehouseId: "",
    warehouseData: [],

    warehouseOrder: [],
  };

  componentDidMount() {
    this.prepareForm();
  }
  handleSubmit(e) {
    e.preventDefault();

    if(!this.context.storageId || !this.state.toWarehouseId) return this.context.error("Something gone wrong")

    api
      .executeProcedure("[SalaryDB].anbar.[transfer_products_create_session]", {
        storage_id: this.context.storageId,
        storage_to: this.state.toWarehouseId,
        storages_through: [this.context.storageId, ...this.state.warehouseOrder.map(({id}) => id), this.state.toWarehouseId].join(",")
      })
      .then(() => {
        this.context.success("Sessiya yaradıldı");
        this.props.refresh();
        this.handleClose();
      })
      .catch((err) => this.context.error(err.errText));
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  async prepareForm() {
    const warehouseData = await api
      .executeProcedure("anbar.storage_select_all")
      .catch((err) => this.context.error(err.errText));

    this.setState({
      toWarehouseId: "",
      warehouseOrder: [],
      warehouseData,
    });
  }
  handleClose() {
    this.prepareForm();
    this.props.close();
  }

  render() {
    const toWarehouseTitle = this.state.warehouseData.find(
      ({ id }) => id === this.state.toWarehouseId
    )?.storage_name;

    return (
      <StyledDialog
        style={{ zIndex: 21 }}
        open={this.props.open}
        onClose={this.handleClose.bind(this)}
      >
        <form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
          <DialogTitle>Yeni sessiya yarat</DialogTitle>

          <StyledContent>
            <div className="heading">
              <CustomTextInput
                style={{ minWidth: "200px" }}
                disabled={true}
                label="Anbardan"
                value={this.context.storageTitle}
              />

              <div className="block">
                <Typography noWrap variant="h3">
                  TRANSFER
                </Typography>
                <DoubleArrowOutlinedIcon className="icon" />
              </div>

              <CustomSelect
                required
                style={{ minWidth: "200px" }}
                disabled={Boolean(this.state.activeStep)}
                label="Anbara"
                name="toWarehouseId"
                value={this.state.toWarehouseId}
                onChange={this.handleChange.bind(this)}
              >
                {this.state.warehouseData.map((warehouse) =>
                  warehouse.id !== this.context.storageId ? (
                    <CustomSelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.storage_name}
                    </CustomSelectItem>
                  ) : null
                )}
              </CustomSelect>
            </div>

            <div className="transferOrder">
              <div className="block allPoints">
                {this.state.warehouseData
                  .filter(
                    ({ id }) =>
                      id !== this.context.storageId &&
                      id !== this.state.toWarehouseId
                  )
                  .filter(({ id }) => {
                    const selectedIds = this.state.warehouseOrder.map(
                      ({ id }) => id
                    );
                    return !selectedIds.includes(id);
                  })
                  .map(({ id, storage_name }) => (
                    <Button
                      disabled={!Boolean(this.state.toWarehouseId)}
                      key={`itemAll_${id}`}
                      className="item"
                      onClick={() => {
                        this.setState((prevState) => {
                          return {
                            warehouseOrder: [
                              ...prevState.warehouseOrder,
                              { id, storage_name },
                            ],
                          };
                        });
                      }}
                    >
                      {storage_name}
                    </Button>
                  ))}
              </div>

              <div className="block orderedPoints">
                <Button>{this.context.storageTitle}</Button>
                <ArrowDownwardIcon />
                {this.state.warehouseOrder.map(({ id, storage_name }) => (
                  <React.Fragment key={`itemOrder_${id}`}>
                    <Button
                      disabled={!Boolean(this.state.toWarehouseId)}
                      className="item"
                      onClick={() => {
                        this.setState((prevState) => {
                          return {
                            warehouseOrder: prevState.warehouseOrder.filter(
                              ({ id: wid }) => wid !== id
                            ),
                          };
                        });
                      }}
                    >
                      {storage_name}
                    </Button>
                    <ArrowDownwardIcon />
                  </React.Fragment>
                ))}
                {Boolean(toWarehouseTitle) && (
                  <Button>{toWarehouseTitle}</Button>
                )}
              </div>
            </div>
          </StyledContent>

          <DialogActions>
            <Divider />
            <CustomButton onClick={this.handleClose.bind(this)}>
              İmtına
            </CustomButton>
            <CustomButton type="submit">Yeni sessiya yarat</CustomButton>
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
    width: 680px;
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
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 8px 0!important;

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;

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

  .transferOrder {
    display: grid;
    // gap: 30px;
    padding: 15px 0 5px 0;
    grid-template-columns: 16px 1fr 20px 1fr 16px;
    overflow: hidden;

    .block {
      display: flex;
      flex-direction: column;
      border-radius: 4px;
      box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%),
        0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);

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
    }
    .allPoints {
      grid-column-start: 2;
    }

    .orderedPoints {
      grid-column-start: 4;
      align-items: center;

      .MuiSvgIcon-root {
        color: #ffaa00;
      }
    }
  }
`;
