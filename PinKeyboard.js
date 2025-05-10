import React, { Component } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Platform,
  Pressable
} from "react-native";
import PropTypes from "prop-types";

const backAsset = require("./back.png");

class PinKeyboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      error: null
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  render() {
    const { containerStyle, keyboardDefaultStyle, keyboardRowStyle } = styles;
    const { keyboard, keyboardStyle, keyboardDisabledStyle } = this.props;
    return (
      <View style={containerStyle}>
        {this.renderError()}
        <View style={[keyboardDefaultStyle, keyboardStyle, keyboardDisabledStyle]}>
          {keyboard.map((row, r) => (
            <View key={r} style={keyboardRowStyle}>
              {row.map((element, k) => this.renderKey(element, r, k))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  renderError() {
    const { errorDefaultStyle, errorTextDefaultStyle } = styles;
    const { errorStyle, errorTextStyle } = this.props;
    const { error } = this.state;
    if (!error) return null;
    return (
      <View style={[errorDefaultStyle, errorStyle]}>
        <Text style={[errorTextDefaultStyle, errorTextStyle]}>{error}</Text>
      </View>
    );
  }

  renderKey(entity, row, column) {
    const {
      disableRippleEffect,
      keyDown,
      keyboardFunc,
      keyStyle,
      keyTextStyle,
      keyImageStyle
    } = this.props;

    const {
      keyContainerStyle: defaultContainerStyle,
      keyDefaultStyle: defaultKeyStyle,
      keyTextDefaultStyle: defaultTextStyle,
      keyImageDefaultStyle: defaultImageDefaultStyle
    } = styles;

    // build the function map (falling back to built-in back)
    const keyboardFuncSet =
      keyboardFunc || [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, () => keyDown("back")]
      ];

    const fn = keyboardFuncSet[row][column];
    const onPress = () => (fn ? fn() : keyDown(entity));

    // decide what goes inside the button
    let content;
    if (typeof this.props.renderKey === "function") {
      content = this.props.renderKey(entity, row, column);
    } else if (fn) {
      content = (
        <Image
          style={[defaultImageDefaultStyle, keyImageStyle]}
          source={entity}
        />
      );
    } else {
      content = (
        <Text style={[defaultTextStyle, keyTextStyle]}>{entity}</Text>
      );
    }

    return (
      <Pressable
        key={column}
        onPress={onPress}
        android_ripple={
          !disableRippleEffect ? { color: "#000" } : undefined
        }
        style={({ pressed }) => [
          defaultContainerStyle,
          defaultKeyStyle,
          keyStyle,
          pressed && !disableRippleEffect ? { opacity: 0.6 } : null
        ]}
        disabled={this.state.disabled}
      >
        {content}
      </Pressable>
    );
  }

  throwError(error) {
    this.setState({ error });
  }

  clearError() {
    this.setState({ error: null });
  }

  disable() {
    this.setState({ disabled: true });
  }

  enable() {
    this.setState({ disabled: false });
  }
}

PinKeyboard.propTypes = {
  onRef: PropTypes.any.isRequired,
  keyDown: PropTypes.func.isRequired,
  keyboard: PropTypes.array,
  keyboardFunc: PropTypes.array,
  keyboardStyle: PropTypes.object,
  keyboardDisabledStyle: PropTypes.object,
  keyStyle: PropTypes.object,
  keyTextStyle: PropTypes.object,
  keyImageStyle: PropTypes.object,
  errorStyle: PropTypes.object,
  errorTextStyle: PropTypes.object,
  disableRippleEffect: PropTypes.bool
};

PinKeyboard.defaultProps = {
  keyboard: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [null, 0, backAsset]],
  keyboardFunc: null,
  keyVibration: true,
  shakeVibration: true
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: null,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end"
  },
  keyboardDefaultStyle: {
    height: 250,
    backgroundColor: "#FFF"
  },
  keyboardRowStyle: {
    flex: 1,
    flexDirection: "row"
  },
  keyContainerStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  keyDefaultStyle: {
    backgroundColor: "#FFF",
    borderRightColor: "#e8e8e8",
    borderRightWidth: 1,
    borderBottomColor: "#e8e8e8",
    borderBottomWidth: 1
  },
  keyTextDefaultStyle: {
    ...Platform.select({
      ios: { fontFamily: "HelveticaNeue" },
      android: { fontFamily: "Roboto" }
    }),
    fontWeight: "400",
    fontSize: 25,
    textAlign: "center",
    color: "#222222"
  },
  keyImageDefaultStyle: {
    width: 28,
    height: 28
  },
  errorDefaultStyle: {
    height: 30,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DA0F72"
  },
  errorTextDefaultStyle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold"
  }
});

export default PinKeyboard;
