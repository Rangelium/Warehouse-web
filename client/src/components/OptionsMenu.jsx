import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "./GlobalDataProvider";
import { AlertDialogContext } from "./AlertDialogContext";
import NewCategoryForm from "./NewCategoryForm";
import NewProductForm from "./NewProductForm";

import { Menu, MenuItem, ListItemText, Backdrop } from "@material-ui/core";

const StyledMenuItem = styled(MenuItem)`
	border-bottom: 1px solid rgba(35, 31, 32, 0.2);

	&:last-child {
		border-bottom: none;
	}
`;
const StyledText = styled(ListItemText)`
	color: #231f20;
`;

export class ProductOptionsMenu extends Component {
	static contextType = GlobalDataContext;
	state = {
		newProdForm: false,
	};

	// * Create New Product form handlers
	handleNewProdFormOpen() {
		this.setState({ newProdForm: true });
	}
	handleNewProdFormClose() {
		this.setState({ newProdForm: false });
	}

	render() {
		return (
			<>
				<Menu
					anchorEl={this.props.anchorEl}
					open={Boolean(this.props.anchorEl)}
					onClose={this.props.handleClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
					transformOrigin={{ vertical: "top", horizontal: "right" }}
					getContentAnchorEl={null}
					keepMounted
					style={{ zIndex: 1000000000000 }}
				>
					<StyledMenuItem
						onClick={() => {
							this.props.handleClose();
						}}
					>
						<StyledText>Məhsulu yenilə</StyledText>
					</StyledMenuItem>
					<StyledMenuItem
						onClick={() => {
							this.props.handleClose();
							this.context
								.alert({
									title: "Kateqoriyanı sil",
									description: `Are you sure you want to delete “${this.props.product.title}”?`,
								})
								.then(() => {
									console.log("Success");
								})
								.catch(() => {
									console.log("Error");
								});
						}}
					>
						<StyledText>Məhsulu sil</StyledText>
					</StyledMenuItem>
				</Menu>

				<Backdrop open={Boolean(this.props.anchorEl)} style={{ zIndex: 100000000000 }} />
				<NewProductForm
					product={this.props.product}
					open={this.state.newProdForm}
					handleClose={() => this.handleNewProdFormClose()}
				/>
			</>
		);
	}
}
export class CategoryOptionsMenu extends Component {
	static contextType = GlobalDataContext;
	state = {
		newCatForm: false,
		newProdForm: false,
	};

	// * Create New Category form handlers
	handleNewCatFormOpen() {
		this.setState({ newCatForm: true });
	}
	handleNewCatFormClose() {
		this.setState({ newCatForm: false });
	}

	// * Create New Product form handlers
	handleNewProdFormOpen() {
		this.setState({ newProdForm: true });
	}
	handleNewProdFormClose() {
		this.setState({ newProdForm: false });
	}

	render() {
		return (
			<>
				<Menu
					anchorEl={this.props.anchorEl}
					open={Boolean(this.props.anchorEl)}
					onClose={this.props.handleClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
					transformOrigin={{ vertical: "top", horizontal: "right" }}
					getContentAnchorEl={null}
					keepMounted
					style={{ zIndex: 1000000000000 }}
				>
					<StyledMenuItem
						onClick={() => {
							this.handleNewCatFormOpen();
							this.props.handleClose();
						}}
					>
						<StyledText>Yeni kateqoriya yarat</StyledText>
					</StyledMenuItem>
					<StyledMenuItem
						onClick={() => {
							this.handleNewProdFormOpen();
							this.props.handleClose();
						}}
					>
						<StyledText>Yeni məhsul əlavə et</StyledText>
					</StyledMenuItem>
					<StyledMenuItem
						onClick={() => {
							this.props.handleClose();
						}}
					>
						<StyledText>Kateqoriyanı yenilə</StyledText>
					</StyledMenuItem>
					<StyledMenuItem
						onClick={() => {
							this.context
								.alert(
									"Kateqoriyanı sil",
									"Are you sure you want to delete “Kreslolar/Stullar”?"
								)
								.then((res) => {
									console.log(res);
								});
							this.props.handleClose();
						}}
					>
						<StyledText>Kateqoriyanı sil</StyledText>
					</StyledMenuItem>
					<StyledMenuItem
						onClick={() => {
							this.props.handleClose();
						}}
					>
						<StyledText>Kateqoriyanı təmizlə</StyledText>
					</StyledMenuItem>
				</Menu>
				<Backdrop open={Boolean(this.props.anchorEl)} style={{ zIndex: 100000000000 }} />
				<NewCategoryForm
					product={this.props.product}
					open={this.state.newCatForm}
					handleClose={() => this.handleNewCatFormClose()}
				/>
				<NewProductForm
					product={this.props.product}
					open={this.state.newProdForm}
					handleClose={() => this.handleNewProdFormClose()}
				/>
			</>
		);
	}
}
