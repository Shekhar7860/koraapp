import React, { Component } from "react";
import { TextInput } from "react-native";
import PropTypes from "prop-types";

export default class MultiLine extends Component {
  static propTypes = {
    maxLines: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || ""
    };
  }

  onChangeText = text => {
    const { maxLines, onChangeText } = this.props;
    const lines = text.split("\n");

    if (lines.length <= (maxLines || 1)) {
      onChangeText(text);
      this.setState({ value: text });
    }
 };

 render() {
   const { onChangeText, multiline, value, multiStyle, placeholder,...other} = this.props;
   return (
     <TextInput
        placeholder={placeholder}
       style={multiStyle}
       multiline={true}
       value={this.state.value}
       onChangeText={this.onChangeText}
       
     />
   );
 }
}