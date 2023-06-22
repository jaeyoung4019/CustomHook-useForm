import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type emptyVariableType = string[];
interface valueAndReg {
    reg?: RegExp;
    blur?: () => void;
    value: string;
}

type variableAndRegType = Record<string, valueAndReg>;

interface variableInterface {
    [key: string]: string;
}

/**
 *
 * @param initFormVariable
 * @param empty  // empty 검사할 변수
 */
const useForm: (
    initFormVariable: variableAndRegType,
    empty?: emptyVariableType
) => [
    variableInterface,
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    () => boolean,
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        name: string;
        value: string;
    }
] = (initFormVariable: variableAndRegType, empty?: emptyVariableType) => {
    /**
     * initVariable 의 구조를 풀어서 다시 만들어서 setVariable 에 setting 합니다. value 만 빼서 처리 reg 따로 처리하기 위함.
     */
    const initVariable = useMemo(() => {
        let obj: variableInterface = {};
        for (let key in initFormVariable) {
            obj[key] = initFormVariable[key].value;
        }
        return obj;
    }, []);
    // 결과적으로 헨들링 될 variable 입니다.
    const [formVariable, setFormVariable] =
        useState<variableInterface>(initVariable);
    // 국제화 처리 변수의 이름 , tag name , 국제화 변수명 3개 일치해야합니다.
    const { t } = useTranslation('error');
    /**
     *   From Change 함수
     */
    const onChangeVariable = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            /**
             * reg 변수 넣으면 정규식 검사 수행합니다.
             * ! => 언디파인드 뜨면 에러
             * ? => 언디파인드 아니면 실행 언디파인드면 넘어감
             * error 국제화 이름 , 변수명 , name 맞춰주어야 합니다.
             */
            if (initFormVariable[name]?.reg !== undefined && value.length > 0)
                if (!initFormVariable[name].reg?.test(value)) {
                    alert(t(name));
                    return false;
                }
            /**
             * 체크박스 input insert 하기
             * name 에 check_변수명
             */
            const arrayName = name.split('_');
            // 혹시라도 다른 element 가 들어오는 것을 방지 e.target.nodeName === "INPUT"
            if (arrayName[0] === 'check' && e.target.nodeName === 'INPUT') {
                // type 단언적 선언 as
                const { checked } = e.target as HTMLInputElement;
                // check_ [변수명] 셋팅할 변수명을 입력받아 값을 넣어줍니다.
                setFormVariable((inputVariable: variableInterface) => {
                    return {
                        ...inputVariable,
                        [arrayName[1]]: checked.toString(),
                    };
                });
                return false;
            }

            setFormVariable((inputVariable: variableInterface) => {
                return { ...inputVariable, [name]: value };
            });
        },
        [formVariable]
    );

    /**
     * Form 인자 빈 값 체크 false => 에러 true => 통과
     */
    const emptyCheck = useCallback(() => {
        if (empty !== undefined) {
            const array = empty?.filter(
                (arrayValue) =>
                    formVariable[arrayValue] !== undefined &&
                    isEmpty(formVariable[arrayValue].valueOf())
            );
            return !(array.length > 0);
        } else {
            return true;
        }
    }, [formVariable, empty]);

    /**
     * focus out 되었을 때 벨류 체크하기 위한 function
     */
    const onBlurCheck = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            return { name, value };
        },
        []
    );

    return [formVariable, onChangeVariable, emptyCheck, onBlurCheck];
};

// 넘어온 값이 빈값인지 체크합니다.
// !value 하면 생기는 논리적 오류를 제거하기 위해
// 명시적으로 value == 사용
// [], {} 도 빈값으로 처리
const isEmpty = function (value: string | any[]): boolean {
    if (
        value == '' ||
        value == null ||
        (typeof value == 'object' && !Object.keys(value).length)
    ) {
        return true;
    } else {
        return false;
    }
};

export default useForm;
