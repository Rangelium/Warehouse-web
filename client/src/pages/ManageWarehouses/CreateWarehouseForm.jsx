// ! After creating new Warehouse top-left(Global) Warehouse dropdown don't refresh

import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import {
  CustomTextInput,
  CustomButton,
  CustomSelect,
  CustomSelectItem,
} from "../../components/UtilComponents";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@material-ui/core";

export default class CreateWarehouseForm extends Component {
  static contextType = GlobalDataContext;
  state = {
    warehouseName: "",
    responsiblePerson: "",
    warehouseType: "",
    warehouseDepartmentId: "",
    // departmentData: [],
  };

  componentDidMount() {
    this.getDepartmentData();
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  getDepartmentData() {
    api
      .executeProcedure("[SalaryDB].anbar.[warehouse_department_select]")
      .then((res) => this.setState({ departmentData: res }))
      .catch((err) => console.log(err));
  }
  createWarehouse(e) {
    e.preventDefault();

    api
      .executeProcedure("[procurement].[create_new_structure]", {
        storage_name: this.state.warehouseName,
        storage_type: this.state.warehouseType,
        // curation_department_id: parseInt(this.state.warehouseDepartmentId),
        responsible_person: this.state.responsiblePerson,
      })
      .then(() => {
        this.context.success(`${this.state.warehouseName} yaradıldl`);
        this.props.reloadNavbarStorage();
        this.props.refresh();
        this.handleClose();
      })
      .catch((err) => this.context.error(err.errText));
  }
  handleClose() {
    this.props.close();
    this.getDepartmentData();
    this.setState({
      warehouseName: "",
      responsiblePerson: "",
      warehouseType: "",
      // warehouseDepartmentId: "",
    });
  }

  render() {
    return (
      <StyledDialog
        style={{ zIndex: 2 }}
        open={this.props.open}
        onClose={this.handleClose.bind(this)}
      >
        <form autoComplete="off" onSubmit={this.createWarehouse.bind(this)}>
          <DialogTitle>Yeni anbar yarat</DialogTitle>
          <DialogContent>
            <CustomTextInput
              required
              label="Anbaın adı"
              name="warehouseName"
              value={this.state.warehouseName}
              onChange={this.handleChange.bind(this)}
            />
            {/* <CustomSelect
              required
              label="şöbə/kurasiya"
              name="warehouseDepartmentId"
              value={this.state.warehouseDepartmentId}
              onChange={this.handleChange.bind(this)}
            >
              {this.state.departmentData.map(({ id, name }) => (
                <CustomSelectItem key={uuid()} value={id}>
                  {name}
                </CustomSelectItem>
              ))}
            </CustomSelect> */}
            <CustomTextInput
              required
              label="Anbarın tipi"
              name="warehouseType"
              value={this.state.warehouseType}
              onChange={this.handleChange.bind(this)}
            />
            <CustomTextInput
              required
              label="Məsul şəxs"
              name="responsiblePerson"
              value={this.state.responsiblePerson}
              onChange={this.handleChange.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <CustomButton type="submit">Yarat</CustomButton>
            <CustomButton onClick={this.handleClose.bind(this)}>İmtına</CustomButton>
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
    width: 500px;
  }

  .MuiDialogTitle-root {
    background-color: #f5f5f5;

    .MuiTypography-root {
      font-size: 1.6rem;
    }
  }

  .MuiDialogContent-root {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;

    .MuiFormControl-root {
      width: 100%;
    }

    .MuiTextField-root {
      width: 100%;
    }
  }

  .MuiDialogActions-root {
    padding: 8px 24px;
    justify-content: flex-start;
  }
`;
