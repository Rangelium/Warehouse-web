import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";
import uuid from "react-uuid";

import {
  CustomTextInput,
  CustomSelect,
  CustomSelectItem,
} from "../../components/UtilComponents";

export default class WarehouseAddFromCreateBulk extends Component {
  static contextType = GlobalDataContext;
  state = {
    vendorsList: [],
    vendorId: "",
    contractsList: [],
    contractId: "",
    eq: "",
    fakturaNum: "",
  };

  componentDidMount() {
    api
      .executeProcedure("anbar.select_express_vendors")
      .then((vendorsList) => this.setState({ vendorsList }))
      .catch((err) => console.log(err.errText));
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  handleVendorChange(e) {
    api
      .executeProcedure(
        "[SalaryDB].procurement.[express_get_vendor_contracts]",
        {
          vendor_id: e.target.value,
        }
      )
      .then((contractsList) => {
        console.log(contractsList)
        this.setState({
          vendorId: e.target.value,
          contractsList,
        });
      })
      .catch((err) => console.log(err.errText));
  }
  createBulk() {
    if (!Boolean(this.state.vendorId)) {
      this.context.error("Vendoru seçin!");
      return;
    }
    if (!Boolean(this.state.contractId)) {
      this.context.error("Müqavilə № seçin!");
      return;
    }
    if (!Boolean(this.state.eq)) {
      this.context.error("akt № daxil edin!");
      return;
    }
    if (!Boolean(this.state.fakturaNum)) {
      this.context.error("Hesab-faktura № daxil edin!");
      return;
    }

    api
      .executeProcedure(
        "[SalaryDB].anbar.[order_acception_handle_session_create]",
        {
          invoice_num: this.state.fakturaNum,
          contract_id: this.state.contractId,
          akt_num: this.state.eq,
        }
      )
      .then((res) => {
        this.props.finishCreation(res[0][""]);
      })
      .catch((err) => this.context.error(err.errText));
  }

  render() {
    return (
      <StyledSection active={this.props.active}>
        <div className="row">
          <CustomSelect
            label="Kontragent"
            name="vendorId"
            value={this.state.vendorId}
            onChange={this.handleVendorChange.bind(this)}
          >
            {this.state.vendorsList.map((vendor) => (
              <CustomSelectItem key={uuid()} value={vendor.id}>
                {vendor.name}
              </CustomSelectItem>
            ))}
          </CustomSelect>
          <CustomTextInput
            disabled={true}
            label="Vendor ID"
            value={this.state.vendorId}
          />
        </div>
        <CustomSelect
          disabled={!Boolean(this.state.vendorId) ? true : false}
          label="Müqavilə №"
          name="contractId"
          value={this.state.contractId}
          onChange={this.handleChange.bind(this)}
        >
          {this.state.contractsList.map(({ number,id }) => (
            <CustomSelectItem key={uuid()} value={id}>
              {number}
            </CustomSelectItem>
          ))}
        </CustomSelect>
        <CustomTextInput
          disabled={!Boolean(this.state.vendorId) ? true : false}
          label="Electron qaimə №"
          name="eq"
          value={this.state.eq}
          onChange={this.handleChange.bind(this)}
        />
        <CustomTextInput
          disabled={!Boolean(this.state.vendorId) ? true : false}
          label="Hesab-faktura №"
          name="fakturaNum"
          value={this.state.fakturaNum}
          onChange={this.handleChange.bind(this)}
        />
      </StyledSection>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledSection = styled.div`
  flex-grow: 1;
  padding: 0 15px 15px 15px;
  display: ${(props) => (props.active ? "flex" : "none")};
  flex-direction: column;
  gap: 15px;

  .row {
    display: grid;
    grid-template-columns: 70% auto;
    gap: 5px;
  }
`;
