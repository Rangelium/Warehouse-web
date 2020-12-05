import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import SingleProductInfo from "./SingleProductInfo";
import OverallInfo from "./OverallInfo";
import Treeview from "../../components/Treeview/Treeview";

import { Backdrop, CircularProgress } from "@material-ui/core";

const DrawerWidth = "380px"; // Width of Treeview

export default class WarehouseInfo extends Component {
  static contextType = GlobalDataContext;
  state = {
    drawer: true,
    dataForTreeview: null,
    selectedProduct: null,
    selectedProductInfo: null,
    selectedProductTableData: [],
    loading: true,
    loadingSingleProduct: false,

    overallInfo: null,
  };

  async componentDidMount() {
    const data = await api.executeProcedure("anbar.warehouse_tree_select");

    let overallData = await api.executeProcedure("anbar.dashboard", {
      storage_id: this.context.storageId,
    });

    this.setState({
      dataForTreeview: data,
      overallInfo: overallData.length ? overallData[0] : {},
      loading: false,
    });
  }
  async selectProduct(selectedProduct) {
    this.setState({ loadingSingleProduct: true });
    const info = await api.executeProcedure("anbar.main_tree_click_info", {
      product_id: selectedProduct.product_id,
      storage_id: this.context.storageId,
    });

    const tableData = await api.executeProcedure("anbar.main_tree_click_table", {
      product_id: selectedProduct.product_id,
      storage_id: this.context.storageId,
    });

    this.setState({
      selectedProduct: info.length ? info[0] : [selectedProduct.title],
      selectedProductTableData: tableData.length ? tableData : [],
      selectedProductInfo: selectedProduct,
      loadingSingleProduct: false,
    });
  }

  render() {
    return (
      <StyledSection className="pageData">
        <Treeview
          selectProduct={(a) => this.selectProduct(a)}
          data={this.state.dataForTreeview}
          drawerwidth={DrawerWidth}
          active={this.state.drawer ? 1 : 0}
          open={() => this.setState({ drawer: true })}
          close={() => this.setState({ drawer: false })}
        />
        <MainData active={this.state.drawer ? 0 : 1}>
          <OverallInfo overallInfo={this.state.overallInfo} />
          <SingleProductInfo
            goBack={() =>
              this.setState({
                selectedProduct: null,
              })
            }
            product={this.state.selectedProduct}
            productInfo={this.state.selectedProductInfo}
            tableData={this.state.selectedProductTableData}
            active={this.state.selectedProduct ? 1 : 0}
          />
          <Backdrop
            style={{
              zIndex: 100000000,
              position: "absolute",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
            open={this.state.loadingSingleProduct}
          >
            <CircularProgress style={{ color: "#fff" }} />
          </Backdrop>
        </MainData>
        <Backdrop
          style={{
            zIndex: 100000000,
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
          open={this.state.loading}
        >
          <CircularProgress style={{ color: "#fff" }} />
        </Backdrop>
      </StyledSection>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledSection = styled.section`
  display: flex;
`;
const MainData = styled.div`
  position: relative;
  width: ${(props) => (props.active ? "100%" : `calc(100% - ${DrawerWidth})`)};
  margin-left: ${(props) => (props.active ? `-${DrawerWidth}` : 0)};
  transition: 225ms;
`;
