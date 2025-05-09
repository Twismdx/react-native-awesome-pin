/**
 * @author Luke Brandon Farrell
 * @description Keyboard component with error status bar and interactive keys
 */

import React, { Component } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import Ripple from "react-native-material-ripple";
import PropTypes from "prop-types";

const backAsset = require("./back.png");

class PinKeyboard extends Component {
  /**
   * [ Built-in React method. ]
   * Setup the component. Executes when the component is created
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      error: null,
    };
  }

  /**
   * [ Built-in React method. ]
   * Executed when the component is mounted to the screen.
   */
  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * [ Built-in React method. ]
   * Executed when the component is unmounted from the screen
   */
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  /**
   * [ Built-in React method. ]
   * Allows us to render JSX to the screen
   */
  render() {
    const { containerStyle, keyboardDefaultStyle, keyboardRowStyle } = styles;
    const { keyboard, keyboardStyle } = this.props;

    return (
      <View style={containerStyle}>
        {this.renderError()}
        <View style={[keyboardDefaultStyle, keyboardStyle]}>
          {
            // Maps each array of numbers in the keyboardValues array
            keyboard.map((row, r) => (
              <View key={r} style={keyboardRowStyle}>
                {
                  // Maps each number in row and creates key for that number
                  row.map((element, k) => this.renderKey(element, r, k))
                }
              </View>
            ))
          }
        </View>
      </View>
    );
  }

  /**
   * Renders the error
   * @return {jsx|null}
   */
  renderError() {
    const { errorDefaultStyle, errorTextDefaultStyle } = styles;
    const { errorStyle, errorTextStyle } = this.props;
    const { error } = this.state;

    if (error) {
      return (
        <View style={[errorDefaultStyle, errorStyle]}>
          <Text style={[errorTextDefaultStyle, errorTextStyle]}>{error}</Text>
        </View>
      );
    }
    return null;
  }

  /**
   * Renders a key on the keyboard
   * @param entity
   * @param row
   * @param column
   * @return {jsx}
   */
  renderKey(entity, row, column) {
    const {
      keyContainerStyle,
      keyboardDisabledDefaultStyle,
      keyDefaultStyle,
      keyTextDefaultStyle,
      keyImageDefaultStyle,
    } = styles;

    const {
      disableRippleEffect,
      keyDown,
      keyboardFunc,
      keyboardDisabledStyle,
      keyStyle,
      keyTextStyle,
      keyImageStyle,
    } = this.props;

    const { disabled } = this.state;
    // Defensive - default func matrix for back/other keys
    const keyboardFuncSet = keyboardFunc
      ? keyboardFunc
      : [
          [null, null, null],
          [null, null, null],
          [null, null, null],
          [null, 0, () => this.props.keyDown("back")],
        ];

    /**
     * Defensive rendering: only allow numbers/strings => <Text>, images => <Image>
     * nulls render nothing.
     */
    let keyJsx = null;
    if (entity == null) {
      keyJsx = null;
    } else if (
      (typeof entity === "number" || typeof entity === "string") &&
      entity !== ""
    ) {
      // If it's a number or string (even if string'd digit, "1" etc)
      keyJsx = (
        <Text style={[keyTextDefaultStyle, keyTextStyle]}>{entity}</Text>
      );
    } else if (
      (typeof entity === "object" && entity.uri) || // asset from require or uri string
      entity === backAsset // match imported back image
    ) {
      keyJsx = (
        <Image
          style={[keyImageDefaultStyle, keyImageStyle]}
          source={entity}
          resizeMode="contain"
        />
      );
    } else {
      // fallback, show nothing (prevents crash)
      keyJsx = null;
    }

    // We want to block keyboard interactions if it has been disabled.
    if (!disabled) {
      const KeyComponent = disableRippleEffect ? TouchableOpacity : Ripple;
      const keyProps = {
        [disableRippleEffect ? "onPress" : "onPressIn"]: () =>
          keyboardFuncSet[row] &&
          typeof keyboardFuncSet[row][column] === "function"
            ? keyboardFuncSet[row][column]()
            : keyDown(entity),
      };

      return (
        <KeyComponent
          rippleColor={"#000"}
          key={column}
          {...keyProps}
          style={[keyContainerStyle, keyDefaultStyle, keyStyle]}
        >
          {keyJsx}
        </KeyComponent>
      );
    } else {
      return (
        <View
          key={column}
          style={[
            keyContainerStyle,
            keyDefaultStyle,
            keyStyle,
            keyboardDisabledDefaultStyle,
            keyboardDisabledStyle,
          ]}
        >
          {keyJsx}
        </View>
      );
    }
  }

  /**
   * Function used to display an error above the keyboard
   * @param error
   */
  throwError(error) {
    this.setState({
      error,
    });
  }

  /**
   * Function used to clear the error on the keyboard
   */
  clearError() {
    this.setState({ error: null });
  }

  /**
   * Function used to disable the keyboard
   */
  disable() {
    this.setState({
      disabled: true,
    });
  }

  /**
   * Function used to enable the keyboard
   */
  enable() {
    this.setState({
      disabled: false,
    });
  }
}

PinKeyboard.propTypes = {
  onRef: PropTypes.any.isRequired,
  keyDown: PropTypes.func.isRequired,
  keyboard: PropTypes.array,
  keyboardFunc: PropTypes.array,
  // Style props
  keyboardStyle: PropTypes.object,
  keyboardDisabledStyle: PropTypes.object,
  keyStyle: PropTypes.object,
  keyTextStyle: PropTypes.object,
  keyImageStyle: PropTypes.object,
  errorStyle: PropTypes.object,
  errorTextStyle: PropTypes.object,
  disableRippleEffect: PropTypes.bool,
};

PinKeyboard.defaultProps = {
  // Keyboard configuration. The default contains a key
  // for each number 0 - 9 and a back button.
  keyboard: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [null, 0, backAsset],
  ],
  // Keyboard functions. By default the text (number) in the
  // keyboard array will be passed via the keyDown callback.
  // Use this array to set custom functions for certain keys.
  keyboardFunc: null,
  keyboardErrorDisplayTime: 3000,
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: null,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  // Style applied to the keyboard. Must contain a height or
  // the keyboard will not be displayed.
  keyboardDefaultStyle: {
    height: 250,
    backgroundColor: "#FFF",
  },
  keyboardRowStyle: {
    flex: 1,
    flexDirection: "row",
  },
  keyContainerStyle: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  // Style applied to keyboard when it is disabled.
  keyboardDisabledDefaultStyle: {
    backgroundColor: "#FFF",
  },
  // Style the individual keys
  keyDefaultStyle: {
    backgroundColor: "#FFF",
    borderRightColor: "#e8e8e8",
    borderRightWidth: 1,
    borderBottomColor: "#e8e8e8",
    borderBottomWidth: 1,
  },
  // Style for the text inside a key
  keyTextDefaultStyle: {
    ...Platform.select({
      ios: {
        fontFamily: "HelveticaNeue",
      },
      android: {
        fontFamily: "Roboto",
      },
    }),
    fontWeight: "400",
    fontSize: 25,
    textAlign: "center",
    color: "#222222",
  },
  // Style for an image inside a key
  keyImageDefaultStyle: {
    width: 28,
    height: 28,
  },
  errorDefaultStyle: {
    height: 30,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DA0F72",
  },
  errorTextDefaultStyle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default PinKeyboard;
