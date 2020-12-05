import React, { Component } from "react";
import styled from "styled-components";
import Dropzone from "react-dropzone";

const StyledSection = styled.div`
  width: 100%;
  height: 100%;

  .drop-zone {
    height: inherit;
    border: 2px dashed #acacac;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    p {
      pointer-events: none;
    }

    .file-info {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    &:focus {
      outline: none;
    }
  }
`;

export default class FileImport extends Component {
  constructor() {
    super();

    this.dropRef = React.createRef();
  }

  onDrop = (files) => {
    const [uploadedFile] = files;
    this.props.setFile(uploadedFile);

    this.dropRef.current.style.border = "2px dashed #ffaa00";
  };

  updateBorder = (dragState) => {
    if (dragState === "over") {
      this.dropRef.current.style.border = "2px dashed #ffaa00";
      return;
    }
    if (dragState === "leave") {
      this.dropRef.current.style.border = "2px dashed #acacac";
      return;
    }
  };

  render() {
    return (
      <StyledSection>
        <Dropzone
          onDrop={this.onDrop}
          onDragEnter={() => this.updateBorder("over")}
          onDragLeave={() => this.updateBorder("leave")}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ className: "drop-zone" })} ref={this.dropRef}>
              <input {...getInputProps()} />
              <p>Drag and drop a file OR click here to select a file</p>
              {this.props.file && (
                <div className="file-info">
                  <strong>Selected file:</strong>
                  <p>{this.props.file.name}</p>
                </div>
              )}
            </div>
          )}
        </Dropzone>
      </StyledSection>
    );
  }
}
