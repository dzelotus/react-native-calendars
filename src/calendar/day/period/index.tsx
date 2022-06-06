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
    const { theme, marking, date, onPress, onLongPress, state, accessibilityLabel, testID, children, additionalMarking } = props;
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
                overflow: 'hidden',
            });

            if (markingStyle.containerStyle) {
                containerStyle.push(markingStyle.containerStyle);
            }

            const start = markingStyle.startingDay;
            const end = markingStyle.endingDay;
            if (start && !end) {
                containerStyle.push({ backgroundColor: markingStyle.startingDay?.backgroundColor, borderRadius: 19, width: 38 });
            } else if (end && !start || end && start) {
                containerStyle.push({ backgroundColor: markingStyle.endingDay?.backgroundColor, borderRadius: 19, width: 38 });
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
            if (marking.today) {
                textStyle.push({ color: marking.textColor })
            }
        }

        return textStyle;
    }, [marking, state]);

    const fillerStyles = useMemo(() => {
        let fillerStyle = {};
        let leftFillerStyle = {};
        let rightFillerStyle = {};
        let dayFillerStyle = {};

        if (marking) {

            const start = marking.startingDay;
            const end = marking.endingDay
            const monday = marking.weekday == 1
            const sunday = marking.weekday == 7
            const endOfMonth = marking.endOfMonth == date
            const startOfNextMonth = marking.startOfNextMonth == date
            const selected = marking.selected

            fillerStyle = { position: 'absolute', height: 38, width: '100%', left: 0, right: 0, backgroundColor: marking.color }

            if (sunday || endOfMonth) {
                fillerStyle = { ...fillerStyle, borderTopRightRadius: 19, borderBottomRightRadius: 19 }
            } else if (monday || startOfNextMonth) {
                fillerStyle = { ...fillerStyle, borderTopLeftRadius: 19, borderBottomLeftRadius: 19 }
            }

            if (!start && !end && !sunday && !monday && !endOfMonth && !startOfNextMonth && selected) {
                dayFillerStyle = {
                    backgroundColor: '#a1e6ff',
                    height: 38,
                    position: 'absolute',
                    left: 0,
                    right: 0,
                }
            }

            if ((start && !end && !sunday && !endOfMonth) || (monday && !end) || (startOfNextMonth && !end)) {

                rightFillerStyle = {
                    backgroundColor: '#a1e6ff',
                    height: 38,
                    position: 'absolute',
                    right: 0,
                    width: '50%'
                }
            }

            if ((end && !start && !monday && !startOfNextMonth) || (sunday && !start) || (endOfMonth && !start)) {
                leftFillerStyle = {
                    backgroundColor: '#a1e6ff',
                    height: 38,
                    position: 'absolute',
                    left: 0,
                    width: '50%',
                }
            }
        }

        return { leftFillerStyle, rightFillerStyle, fillerStyle, dayFillerStyle };
    }, [marking])

    const getBorderStyle = (item, index) => {
        let leftBorder = {}
        let dayBorder = {}
        let rightBorder = {}
        let justBorder = {}
        let rightFiller = {}
        let leftFiller = {}

        const height = 38

        const borderColor = item.border.color
        const borderWidth = item.border.width


        justBorder = { position: 'absolute', height: height, width: '100%', left: 0, right: 0, }
        if ((item.startingDay || item.weekday == 1 || item.date == item.startOfNextMonth) && !item.endingDay) {
            leftBorder = {
                borderTopLeftRadius: 19,
                borderBottomLeftRadius: 19,
                borderLeftWidth: borderWidth,
                borderTopWidth: borderWidth,
                borderBottomWidth: borderWidth,
                borderColor: borderColor,
            }
            rightFiller = {
                borderTopWidth: borderWidth,
                borderBottomWidth: borderWidth,
                borderColor: borderColor,
                height: height,
                position: 'absolute',
                right: 0,
                width: '50%'
            }
            if (item.weekday == 7) {
                rightBorder = {
                    borderTopRightRadius: 19,
                    borderBottomRightRadius: 19,
                    borderRightWidth: borderWidth,
                    borderTopWidth: borderWidth,
                    borderBottomWidth: borderWidth,
                    borderColor: borderColor
                }
                rightFiller = {

                }
            }
        } else if ((item.endingDay || item.weekday == 7 || (item.startingDay && item.weekday == 7) || item.date == item.endOfMonth) && !item.startingDay) {
            rightBorder = {
                borderTopRightRadius: 19,
                borderBottomRightRadius: 19,
                borderRightWidth: borderWidth,
                borderTopWidth: borderWidth,
                borderBottomWidth: borderWidth,
                borderColor: borderColor
            }
            leftFiller = {
                borderTopWidth: borderWidth,
                borderBottomWidth: borderWidth,
                borderColor: borderColor,
                height: height,
                position: 'absolute',
                left: 0,
                width: '50%'
            }
            if (item.weekday == 1) {
                leftBorder = {
                    borderTopLeftRadius: 19,
                    borderBottomLeftRadius: 19,
                    borderLeftWidth: borderWidth,
                    borderTopWidth: borderWidth,
                    borderBottomWidth: borderWidth,
                    borderColor: borderColor,
                }
                leftFiller = {

                }
            }
        } else if (item.startingDay && item.endingDay) {
            justBorder = {
                borderWidth: borderWidth,
                borderRadius: 19,
                borderColor: borderColor,
                position: 'absolute',
                width: '100%',
                left: 0,
                right: 0,
                height: height,
            }
        } else if (item.endingDay && item.weekday == 1) {
            leftBorder = {
                borderTopLeftRadius: 19,
                borderBottomLeftRadius: 19,
                borderLeftWidth: borderWidth,
                borderTopWidth: borderWidth,
                borderBottomWidth: borderWidth,
                borderColor: borderColor,
            }
        } else {
            dayBorder = {
                borderTopWidth: borderWidth,
                borderBottomWidth: borderWidth,
                borderColor: borderColor,
                position: 'absolute',
                width: '100%',
                left: 0,
                right: 0,
                height: height,
            }
        }

        return { leftBorder, rightBorder, dayBorder, justBorder, rightFiller, leftFiller }
    }

    const getBackgroundStyle = (item, index) => {
        const firstLastDayBackgroundColor = item.background.firstLastDayBackgroundColor
        const backgroundColor = item.background.backgroundColor

        let dayBackground = {}
        let firstLastDayBackground = {}

        if (item.background.backgroundColor) {
            dayBackground = {
                backgroundColor: backgroundColor,
            }

        }

        if ((item.startingDay || item.endingDay) && backgroundColor) {
            firstLastDayBackground = {
                backgroundColor: firstLastDayBackgroundColor,
                borderRadius: 19
            }
        }

        return { dayBackground, firstLastDayBackground }
    }

    const additionalDataBorder = () => {
        if (additionalMarking.length > 0) {
            return additionalMarking.map((item, index) => {
                const borderStyle = getBorderStyle(item, index)
                const backgroundStyle = getBackgroundStyle(item, index)
                return (
                    <View style={[
                        borderStyle.justBorder,
                        borderStyle.leftBorder,
                        borderStyle.rightBorder,
                        borderStyle.dayBorder,
                        backgroundStyle.dayBackground,
                        backgroundStyle.firstLastDayBackground
                    ]}
                    />
                )
            })
        }
    }

    const additionalDataBorderFillers = () => {
        if (additionalMarking.length > 0) {
            return additionalMarking.map((item, index) => {
                const borderStyle = getBorderStyle(item, index)
                const backgroundStyle = getBackgroundStyle(item, index)
                const zIndex = item.background.backgroundColor ? 0 : 5
                return (
                    <View style={[
                        borderStyle.rightFiller,
                        borderStyle.leftFiller,
                        borderStyle.dayBorder,
                        backgroundStyle.dayBackground,
                        { zIndex: zIndex }
                    ]}
                    />
                )
            })
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
            style={{ width: '100%' }}
        >
            <View style={[style.current.wrapper]}>

                {
                    additionalDataBorderFillers()
                }
                <View
                    style={[fillerStyles.rightFillerStyle, fillerStyles.leftFillerStyle, fillerStyles.dayFillerStyle]}
                />
                <View style={[containerStyle, { height: 38, width: 38, justifyContent: 'center' }]}>
                    <View style={[fillerStyles.fillerStyle]} />
                    {
                        additionalDataBorder()
                    }
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