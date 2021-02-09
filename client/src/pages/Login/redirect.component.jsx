import React from "react";

class RedirectToProcurement extends React.Component {
  componentDidMount() {
  window.location.replace("http://172.16.3.101:3000/?from=warehouse&action=login")
}
  render() {
    return null;
  }
}

export default RedirectToProcurement;
