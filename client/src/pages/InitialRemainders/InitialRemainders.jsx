import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import Treeview from "../../components/Treeview/Treeview";
import InitialRemaindersForm from "./InitialRemaindersForm";
import {
  CustomSelect,
  CustomSelectItem,
  CustomTextInput,
  CustomButton,
} from "../../components/UtilComponents";
import { Typography, Backdrop, Divider } from "@material-ui/core";

export default class InitialRemainders extends Component {
  static contextType = GlobalDataContext;
  constructor() {
    super();
    this.state = {
      sessionId: null,

      vendorId: "",
      vendorsData: [],
      contractNum: "",

      dataForTreeview: null,
    };

    this.initRemainRef = React.createRef();
  }

  async componentDidMount() {
    const vendors = await api.executeProcedure("anbar.select_express_vendors");

    const dataForTreeview = await api.executeProcedure(
      "anbar.warehouse_tree_select"
    );

    const unfinSessionStr = localStorage.getItem("unfinishedSession");
    const unfinSession = JSON.parse(unfinSessionStr);

    this.setState({
      vendorsData: vendors,
      dataForTreeview,
      sessionId: unfinSession ? parseInt(unfinSession.sessionId) : null,
      vendorId: unfinSession ? parseInt(unfinSession.vendorId) : "",
      contractNum: unfinSession ? unfinSession.contractNum : "",
    });
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  createSession(e) {
    e.preventDefault();

    api
      .executeProcedure("anbar.input_initial_remainders_create_session", {
        contract_num: this.state.contractNum,
        vendor_id: this.state.vendorId,
      })
      .then((res) => {
        this.context.success("Session created");
        this.setState({
          sessionId: res[0].session_id,
        });
        localStorage.setItem(
          "unfinishedSession",
          JSON.stringify({
            sessionId: res[0].session_id,
            contractNum: this.state.contractNum,
            vendorId: this.state.vendorId,
          })
        );
      })
      .catch((err) => {
        this.context.error(err.errText);
      });
  }
  endSession(e) {
    e.preventDefault();

    api
      .executeProcedure("anbar.input_initial_remainders_accept", {
        user_id: this.context.userId,
        session_id: this.state.sessionId,
      })
      .then(() => {
        this.context.success("Sessiya bitirildi");
        this.setState({
          sessionId: null,
          vendorId: "",
          contractNum: "",
        });

        localStorage.removeItem("unfinishedSession");
      })
      .catch((err) => {
        this.context.error(err.errText);
      });
  }

  render() {
    return (
      <StyledSection className="pageData">
        <Header>
          <Typography className="title" noWrap>
            İlkin qalıqların daxil edilməsi
          </Typography>
          <form
            onSubmit={
              this.state.sessionId
                ? this.endSession.bind(this)
                : this.createSession.bind(this)
            }
            autoComplete="off"
          >
            <CustomSelect
              disabled={this.state.sessionId ? true : false}
              required
              label="Kontragent"
              name="vendorId"
              value={this.state.vendorId}
              onChange={this.handleChange.bind(this)}
            >
              {this.state.vendorsData.map((vendor) => (
                <CustomSelectItem key={uuid()} value={vendor.id}>
                  {vendor.name}
                </CustomSelectItem>
              ))}
            </CustomSelect>
            <CustomTextInput
              disabled={this.state.sessionId ? true : false}
              required
              variant="outlined"
              label="Müqavilə №"
              name="contractNum"
              value={this.state.contractNum}
              onChange={this.handleChange.bind(this)}
            />
            {!this.state.sessionId ? (
              <CustomButton type="submit" variant="outlined">
                Sessiyanı yarat
              </CustomButton>
            ) : (
              <CustomButton type="submit" variant="outlined">
                Sessiyanı bitir
              </CustomButton>
            )}
          </form>
          <Divider />
        </Header>
        <MainData>
          <Treeview
            // TODO: Possibly have to be refactored
            // TODO: Not standart way of working with react
            // TODO: Here we calling child method(prepareForm) from parent element
            selectProduct={(selectedProduct) => {
              this.initRemainRef.current.prepareForm({
                product_id: selectedProduct.product_id,
                title: selectedProduct.title,
                barcode: selectedProduct.barcode,
              });
            }}
            data={this.state.dataForTreeview}
            drawerwidth={"400px"}
            active={1}
            alwaysActive
          />
          <InitialRemaindersForm
            ref={this.initRemainRef}
            sessionId={this.state.sessionId}
          />
          <Backdrop
            style={{
              zIndex: 10000,
              position: "absolute",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
            }}
            open={Boolean(!this.state.sessionId)}
          >
            <p
              style={{ fontSize: "1.6rem", color: "#fff", userSelect: "none" }}
            >
              Başlamaq üçün sessiyanı yarat
            </p>
          </Backdrop>
        </MainData>
      </StyledSection>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;

  form {
    height: 100%;
  }
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  position: relative;

  .title {
    font-size: 1.9rem;
    font-weight: 500;
    color: #231f20;
    flex-grow: 1;
  }

  form {
    width: 600px;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
  }

  hr {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
  }
`;
const MainData = styled.div`
  flex-grow: 1;
  position: relative;
  display: flex;
`;
