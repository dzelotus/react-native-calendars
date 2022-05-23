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
                overflow: 'hidden'
            });

            if (markingStyle.containerStyle) {
                containerStyle.push(markingStyle.containerStyle);
            }

            const start = markingStyle.startingDay;
            const end = markingStyle.endingDay;
            if (start && !end) {
                containerStyle.push({ backgroundColor: markingStyle.startingDay?.backgroundColor, borderRadius: 17 });
            } else if (end && !start || end && start) {
                containerStyle.push({ backgroundColor: markingStyle.endingDay?.backgroundColor, borderRadius: 17 });
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
        let fillerStyle = {};
        let leftFillerStyle = {};
        let rightFillerStyle = {};
        let dayFillerStyle = {};

        if (marking) {
            const start = marking.startingDay;
            const end = marking.endingDay
            const monday = marking.weekday == 1
            const sunday = marking.weekday == 7

            fillerStyle = { position: 'absolute', height: 34, width: '100%', left: 0, right: 0, backgroundColor: marking.color }
            if ((start || monday) && !sunday && !end) {
                fillerStyle = { ...fillerStyle, borderTopLeftRadius: 17, borderBottomLeftRadius: 17 }
                rightFillerStyle = {
                    backgroundColor: '#a1e6ff',
                    height: 34,
                    position: 'absolute',
                    right: 0,
                    width: '50%'
                }
            } else if ((end && !sunday && !start) || (sunday && !start)) {
                fillerStyle = { ...fillerStyle, borderTopRightRadius: 17, borderBottomRightRadius: 17 }
                leftFillerStyle = {
                    backgroundColor: '#a1e6ff',
                    height: 34,
                    position: 'absolute',
                    left: 0,
                    width: '50%'
                }
            } else if (!start) {
                dayFillerStyle = {
                    backgroundColor: '#a1e6ff',
                    height: 34,
                    position: 'absolute',
                    left: 0,
                    right: 0,
                }
            }
        }

        return { leftFillerStyle, rightFillerStyle, fillerStyle, dayFillerStyle };
    }, [marking])

    const borderStyle = useMemo(() => {

        let leftBorder = {}
        let dayBorder = {}
        let rightBorder = {}
        let justBorder = {}
        let rightFiller = {}
        let leftFiller = {}

        if (additionalMarking) {
            justBorder = { position: 'absolute', height: 34, width: '100%', left: 0, right: 0 }
            if (additionalMarking.startingDay || additionalMarking.weekday == 1) {
                leftBorder = {
                    borderTopLeftRadius: 19,
                    borderBottomLeftRadius: 19,
                    borderLeftWidth: 2,
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: 'green',
                }
                rightFiller = {
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: 'green',
                    height: 34,
                    position: 'absolute',
                    right: 0,
                    width: '50%'
                }
            } else if (additionalMarking.endingDay || additionalMarking.weekday == 7) {
                rightBorder = {
                    borderTopRightRadius: 19,
                    borderBottomRightRadius: 19,
                    borderRightWidth: 2,
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: 'green'
                }
                leftFiller = {
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: 'green',
                    height: 34,
                    position: 'absolute',
                    left: 0,
                    width: '50%'
                }
            } else {
                dayBorder = {
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: 'green',
                    position: 'absolute',
                    width: '100%',
                    left: 0,
                    right: 0,
                    height: 34
                }
            }
        }

        return { leftBorder, rightBorder, dayBorder, justBorder, rightFiller, leftFiller }

    }, [additionalMarking])

    const _onPress = useCallback(() => {
        console.log('PRESS')
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

                <View
                    style={[borderStyle.rightFiller, borderStyle.leftFiller, borderStyle.dayBorder, { zIndex: 5 }]}
                />
                <View
                    style={[fillerStyles.rightFillerStyle, fillerStyles.leftFillerStyle, fillerStyles.dayFillerStyle]}
                />
                <View style={[containerStyle]}>
                    <View style={[fillerStyles.fillerStyle]} />
                    <View style={[borderStyle.justBorder, borderStyle.leftBorder, borderStyle.rightBorder]} />
                    <Text allowFontScaling={false} style={textStyle}>
                        {String(children)}
                    </Text>
                    <Dot theme={theme} color={marking?.dotColor} marked={marking?.marked} />
                </View>
            </View>
        </Component>
    );
    /* return (
        <View style={{ borderColor: 'red', borderWidth: 2, width: '100%', alignContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
                onPress={_onPress}
                onLongPress={_onLongPress}
            >
                <View>
                    <Text>
                        {String(children)}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    ) */
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