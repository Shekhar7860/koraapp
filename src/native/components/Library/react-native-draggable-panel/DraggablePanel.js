import * as React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const DEFAULT_PANEL_HEIGHT = SCREEN_HEIGHT - 100;
export const DraggablePanel = React.forwardRef(
  (
    {
      visible = false,
      animationDuration = 500,
      expandable = false,
      hideOnPressOutside = true,
      overlayBackgroundColor = 'black',
      overlayOpacity = 0.8,
      borderRadius = 0,
      initialHeight = DEFAULT_PANEL_HEIGHT / 2,
      hideOnBackButtonPressed = true,
      hideable = true,
      onDismiss,
      children,
    },
    ref,
  ) => {
    const [animatedValue] = React.useState(new Animated.Value(0));
    const [popupVisible, togglePopupVisibility] = React.useState(false);
    const [animating, setAnimating] = React.useState(false);
    const [height, setHeight] = React.useState(
      Math.min(initialHeight, DEFAULT_PANEL_HEIGHT),
    );
    const [innerContentHeight, setInnerContentHeight] = React.useState(
      Math.min(initialHeight, DEFAULT_PANEL_HEIGHT),
    );
    const scrollViewRef = React.useRef(null);
    React.useEffect(() => {
      setInnerContentHeight(Math.min(initialHeight, DEFAULT_PANEL_HEIGHT));
      setHeight(Math.min(initialHeight, DEFAULT_PANEL_HEIGHT));
    },[initialHeight])
    React.useEffect(() => {
      if (!animating) {
        if (visible && !popupVisible) {
          show();
        } else if (popupVisible) {
          hide();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);
    const show = () => {
      if (!animating) {
        animatedValue.setValue(0);
        setInnerContentHeight(Math.min(initialHeight, DEFAULT_PANEL_HEIGHT));
        setAnimating(true);
        togglePopupVisibility(true);
        Animated.timing(animatedValue, {
          toValue: height / DEFAULT_PANEL_HEIGHT,
          duration: animationDuration,
          useNativeDriver: true,
        }).start(() => {
          scrollViewRef.current?.scrollTo({
            x: 0,
            y: SCREEN_HEIGHT - (SCREEN_HEIGHT * height) / DEFAULT_PANEL_HEIGHT,
            animated: false,
          });
          setAnimating(false);
        });
      }
    };
    const hide = () => {
      if (!animating) {
        setAnimating(true);
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }).start(() => {
          scrollViewRef.current?.scrollTo({
            x: 0,
            y: SCREEN_HEIGHT,
            animated: false,
          });
          togglePopupVisibility(false);
          setAnimating(false);
          onDismiss && onDismiss();
        });
      }
    };
    const onBackButtonPress = () => {
      if (
        Platform.OS === 'android' &&
        hideOnBackButtonPressed &&
        !animating &&
        popupVisible &&
        hideable
      ) {
        hide();
      }
    };
    React.useImperativeHandle(ref, () => ({
      show,
      hide,
    }));
    const onScroll = (event) => {
      if (!animating) {
        const {y} = event.nativeEvent.contentOffset;
        if (
          !expandable &&
          y < SCREEN_HEIGHT - (SCREEN_HEIGHT * height) / DEFAULT_PANEL_HEIGHT
        ) {
          return;
        }
        animatedValue.setValue(1 - Math.floor(y) / Math.floor(SCREEN_HEIGHT));
        // >= Fix the android issue, cause for some reason it goes for more than SCREEN_HEIGHT
        // if the use swipes faster
        if (Math.floor(y) >= Math.floor(SCREEN_HEIGHT)) {
          togglePopupVisibility(false);
          setAnimating(false);
          onDismiss && onDismiss();
        }
      }
    };
    const onScrollBeginDrag = (event) => {
      if (event.nativeEvent.contentOffset.y !== 0 && expandable) {
        setInnerContentHeight(DEFAULT_PANEL_HEIGHT);
      }
    };
    const onMomentumScrollEnd = (event) => {
      if (expandable) {
        const {y} = event.nativeEvent.contentOffset;
        if (y !== 0) {
          setInnerContentHeight(height);
        } else {
          setInnerContentHeight(DEFAULT_PANEL_HEIGHT);
        }
      }
    };
    return React.createElement(
      Modal,
      {
        visible: popupVisible,
        transparent: true,
        animated: false,
        onRequestClose: onBackButtonPress,
      },
      React.createElement(
        View,
        {style: styles.popupContainer},
        React.createElement(Animated.View, {
          style: {
            ...styles.popupOverlay,
            backgroundColor: overlayBackgroundColor,
            opacity: animatedValue.interpolate({
              inputRange: [0, height / DEFAULT_PANEL_HEIGHT],
              outputRange: [0, overlayOpacity],
              extrapolate: 'clamp',
            }),
          },
        }),
        React.createElement(
          ScrollView,
          {
            ref: scrollViewRef,
            style: styles.scroll,
            scrollEventThrottle: 16,
            contentContainerStyle: styles.scrollContainer,
            onScroll: onScroll,
            bounces: false,
            showsVerticalScrollIndicator: false,
            onScrollBeginDrag: onScrollBeginDrag,
            onMomentumScrollEnd: onMomentumScrollEnd,
            scrollEnabled: hideable,
            decelerationRate: 0,
            snapToOffsets: [
              0,
              SCREEN_HEIGHT - (SCREEN_HEIGHT * height) / DEFAULT_PANEL_HEIGHT,
              SCREEN_HEIGHT,
            ],
          },
          React.createElement(
            TouchableWithoutFeedback,
            {
              disabled: !hideOnPressOutside || animating || !hideable,
              onPress: hide,
            },
            React.createElement(View, {style: styles.hideContainer}),
          ),
        ),
        React.createElement(
          Animated.View,
          {
            style: [
              styles.popupContentContainer,
              {
                borderTopLeftRadius: borderRadius,
                borderTopRightRadius: borderRadius,
                transform: [
                  {
                    translateY: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -DEFAULT_PANEL_HEIGHT],
                    }),
                  },
                ],
              },
            ],
          },
          React.createElement(View, {
            style: expandable ? styles.indicator : null,
          }),
          React.createElement(
            View,
            {
              style: [
                styles.content,
                {height: expandable ? innerContentHeight : height},
              ],
            },
            children,
          ),
        ),
      ),
    );
  },
);
const styles = StyleSheet.create({
  popupContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  popupOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  popupContentContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    bottom: -DEFAULT_PANEL_HEIGHT,
    height: DEFAULT_PANEL_HEIGHT,
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 60,
    height: 4,
    borderRadius: 50,
    top: -16,
  },
  scroll: {
    ...StyleSheet.absoluteFillObject,
    transform: [{rotate: '180deg'}],
  },
  scrollContainer: {
    height: SCREEN_HEIGHT * 2,
  },
  hideContainer: {
    flex: 1,
  },
  content: {
    width: '100%',
  },
});
