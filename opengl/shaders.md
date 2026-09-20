# 쉐이더

<span style="color: red;">경고: 수학이 조금 나옴</span>

삼각형 띄우기에서 말했듯 쉐이더는 GPU가 실행하는 조그만한 프로그램입니다. 이런 프로그램은 그래픽스 파이프라인의 특정 단계들에서 실행됩니다.
쉽게 말하자면 쉐이더는 그냥 입력값을 출력값으로 바꾸는거. 그거 하나입니다.

또한 쉐이더는 서로 교류를 못합니다. 격리되어 있거든요. 그래서 쉐이더들의 통신은 오직 입력과 출력을 통해서만 가능합니다.

이전엔 다음에 다음에만 했지만, 이제 각 잡고 시작해봅시다.

## GLSL

쉐이더는 C랑 비슷하게 생긴 **GLSL**이라는 언어로 작섣해야됩니다. GLSL은 Only 그래픽을 위한 언어고, 벡터랑 행렬 조작 등에 유용한 기능들도 있습니다.

쉐이더는 항상 버전 선언으로 시작하고, 그 뒤에 입력/출력 변수 목록, 유니폼 변수, 메인 함수 등이 이어집니다. 각 쉐이더들의 진입점은 C처럼 main이고, 여기서 입력 변수랑 출력 변수를 다루게 될겁니다. 유니폼 변수가 뭐냐고요? 차츰차츰 설명하겠습니다.

쉐이더는 대충 이런 구조입니다.

```glsl
#version version_number
in type in_variable_name;
in type in_variable_name;

out type out_variable_name;
  
uniform type uniform_name;
  
void main()
{
  // 입력 처리하고 여러가지 코드들
  ...
  // 처리한 결과를 출력 변수에 출력!
  out_variable_name = weird_stuff_we_processed;
}
```

버텍스 쉐이더에 각 입력 변수는 정점 속성(vertex attribute)이라고도 합니다. 선언할 수 있는 정점 속성의 최대 개수는 하드웨어마다 다르고요. OpenGL은 항상 최소 16개 4성분 정점 속성을 보장하지만, 일부 기기에선 더 많이 쓸수도 있습니다.
`GL_MAX_VERTEX_ATTRIBS`로 볼 수 있어요.

```glsl
int nrAttributes;
glGetIntegerv(GL_MAX_VERTEX_ATTRIBS, &nrAttributes);
std::cout << "Maximum nr of vertex attributes supported: " << nrAttributes << std::endl;
```

하지만 대부분은 16을 반환할겁니다.

### 타입

GLSL은 다른 언어들처럼 타입을 갖고 있어요. C 개발자라면 익숙해할 int, float, double, uint, bool이 있거든요. 그리고 벡터와 행렬이란 타입도 많이 쓰게될겁니다.
행렬은 나중에 자세히 다룰게요.

#### 벡터

GLSL에서 벡터는 기본 유형들을 담을 수 있는 2~4개 구성 요소로 이루어진 컨테이너입니다. 벡터엔 아래 같은 타입이 있습니다. (n은 구성 요소의 개수입니다. vecn이면 vec4, vec3 이런거에요)

- vecn: n개의 부동소수점(float) 값으로 이뤄진 근-본 벡터
- bvecn: n개의 불리언(bool) 값으로 이뤄진 벡터
- ivecn: n개의 정수(int) 값으로 이뤄진 벡터
- uvecn: n개의 부호 없는 정수(uint) 값으로 이뤄진 벡터
- dvecn: n개의 더블(double) 값으로 이뤄진 vecn의 확장 벡터

대부분 vecn을 쓰게될겁니다.

벡터의 구성 요소는 vec.x 이런식으로 접근할 수 있습니다.
첫번째 요소는 .x, 두번째 요소는 .y, 세번째 요소는 .z, 네번째 요소는 .w로요. GLSL에선 색상엔 rgba를, 텍스처 좌표엔 stpq를 사용해서 매핑이 가능합니다.

벡터 데이터 타입은 스위즐링(swizzling)이라는 아주 흥미로운(?) 구성 요소 선택 기능을 제공합니다. 스위즐링을 사용하면 아래 코드처럼 쓸 수 있습니다.

```glsl
vec2 someVec;
vec4 differentVec = someVec.xyxx;
vec3 anotherVec = differentVec.zyw;
vec4 otherVec = someVec.xxxx + anotherVec.yxzy;
```

(작성중)