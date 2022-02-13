import {
    background,
    BackgroundProps, border,
    BorderProps, color,
    ColorProps, compose, display, DisplayProps, flexbox, FlexboxProps, grid, GridProps, layout,
    LayoutProps, position,
    PositionProps, space,
    SpaceProps, system, typography,
    TypographyProps
} from "styled-system";
import {HTMLAttributes} from "react";
import styled from "styled-components";

interface BoxProps
    extends BackgroundProps,
        BorderProps,
        LayoutProps,
        PositionProps,
        SpaceProps,
        ColorProps,
        TypographyProps,
        DisplayProps,
        FlexboxProps,
        GridProps,
        Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
    textTransform?: 'capitalize' | 'uppercase' | 'lowercase' | 'none'
}

const textTransform = system({
    textTransform: true,
})

const Box = styled.div<BoxProps>(
    compose(background, border, layout, position, space, color, typography, display, grid, flexbox, textTransform)
)

export default Box