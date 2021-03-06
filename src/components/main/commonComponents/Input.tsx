import React, {ChangeEvent, FC, memo} from 'react';
import TextField from '@material-ui/core/TextField';
import {createStyles, makeStyles} from '@material-ui/core/styles';


export const Input: FC<InputSearchPropsType> = memo( props => {

    const {placeholderValue, value, dispatchHandler} = props
    const classes = useStyles()

    const onChangeHandler = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        dispatchHandler(e.target.value)
    }


    return (
        <TextField
            className={classes.input}
            placeholder={placeholderValue ? placeholderValue : 'Search'}
            type="text"
            variant="outlined"
            fullWidth
            size="small"
            onChange={onChangeHandler}
            value={value}
        />
    )
})


//types
type InputSearchPropsType = {
    placeholderValue: string
    value: string
    dispatchHandler: (value: string) => void
}

const useStyles = makeStyles(() =>
    createStyles({
        input: {
            height: '40px',
            marginRight: '15px'
        },
    }),
);