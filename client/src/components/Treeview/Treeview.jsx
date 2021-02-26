import React, { Component } from "react";
import styled from "styled-components";
import api from "../../tools/connect";

import TreeviewData from "./TreeviewData";
import { Drawer, Button, Input, InputAdornment, IconButton } from "@material-ui/core";

// Icons
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@material-ui/icons/VisibilityOffOutlined";
// import LastPageIcon from "@material-ui/icons/LastPage";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";

export default class Treeview extends Component {
  state = {
    searchInput: "",
    dataForTree: null,
  };

  handleSearchChange(e) {
    // let data = null;
    const val = e.target.value;
    if (val !== "") {
      // console.log("search " + val);
      api
        .executeProcedure("anbar.warehouse_tree_search", {
          title: val,
        })
        .then((data1) => {
          api
            .executeProcedure("[anbar].[warehouse_tree_select_sub_cat]")
            .then((data2) => {
              const dataForTree = [
                ...data1.splice(1, 1),
                ...data2,
                ...data1.splice(1, data1.length),
              ];

              this.setState({
                dataForTree,
              });
            });
        });
    }

    this.setState({
      searchInput: val,
    });
  }
  addToData({ tree, el, key, push_to_root }) {
    if (push_to_root) {
      el.children = [];
      tree.push(el);
    } else {
      if (!el.product_id) {
        // If category
        tree.forEach((rootEl) => {
          if (rootEl.id === el[key]) {
            el.children = [];
            rootEl.children.push(el);
          }
        });
      } else {
        // If product
        tree.forEach((rootEl) => {
          rootEl.children.forEach((cat) => {
            if (cat.id === el[key]) {
              cat.children.push(el);
            }
          });
        });
      }
    }
  }
  prepareProducts(initDataForTree, is_search) {
    let data = [];
    const dataForTree = [...initDataForTree];

    this.addToData({ tree: data, el: dataForTree[0], push_to_root: true });
    dataForTree.splice(1, dataForTree.length).forEach((el) => {
      this.addToData({
        tree: data,
        el,
        key: el.sub_gl_category_id ? "sub_gl_category_id" : "parent_id",
      });
    });

    if (is_search) {
      data = data.map((rootEl) => {
        // rootEl.children.filter((catArr) => catArr.children.length)
        rootEl.children = rootEl.children.filter(
          (catArr) => catArr.children.length !== 0
        );
        return rootEl;
      });
      console.log(data);
    }
    return data;
  }

  render() {
    return (
      <>
        <StyledDrawer
          drawerwidth={this.props.drawerwidth}
          active={this.props.active ? 1 : 0}
          variant="persistent"
          anchor="left"
          open={this.props.active ? true : false}
        >
          <SearchContainer>
            <StyledSearchInput
              autoComplete="off"
              placeholder="Axtarış"
              value={this.state.searchInput}
              onChange={(e) => this.handleSearchChange(e)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      this.setState({
                        searchInput: "",
                        dataForTree: null,
                      });
                    }}
                  >
                    <CloseOutlinedIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </SearchContainer>

          <TreeviewData
            select={(a) => this.props.selectProduct(a)}
            initData={this.props.data}
            data={
              this.props.data
                ? this.state.dataForTree
                  ? this.prepareProducts(this.state.dataForTree, true)
                  : this.prepareProducts(this.props.data)
                : []
            }
          />
          <div
            className="btns"
            style={{ display: this.props.alwaysActive ? "none" : "flex" }}
          >
            <StyledButton
              onClick={() => this.props.close()}
              startIcon={<VisibilityOffOutlinedIcon />}
            >
              Məhsulları  gizlət
            </StyledButton>
          </div>
        </StyledDrawer>
        <SpecialButton
          onClick={() => this.props.open()}
          startIcon={<VisibilityOutlinedIcon color="inherit" />}
          active={this.props.active ? 0 : 1}
        >
          Məhsulları göstər
        </SpecialButton>
      </>
    );
  }
}

// ===============================================================================================================================
//                                              STYLES
// ===============================================================================================================================

const StyledDrawer = styled(Drawer)`
  height: 100%;
  flex-shrink: 0;
  width: ${(props) => props.drawerwidth};

  .MuiDrawer-paper {
    height: 100%;
    overflow-y: hidden;
    width: ${(props) => props.drawerwidth};
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    .btns {
      padding: 10px;
      margin-top: auto;
      width: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 1px solid rgb(35, 31, 32, 0.1);
    }
  }

  svg {
    color: #faa61a;
  }

  /* @media (max-width: 1000px) {
		width: 380px;
		.MuiDrawer-paper {
			width: 380px;
		}
	} */
`;
const StyledButton = styled(Button)`
  padding: 5px 10px;

  .MuiButton-label {
    font-size: 1rem;
    text-transform: none;
    font-weight: 400;
  }
`;
const SpecialButton = styled(Button)`
  position: absolute;
  bottom: 15px;
  left: 25px;
  z-index: 10000;
  transition: 0.3s opacity;
  color: white;
  background-color: #faa61a;
  border-radius: 20px;
  pointer-events: ${(props) => (props.active ? "all" : "none")};
  opacity: ${(props) => (props.active ? "1" : "0")};
  padding: 5px 15px;

  &:hover {
    background-color: #faa61a;
  }

  svg {
    color: white !important;
  }

  .MuiButton-label {
    font-size: 1rem;
    text-transform: none;
    font-weight: 400;
  }
`;
const SearchContainer = styled.div`
  width: 100%;

  .MuiInput-underline:before {
    border-bottom: 1px solid rgb(35, 31, 32, 0.1);
  }
  .MuiInput-underline:hover:not(.Mui-disabled):before {
    border-bottom: 1px solid rgba(0, 0, 0, 0.57);
  }
  .MuiInput-underline:after {
    border-bottom: 1px solid #faa61a;
  }
`;
const StyledSearchInput = styled(Input)`
  width: 100%;
  padding: 10px 0 10px 15px;
`;
