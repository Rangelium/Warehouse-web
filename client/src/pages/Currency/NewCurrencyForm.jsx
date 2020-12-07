import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "../../components/GlobalDataProvider";
import api from "../../tools/connect";

import { CustomTextInput, CustomButton } from "../../components/UtilComponents";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";

export default class CreateClusterForm extends Component {
  static contextType = GlobalDataContext;
  state = {
    title: "",
    fullTitle: "",
  };

  createCluster(e) {
    e.preventDefault();

    api
      .executeProcedure("anbar.currency_insert", {
        full_title: this.state.fullTitle,
        title: this.state.title,
        user_id: this.context.userId,
      })
      .then((res) => {
        this.context.success(`Created ${this.state.title}`);
        this.setState({
          fullTitle: "",
          title: "",
        });
        this.props.setCluster(res[0].row_id);
        this.props.close();
      })
      .catch((err) => this.context.error(err.errText));
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  render() {
    return (
      <StyledDialog
        style={{ zIndex: 214700 }}
        open={this.props.open}
        onClose={this.props.close}
      >
        <form autoComplete="off" onSubmit={this.createCluster.bind(this)}>
          <DialogTitle>Yeni valyuta yarat</DialogTitle>
          <DialogContent>
            <CustomTextInput
              required
              variant="outlined"
              label="Adı"
              name="fullTitle"
              value={this.state.fullTitle}
              onChange={this.handleChange.bind(this)}
            />
            <CustomTextInput
              required
              variant="outlined"
              label="Abbreviatura"
              name="title"
              value={this.state.title}
              onChange={this.handleChange.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <CustomButton variant="outlined" type="submit">
              Əlavə et
            </CustomButton>
            <CustomButton variant="outlined" onClick={this.props.close}>
              İmtına
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

    .MuiTextField-root {
      width: 100%;
    }
  }

  .MuiDialogActions-root {
    padding: 8px 24px;
    justify-content: flex-start;
  }
`;
