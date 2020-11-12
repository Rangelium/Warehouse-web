import React, { Component } from "react";
import styled from "styled-components";
import uuid from "react-uuid";
import { GlobalDataContext } from "./GlobalDataProvider";
import NewCategoryForm from "./NewCategoryForm";
import NewProductForm from "./NewProductForm";
import api from "../tools/connect";

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

export default class OptionsMenu extends Component {
	static contextType = GlobalDataContext;
	state = {
		newProdForm: false,
		prodDataForUpdate: null,
		updateProdData: false,

		newCatForm: false,
		updateCatData: false,
	};

	// Main functions for product
	updateProduct(data) {
		console.log(data);
		alert("Coming soon updateProduct!");
	}
	deleteProduct() {
		alert("Coming soon deleteProduct!");
	}

	// Main functions for category
	showCategoryInfo() {
		alert("Coming soon showCategoryInfo!");
	}
	createNewCategory(data) {
		console.log(data);
		alert("Coming soon CreateNewCategory!");
	}
	createNewProduct(data) {
		console.log(data);
		alert("Coming soon createNewProduct!");
	}
	updateCategory(data) {
		console.log(data);
		alert("Coming soon updateCategory!");
	}
	deleteCategory() {
		alert("Coming soon deleteCategory!");
	}
	clearCategory() {
		alert("Coming soon clearCategory!");
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
					{this.props.product
						? this.props.product.product_id
							? [
									<StyledMenuItem
										key={uuid()}
										onClick={async () => {
											const data = await api.executeProcedure(
												"anbar.warehouse_select_one_product",
												{ product_id: this.props.product.product_id }
											);

											this.setState({
												newProdForm: true,
												prodDataForUpdate: data[0],
												updateProdData: true,
											});
										}}
									>
										<StyledText>Məhsulu yenilə</StyledText>
									</StyledMenuItem>,
									<StyledMenuItem
										key={uuid()}
										onClick={() => {
											this.context
												.alert({
													title: "Kateqoriyanı sil",
													description: `Are you sure you want to DELETE “${this.props.product.title}”?`,
												})
												.then(() => {
													this.deleteProduct();
												})
												.catch(() => {});
										}}
									>
										<StyledText>Məhsulu sil</StyledText>
									</StyledMenuItem>,
							  ]
							: [
									<StyledMenuItem key={uuid()} onClick={() => {}}>
										<StyledText>Kateqoriyanın info göstər</StyledText>
									</StyledMenuItem>,
									<StyledMenuItem
										key={uuid()}
										onClick={() => {
											this.setState({ updateCatData: false, newCatForm: true });
										}}
									>
										<StyledText>Yeni kateqoriya yarat</StyledText>
									</StyledMenuItem>,
									<StyledMenuItem
										key={uuid()}
										onClick={() => {
											this.setState({
												newProdForm: true,
												prodDataForUpdate: null,
												updateProdData: false,
											});
										}}
									>
										<StyledText>Yeni məhsul əlavə et</StyledText>
									</StyledMenuItem>,
									<StyledMenuItem
										key={uuid()}
										onClick={() => {
											this.setState({ newCatForm: true, updateCatData: true });
										}}
									>
										<StyledText>Kateqoriyanı yenilə</StyledText>
									</StyledMenuItem>,
									<StyledMenuItem
										key={uuid()}
										onClick={() => {
											this.context
												.alert({
													title: "Kateqoriyanı sil",
													description: `Are you sure you want to DELETE “${this.props.product.title}”?`,
												})
												.then(() => this.deleteCategory())
												.catch(() => {});
										}}
									>
										<StyledText>Kateqoriyanı sil</StyledText>
									</StyledMenuItem>,
									<StyledMenuItem
										key={uuid()}
										onClick={() => {
											this.context
												.alert({
													title: "Kateqoriyanı təmizlə",
													description: `Are you sure you want to CLEAR “${this.props.product.title}”?`,
												})
												.then(() => this.clearCategory())
												.catch(() => {});
										}}
									>
										<StyledText>Kateqoriyanı təmizlə</StyledText>
									</StyledMenuItem>,
							  ]
						: null}
				</Menu>

				<Backdrop open={Boolean(this.props.anchorEl)} style={{ zIndex: 100000000000 }} />
				{this.props.product ? (
					this.props.product.product_id ? (
						<NewProductForm
							product={this.props.product}
							open={this.state.newProdForm}
							handleClose={() => this.setState({ newProdForm: false })}
							updateData={this.state.prodDataForUpdate}
							isUpdate={this.state.updateProdData}
							onUpdateSubmit={this.updateProduct}
							onCreateSubmit={this.createNewProduct}
						/>
					) : (
						<>
							<NewProductForm
								product={this.props.product}
								open={this.state.newProdForm}
								handleClose={() => this.setState({ newProdForm: false })}
								updateData={this.state.prodDataForUpdate}
								isUpdate={this.state.updateProdData}
								onUpdateSubmit={this.updateProduct}
								onCreateSubmit={this.createNewProduct}
							/>
							<NewCategoryForm
								product={this.props.product}
								open={this.state.newCatForm}
								handleClose={() => this.setState({ newCatForm: false })}
								isUpdate={this.state.updateCatData}
								onUpdateSubmit={this.updateCategory}
								onCreateSubmit={this.createNewCategory}
							/>
						</>
					)
				) : null}
			</>
		);
	}
}
