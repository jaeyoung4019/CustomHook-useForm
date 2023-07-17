# 개발환경
---
- 노드 버전
```ts
v16.16.0
```
- npm 버전
```ts
8.11.0
```

- ## useForm
  Form 데이터를 inputComponent 를 생성하지 않는다는 조건 하에 공통적으로 관리할 수 있는 Hook 입니다.
  ```ts
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
  ```
  정규식 처리와 같은 부가 요청을 처리하기 위해 객체 삽입의 형태가
  ```ts
    const initVariable = {
        bio: {value: ""},
        template1: {value: "true" , reg: 정규식},
        template2: {value: "true"},
        template3: {value: "true"},
        product1: {value: "true"},
        product2: {value: "true"},
        product3: {value: "true"},
    }
  ```
  되기 때문에 value 를 variable 에 매칭하기 위해 object 를 재 생성합니다.
  ```ts
    // 결과적으로 헨들링 될 variable 입니다.
    const [formVariable, setFormVariable] =
        useState<variableInterface>(initVariable);
  ```
  훅에서 반환할 variable 을 state 로 관리합니다.

  ```ts
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
  ```

  check box의 경우 -> check_변수명 의 컨벤션으로 넣어주어야 checked 값을 불러올 수 있습니다. 
  event.target.value -> string 으로 들어오기 때문에 number 타입에 대한 처리는 하지 않았습니다.
  reg 변수가 존재할 경우 -> if (!initFormVariable[name].reg?.test(value)) 를 통해 1차적으로 정규식 실패 사유를 보여줍니다.
  변수명에 일치하도록 국제화 이름을 넣어주어야 합니다.



  ### 2023.07.17 Update

  ```ts
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type emptyVariableType = string[];
interface valueAndReg {
    reg?: RegExp;
    blur?: () => void;
    value: string;
}

type variableAndRegType = Record<string, valueAndReg>;

/**
 *
 * @param initFormVariable
 * @param empty  // empty 검사할 변수
 */
const useForm: (
    initFormVariable: variableAndRegType,
    empty?: emptyVariableType
) => [
    useFormVariableInterface,
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
        let obj: useFormVariableInterface = {};
        for (let key in initFormVariable) {
            obj[key] = initFormVariable[key].value;
        }
        return obj;
    }, []);
    // 결과적으로 헨들링 될 variable 입니다.
    const [formVariable, setFormVariable] = useState<useFormVariableInterface>(initVariable);
    // 국제화 처리 변수의 이름 , tag name , 국제화 변수명 3개 일치해야합니다.
    const { t } = useTranslation("error");
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
            const arrayName = name.split("_");
            if (arrayName.length > 2) {
                const result = arrayName.reduce( (pre: string , cur: string) => {
                    if (pre === "check"){
                        return `${cur}`;
                    }
                    return `${pre}_${cur}`;
                })
                // 혹시라도 다른 element 가 들어오는 것을 방지 e.target.nodeName === "INPUT"
                if (arrayName[0] === "check" && e.target.nodeName === "INPUT") {
                    // type 단언적 선언 as
                    const { checked } = e.target as HTMLInputElement;
                    // check_ [변수명] 셋팅할 변수명을 입력받아 값을 넣어줍니다.
                    setFormVariable((inputVariable: useFormVariableInterface) => {
                        return {
                            ...inputVariable,
                            [result]: checked.toString()
                        };
                    });
                    return false;
                }
            } else {
                // 혹시라도 다른 element 가 들어오는 것을 방지 e.target.nodeName === "INPUT"
                if (arrayName[0] === "check" && e.target.nodeName === "INPUT") {
                    // type 단언적 선언 as
                    const { checked } = e.target as HTMLInputElement;
                    // check_ [변수명] 셋팅할 변수명을 입력받아 값을 넣어줍니다.
                    setFormVariable((inputVariable: useFormVariableInterface) => {
                        return {
                            ...inputVariable,
                            [arrayName[1]]: checked.toString()
                        };
                    });
                    return false;
                }
            }

            setFormVariable((inputVariable: useFormVariableInterface) => {
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
            const array = empty?.filter(arrayValue => formVariable[arrayValue] !== undefined && isEmpty(formVariable[arrayValue].valueOf()));
            return !(array.length > 0);
        } else {
            return true;
        }
    }, [formVariable, empty]);

    /**
     * focus out 되었을 때 벨류 체크하기 위한 function
     */
    const onBlurCheck = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        return { name, value };
    }, []);

    return [formVariable, onChangeVariable, emptyCheck, onBlurCheck];
};

// 넘어온 값이 빈값인지 체크합니다.
// !value 하면 생기는 논리적 오류를 제거하기 위해
// 명시적으로 value == 사용
// [], {} 도 빈값으로 처리
const isEmpty = function (value: string | any[]): boolean {
    if (value == "" || value == null || (typeof value == "object" && !Object.keys(value).length)) {
        return true;
    } else {
        return false;
    }
};

export default useForm;

  ```
