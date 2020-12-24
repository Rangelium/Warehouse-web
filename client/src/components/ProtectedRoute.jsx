import React from "react";
import { Route, Redirect } from "react-router-dom";
import { GlobalDataContext } from "./GlobalDataProvider";

export default class ProtectedRoute extends React.Component {
  static contextType = GlobalDataContext;

  render() {
    const { Component, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={(props) => {
          if (Boolean(this.context.userId)) {
            return (
              <Component
                {...props}
                reloadNavbarStorage={this.props.reloadNavbarStorage}
              />
            );
          } else {
            console.log("kek");
            return (
              <Redirect
                to={{
                  pathname: "/login",
                  state: {
                    from: this.props.location,
                  },
                }}
              />
            );
          }
        }}
      />
    );
  }
}
