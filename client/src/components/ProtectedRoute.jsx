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
					if (this.context.userLoggedIn) {
						return <Component {...props} />;
					} else {
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
