import React, { Component } from "react";
import styled from "styled-components";
import { GlobalDataContext } from "./GlobalDataProvider";
import uuid from "react-uuid";
import api from "../tools/connect";
import dayjs from "dayjs";

import {
	CustomSelect,
	CustomSelectItem,
	CustomTextInput,
	CustomButton,
} from "./UtilComponents";
import {
	Typography,
	Divider,
	Paper,
	Backdrop,
	CircularProgress,
} from "@material-ui/core";

const StyledForm = styled.form`
	width: 100%;
	height: 100%;
	position: relative;

	padding: 25px 45px;
`;
const StyledPaper = styled(Paper)`
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;

	.main {
		width: 90%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
		grid-gap: 15px;
	}
`;

export default class InitialRemaindersForm extends Component {
	static contextType = GlobalDataContext;
	state = {
		title: "",
		barcode: "",
		productId: "",
		searchData: [],
		quantity: "",
		clusterId: "",
		clustersData: [],
		price: "",
		currency: "",
		currencyData: [],
		expDate: dayjs().format("YYYY-MM-DD"),
		productCell: "",
		manufactorer: "",
		manufactorerData: [],
		reason: "",

		loading: false,
	};

	async componentDidMount() {
		const searchResult = await api.executeProcedure(
			"anbar.bulk_buying_session_info_search",
			{ title: "" }
		);

		this.setState({
			searchData: searchResult,
		});
	}
	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
		});
	}

	handleSubmit(e) {
		e.preventDefault();
		this.setState({
			loading: true,
		});

		api
			.executeProcedure("anbar.input_initial_remainders", {
				product_id: this.state.productId ? this.state.productId : null,
				storage_id: this.context.storageId ? this.context.storageId : null,
				cluster_id: this.state.clusterId ? this.state.clusterId : null,
				barcode: this.state.barcode ? this.state.barcode : null,
				exp_date: this.state.expDate
					? dayjs(this.state.expDate).format("YYYY.MM.DD")
					: null,
				currency: this.state.currency ? this.state.currency : null,
				product_manufacturer: this.state.manufactorer ? this.state.manufactorer : null,
				product_cell: this.state.productCell ? this.state.productCell : null,
				quantity: this.state.quantity ? this.state.quantity : null,
				price: this.state.price ? this.state.price : null,
				reason: this.state.reason ? this.state.reason : null,
			})
			.then(() => {
				this.context.success(`Added ${this.state.title}`);
				this.setState({
					loading: false,

					title: "",
					barcode: "",
					productId: "",
					searchData: [],
					quantity: "",
					clusterId: "",
					clustersData: [],
					price: "",
					currency: "",
					currencyData: [],
					expDate: dayjs().format("YYYY-MM-DD"),
					productCell: "",
					manufactorer: "",
					manufactorerData: [],
					reason: "",
				});
			})
			.catch((err) => {
				this.context.error(err.errText);
				this.setState({
					loading: false,
				});
			});
	}

	async prepareForm(product) {
		this.setState({
			loading: true,
		});
		const clustersData = await api.executeProcedure(
			"anbar.cluster_names_select_all_for_specific_product",
			{ product_id: product.product_id }
		);

		const currencyData = await api.executeProcedure("anbar.currency_select");

		const manufactorerData = await api.executeProcedure(
			"anbar.product_manufacturer_select_all"
		);

		this.setState({
			productId: product.product_id,
			title: product.title,
			barcode: product.barcode,
			clustersData,
			currencyData,
			manufactorerData,
			loading: false,

			quantity: "",
			clusterId: "",
			price: "",
			currency: "",
			expDate: dayjs().format("YYYY-MM-DD"),
			productCell: "",
			manufactorer: "",
			reason: "",
		});
	}

	render() {
		return (
			<StyledForm onSubmit={this.handleSubmit.bind(this)} autoComplete="off">
				<StyledPaper elevation={3}>
					<Typography noWrap className="title" variant="h4">
						Məhsulu əlavə et
					</Typography>

					<div className="main">
						<CustomSelect
							required
							label="Məhsulun adı"
							name="title"
							value={this.state.title}
							onChange={this.handleChange.bind(this)}
						>
							{this.state.searchData.map((product) => (
								<CustomSelectItem
									onClick={() => this.prepareForm(product)}
									key={uuid()}
									value={product.title}
								>
									{product.title}
								</CustomSelectItem>
							))}
						</CustomSelect>

						<CustomSelect
							required
							label="Barkod"
							name="barcode"
							value={this.state.barcode}
							onChange={this.handleChange.bind(this)}
						>
							{this.state.searchData.map((product) => (
								<CustomSelectItem
									onClick={() => this.prepareForm(product)}
									key={uuid()}
									value={product.barcode}
								>
									{product.barcode}
								</CustomSelectItem>
							))}
						</CustomSelect>

						<CustomTextInput
							disabled={this.state.productId ? false : true}
							required
							type="number"
							variant="outlined"
							label="Vahid qiyməti"
							name="price"
							value={this.state.price}
							onChange={this.handleChange.bind(this)}
						/>

						<CustomSelect
							disabled={this.state.productId ? false : true}
							required
							label="Valyuta"
							name="currency"
							value={this.state.currency}
							onChange={this.handleChange.bind(this)}
						>
							{this.state.currencyData.map((currency) => (
								<CustomSelectItem key={uuid()} value={currency.id}>
									{currency.full_title}
								</CustomSelectItem>
							))}
						</CustomSelect>

						<CustomTextInput
							disabled={this.state.productId ? false : true}
							required
							type="number"
							variant="outlined"
							label="Miqdar"
							name="quantity"
							value={this.state.quantity}
							onChange={this.handleChange.bind(this)}
						/>

						<CustomSelect
							disabled={this.state.productId ? false : true}
							label="Ölçü vahidi"
							name="clusterId"
							value={this.state.clusterId}
							onChange={this.handleChange.bind(this)}
						>
							{this.state.clustersData.map((cluster) => (
								<CustomSelectItem key={uuid()} value={cluster.barcode}>
									{cluster.barcode}
								</CustomSelectItem>
							))}
						</CustomSelect>

						<CustomTextInput
							disabled={this.state.productId ? false : true}
							type="number"
							variant="outlined"
							label="Yararlıq müddəti"
							name="expDate"
							type="date"
							value={this.state.expDate}
							onChange={this.handleChange.bind(this)}
						/>

						<CustomTextInput
							disabled={this.state.productId ? false : true}
							variant="outlined"
							label="Hüceyrə nömrəsi"
							name="productCell"
							value={this.state.productCell}
							onChange={this.handleChange.bind(this)}
						/>

						<CustomSelect
							disabled={this.state.productId ? false : true}
							label="İstehsalçı"
							name="manufactorer"
							value={this.state.manufactorer}
							onChange={this.handleChange.bind(this)}
						>
							{this.state.manufactorerData.map((manufactorer) => (
								<CustomSelectItem key={uuid()} value={manufactorer.id}>
									{manufactorer.title}
								</CustomSelectItem>
							))}
						</CustomSelect>

						<CustomTextInput
							disabled={this.state.productId ? false : true}
							variant="outlined"
							label="Səbəb..."
							name="reason"
							value={this.state.reason}
							onChange={this.handleChange.bind(this)}
						/>
					</div>

					<CustomButton
						type="submit"
						variant="outlined"
						style={{ padding: "15px 35px" }}
						onClick={() => {
							if (!this.state.productId) {
								this.context.error("Select product first");
							}
						}}
					>
						Əlavə et
					</CustomButton>
				</StyledPaper>
				<Backdrop
					style={{
						zIndex: 1000,
						position: "absolute",
						backgroundColor: "rgba(0, 0, 0, 0.7)",
					}}
					open={this.state.loading}
				>
					<CircularProgress style={{ color: "#fff" }} />
				</Backdrop>
			</StyledForm>
		);
	}
}
