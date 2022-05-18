import XDate from 'xdate';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useMemo } from 'react';
import { TouchableWithoutFeedback, TouchableOpacity, Text, View, ViewStyle, ViewProps, TextStyle, StyleProp } from 'react-native';

import { xdateToData } from '../../../interface';
import { Theme, DayState, DateData } from '../../../types';
import styleConstructor from './style';
import Dot from '../dot';
import { MarkingProps } from '../marking';


export interface PeriodDayProps extends ViewProps {
    theme?: Theme;
    date?: string;
    marking?: MarkingProps;
    state?: DayState;
    onPress?: (date?: DateData) => void;
    onLongPress?: (date?: DateData) => void;
    accessibilityLabel?: string;
    testID?: string;
}

type MarkingStyle = {
    containerStyle: StyleProp<ViewStyle>;
    textStyle: StyleProp<TextStyle>;
    startingDay?: ViewStyle;
    endingDay?: ViewStyle;
    day?: ViewStyle;
}

const PeriodDay = (props: PeriodDayProps) => {
    const { theme, marking, date, onPress, onLongPress, state, accessibilityLabel, testID, children, additionalData } = props;
    const dateData = date ? xdateToData(new XDate(date)) : undefined;
    const style = useRef(styleConstructor(theme));

    const markingStyle = useMemo(() => {
        const defaultStyle: MarkingStyle = { textStyle: {}, containerStyle: {} };

        if (!marking) {
            return defaultStyle;
        } else {
            if (marking.disabled) {
                defaultStyle.textStyle = { color: style.current.disabledText.color };
            } else if (marking.inactive) {
                defaultStyle.textStyle = { color: style.current.inactiveText.color };
            } else if (marking.selected) {
                defaultStyle.textStyle = { color: style.current.selectedText.color };
            }

            if (marking.startingDay) {
                defaultStyle.startingDay = { backgroundColor: marking.color };
            }
            if (marking.endingDay) {
                defaultStyle.endingDay = { backgroundColor: marking.color };
            }
            if (!marking.startingDay && !marking.endingDay) {
                defaultStyle.day = { backgroundColor: marking.color };
            }

            if (marking.textColor) {
                defaultStyle.textStyle = { color: marking.textColor };
            }
            if (marking.customTextStyle) {
                defaultStyle.textStyle = marking.customTextStyle;
            }
            if (marking.customContainerStyle) {
                defaultStyle.containerStyle = marking.customContainerStyle;
            }

            return defaultStyle;
        }
    }, [marking]);

    const containerStyle = useMemo(() => {
        const containerStyle = [style.current.base];

        if (state === 'today') {
            containerStyle.push(style.current.today);
        }

        if (marking) {
            containerStyle.push({
                borderRadius: 17,
                overflow: 'hidden'
            });

            if (markingStyle.containerStyle) {
                containerStyle.push(markingStyle.containerStyle);
            }

            const start = markingStyle.startingDay;
            const end = markingStyle.endingDay;
            if (start && !end) {
                containerStyle.push({ backgroundColor: markingStyle.startingDay?.backgroundColor });
            } else if (end && !start || end && start) {
                containerStyle.push({ backgroundColor: markingStyle.endingDay?.backgroundColor });
            }
        }
        return containerStyle;
    }, [marking, state]);

    const textStyle = useMemo(() => {
        const textStyle = [style.current.text];

        if (state === 'disabled') {
            textStyle.push(style.current.disabledText);
        } else if (state === 'inactive') {
            textStyle.push(style.current.inactiveText);
        } else if (state === 'today') {
            textStyle.push(style.current.todayText);
        }

        if (marking) {
            if (markingStyle.textStyle) {
                textStyle.push(markingStyle.textStyle);
            }
        }

        return textStyle;
    }, [marking, state]);

    const fillerStyles = useMemo(() => {
        const leftFillerStyle: ViewStyle = { backgroundColor: undefined };
        const rightFillerStyle: ViewStyle = { backgroundColor: undefined };
        let fillerStyle = {};

        const start = markingStyle.startingDay;
        const end = markingStyle.endingDay;

        if (start && !end) {
            rightFillerStyle.backgroundColor = markingStyle.startingDay?.backgroundColor;
        } else if (end && !start) {
            leftFillerStyle.backgroundColor = markingStyle.endingDay?.backgroundColor;
        } else if (markingStyle.day) {
            leftFillerStyle.backgroundColor = markingStyle.day?.backgroundColor;
            rightFillerStyle.backgroundColor = markingStyle.day?.backgroundColor;
            fillerStyle = { backgroundColor: markingStyle.day?.backgroundColor };
        }

        return { leftFillerStyle, rightFillerStyle, fillerStyle };
    }, [marking]);

    const additionalDataStyles = useMemo(() => {
        const leftBorderFiller: ViewStyle = { borderColor: 'green', borderTopWidth: 1, borderBottomWidth: 1 };
        const rightBorderFiller: ViewStyle = { borderColor: 'green', borderTopWidth: 1, borderBottomWidth: 1 };
        const additionalMarkingStyle: ViewStyle = { borderTopRightRadius: 20, borderBottomRightRadius: 20, borderRightWidth: 2 }

        return { leftBorderFiller, rightBorderFiller, additionalMarkingStyle }
    }, [additionalData])

    const renderFillers = () => {
        if (marking) {
            return (
                <View style={[style.current.fillers, fillerStyles.fillerStyle]}>
                    <View style={[style.current.leftFiller, fillerStyles.leftFillerStyle]} />
                    <View style={[style.current.rightFiller, fillerStyles.rightFillerStyle]} />
                </View>
            );
        }
    };

    const renderAdditionalDataBorders = () => {
        if (additionalData) {
            return (
                <View style={[style.current.fillers]}>
                    <View style={[style.current.leftFiller, additionalDataStyles.leftFillerStyle]} />
                    <View style={[style.current.rightFiller, additionalDataStyles.rightFillerStyle]} />
                </View>
            )
        }
    }

    const _onPress = useCallback(() => {
        onPress?.(dateData);
    }, [onPress]);

    const _onLongPress = useCallback(() => {
        onLongPress?.(dateData);
    }, [onLongPress]);

    const Component = marking ? TouchableWithoutFeedback : TouchableOpacity;

    return (
        <Component
            testID={testID}
            onPress={_onPress}
            onLongPress={_onLongPress}
            disabled={marking?.disableTouchEvent}
            accessible
            accessibilityRole={marking?.disableTouchEvent ? undefined : 'button'}
            accessibilityLabel={accessibilityLabel}
        >
            <View style={style.current.wrapper}>
                {renderFillers()}
                {renderAdditionalDataBorders}
                <View style={[containerStyle, additionalDataStyles.additionalMarkingStyle]}>
                    <Text allowFontScaling={false} style={textStyle}>
                        {String(children)}
                    </Text>
                    <Dot theme={theme} color={marking?.dotColor} marked={marking?.marked} />
                </View>
            </View>
        </Component>
    );
};

export default PeriodDay;
PeriodDay.displayName = 'PeriodDay';
PeriodDay.propTypes = {
    state: PropTypes.oneOf(['selected', 'disabled', 'inactive', 'today', '']),
    marking: PropTypes.any,
    theme: PropTypes.object,
    onPress: PropTypes.func,
    onLongPress: PropTypes.func,
    date: PropTypes.string
};
