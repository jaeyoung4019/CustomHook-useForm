import React, {Fragment, useEffect} from 'react';
import useForm from "../../../Hooks/useForm";
import { Input } from '@chakra-ui/react'
import { Checkbox, CheckboxGroup , Stack , useCheckbox } from '@chakra-ui/react'
import {APIConfig} from "../../../api/APIConfigParam";
import useSelectQuery from "../../../Hooks/react-query/useSelectQuery";
import {apiRequest} from "../../../api/instance";

const Settings = () => {

    const initVariable = {
        bio: {value: ""},
        template1: {value: "true"},
        template2: {value: "true"},
        template3: {value: "true"},
        product1: {value: "true"},
        product2: {value: "true"},
        product3: {value: "true"},
    }
    // empty 검사할 것을 array 로 넣어줍니다.
    const emptyCheckArray = ["bio"]
    const [variable , onChangeVariable , emptyCheck , onBlur] = useForm(initVariable , emptyCheckArray)

    const handleBlurCheck = (e : React.ChangeEvent<HTMLInputElement>) => {
        const {name , value} = onBlur(e);
        console.log(value)
    }

    return(
        <Fragment>
            <Input onChange={onChangeVariable} value={variable.bio} name={"bio"} onBlur={handleBlurCheck}/>
            <CheckboxGroup colorScheme='green' defaultValue={['template1', 'template2' , 'template3']}>
                <Stack spacing={[2, 2]} direction={['column']}>
                    <Checkbox size='lg' value='template1' name={"check_template1"} onChange={ (e) => {onChangeVariable(e)}}>template1</Checkbox>
                    <Checkbox size='lg' value='template2' name={"check_template2"} onChange={ (e) => {onChangeVariable(e)}}>template2</Checkbox>
                    <Checkbox size='lg' value='template3' name={"check_template3"} onChange={ (e) => {onChangeVariable(e)}}>template3</Checkbox>
                </Stack>
            </CheckboxGroup>
            <CheckboxGroup colorScheme='green' defaultValue={['product1', 'product2' , 'product3']}>
                <Stack spacing={[2, 2]} direction={['column']}>
                    <Checkbox size='lg' value='product1' name={"check_product1"} onChange={ (e) => {onChangeVariable(e)}}>product1</Checkbox>
                    <Checkbox size='lg' value='product2' name={"check_product2"} onChange={ (e) => {onChangeVariable(e)}}>product2</Checkbox>
                    <Checkbox size='lg' value='product3' name={"check_product3"} onChange={ (e) => {onChangeVariable(e)}}>product3</Checkbox>
                </Stack>
            </CheckboxGroup>
        </Fragment>
    );
};

export default Settings;
