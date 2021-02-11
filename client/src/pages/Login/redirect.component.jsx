import React from "react";

class RedirectToProcurement extends React.Component {
  componentDidMount() {
  window.location.replace("http://192.168.0.182:54321/?from=warehouse&action=login")
}
  render() {
    return null;
  }
}

export default RedirectToProcurement;
