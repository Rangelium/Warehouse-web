import React, { Component } from "react";
import styled from "styled-components";

import { Typography } from "@material-ui/core";
import { TreeView, TreeItem } from "@material-ui/lab";
import { ProductOptionsMenu } from "../components/OptionsMenu";

import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";

const StyledContainer = styled.div`
	width: 100%;
	height: 100%;
	overflow: auto;
	padding: 10px 5px;

	&::-webkit-scrollbar {
		width: 5px;
	}
	/* Track */
	&::-webkit-scrollbar-track {
		box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
		border-radius: 10px;
		border-radius: 10px;
	}
	/* Handle */
	&::-webkit-scrollbar-thumb {
		border-radius: 10px;
		border-radius: 10px;
		background: #d7d8d6;
		box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
	}
`;
const StyledTreeItem = styled(TreeItem)`
	position: relative;

	.MuiTreeItem-group {
		margin-left: 7px;
		padding-left: 7px;
		border-left: 1px solid rgb(35, 31, 32, 0.2);
	}

	.MuiTreeItem-content:hover .optionsBtn {
		opacity: 1;
		pointer-events: all;
	}

	.optionsBtn {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-40%);

		opacity: 0;
		pointer-events: none;
		transition: 0.3s;

		svg {
			transition: 0.2s color;
			transform: scale(1.1);
			color: #474c54 !important;

			&:hover {
				color: #faa61a !important;
			}
		}
	}
`;
const StyledLabel = styled.div`
	display: flex;
	align-items: center;

	svg {
		height: 18px;
		width: 18px;
		margin-right: 5px;
	}
	.amount {
		font-size: 0.9rem !important;
		opacity: 0.6;
		position: relative;
		left: 10px;
	}
	.MuiTypography-root {
		font-size: 1rem;
		font-weight: 400;
		font-size: 1rem;
		font-weight: 500;
		user-select: none;
	}
	.productLabel {
		font-size: 1rem;
		font-weight: 400;
	}
`;

export default class TreeviewData extends Component {
	state = {
		anchorEl: null,
		selectedProduct: null,
	};

	renderTree(nodes) {
		return (
			<StyledTreeItem
				onClick={(e) => {
					if (e.target.tagName === "svg" || e.target.tagName === "path") return;
					if (nodes.product_id) this.props.select(nodes);
				}}
				key={nodes.id}
				nodeId={nodes.id.toString()}
				endIcon={nodes.product_id ? <InfoOutlinedIcon /> : null}
				label={
					nodes.product_id ? (
						<StyledLabel>
							<Typography className="productLabel">
								{nodes.title.length < 30 ? nodes.title : `${nodes.title.slice(0, 30)}...`}
							</Typography>
							{/* <Typography className="amount">{`/ 10`}</Typography> */}
							<div className="optionsBtn">
								<MoreHorizIcon
									onClick={(e) =>
										this.setState({ anchorEl: e.currentTarget, selectedProduct: nodes })
									}
								/>
							</div>
						</StyledLabel>
					) : (
						<StyledLabel>
							<Typography>{nodes.title}</Typography>
							{/* <Typography className="amount">{`/ 100`}</Typography> */}
						</StyledLabel>
					)
				}
			>
				{Array.isArray(nodes.children)
					? nodes.children.map((node) => this.renderTree(node))
					: null}
			</StyledTreeItem>
		);
	}
	productAllId() {
		return this.props.initData
			? this.props.initData.map((node) => node.id.toString())
			: null;
	}

	render() {
		return (
			<StyledContainer>
				{this.props.initData ? (
					<TreeView
						defaultExpanded={this.productAllId()}
						defaultCollapseIcon={<ExpandMoreOutlinedIcon />}
						defaultExpandIcon={<ChevronRightOutlinedIcon />}
					>
						{this.props.data.map((nodes) => this.renderTree(nodes))}
					</TreeView>
				) : null}
				<ProductOptionsMenu
					product={this.state.selectedProduct}
					anchorEl={this.state.anchorEl}
					handleClose={() => this.setState({ anchorEl: null })}
				/>
			</StyledContainer>
		);
	}
}
