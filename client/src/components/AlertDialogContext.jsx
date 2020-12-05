import React, { Component } from "react";
import AlertDialog from "./AlertDialog";

export const AlertDialogContext = React.createContext(Promise.reject);

export class AlertDialogProvider extends Component {
  constructor() {
    super();

    this.state = {
      confirmationState: null,
    };

    this.awaitingPromiseRef = React.createRef();
    this.alertDialogRef = React.createRef();
  }

  openConfirmation = (options) => {
    this.setState(
      {
        confirmationState: options,
      },
      () => {
        this.alertDialogRef.current.fillData();
      }
    );
    return new Promise((resolve, reject) => {
      this.awaitingPromiseRef.current = { resolve, reject };
    });
  };
  handleSubmit() {
    if (this.awaitingPromiseRef.current) {
      this.awaitingPromiseRef.current.resolve();
    }

    this.setState({
      confirmationState: null,
    });
  }
  handleClose() {
    if (this.awaitingPromiseRef.current) {
      this.awaitingPromiseRef.current.reject();
    }

    this.setState({
      confirmationState: null,
    });
  }

  render() {
    return (
      <>
        <AlertDialogContext.Provider
          value={{
            alert: this.openConfirmation,
          }}
        >
          {this.props.children}
        </AlertDialogContext.Provider>
        <AlertDialog
          ref={this.alertDialogRef}
          open={Boolean(this.state.confirmationState)}
          onSubmit={() => this.handleSubmit()}
          onClose={() => this.handleClose()}
          {...this.state.confirmationState}
        />
      </>
    );
  }
}
