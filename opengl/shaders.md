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

원본 벡터에 해당 구성 요소가 있는 한에선 최대 4개의 문자를 조합해 새 벡터(동일한 타입으로)를 만들 수 있습니다. 하지만 vec2의 .z 구성 요소에 접근하는 등은 안됩니다. 또한 벡터를 다른 벡터 생성자 호출의 인수로 전달해서 필요한 인수의 수를 줄일 수도 있습니다.

```glsl
vec2 vect = vec2(0.5, 0.7);
vec4 result = vec4(vect, 0.0, 0.0);
vec4 otherResult = vec4(result.xyz, 1.0);
```

따라서 벡터는 **모든 종류의 입력 및 출력에 사용할 수 있는 아주 유연한 타입**입니다. 이 글들을 보시다보면 벡터를 아주 창의적으로 다루는 법을 알게 될겁니다 ㅎ

### 인앤아웃

in and out입니다. ~~이상한 생각하지 마세요~~

쉐이더는 그 자체로도 아주 훌륭하지만 전체의 일부기 때문에 각 쉐이더에 입력과 출력을 지정해서 변수를 이동시킬 수 있게 해야됩니다. GLSL엔 그래서 in과 out 키워드가 있는데, 각 쉐이더는 이 키워드를 사용해서 입력과 출력을 지정할 수 있습니다. 출력 변수가 다음 쉐이더의 입력 변수의 타입과 일치하면 해당 변수가 전달되고요. 하지만 버텍스 쉐이더와 프래그먼트 쉐이더는 조금씩 다릅니다.

버텍스 쉐이더는 어떤 형태로든 입력을 받아야 정상적으로 작동합니다. 버텍스 쉐이더는 다른 쉐이더들과는 다르게 입력을 정점 데이터에서 직접 받는데, 정점 데이터의 구조를 정의하기 위해 입력 변수에 위치 메타데이터를 지정하여 CPU에게 정점 속성을 설정할 수 있도록 하면 됩니다. 저번에 `layout (location = 0)`을 했었죠? 그 말인 즉슨 버텍스 쉐이더는 레이아웃 지정이 필요하단겁니다.

> tip! `layout (location = 0)`를 생략하고 OpenGL 코드에서 `glGetAttribLocation`을 통해 속성 위치를 쿼리하는 것도 되지만, 정점 셰이더에서 설정하는 게 이해하기도 쉽고 작업량을 줄여줍니다.

또 다른 예외(문제아)는 프래그먼트 쉐이더인데, 이 쉐이더는 최종 출력 색상을 만들어내야하기 때문에 vec4 타입의 색상 출력 변수가 필요합니다. (RGBA기 때문이죠)
만약 프래그먼트 쉐이더에서 출력 색상을 정하지 않으면 그 쉐이더의 컬러 버퍼 출력은 정의되지 않은 상태가 됩니다. 그럴땐 대부분 검정색이나 흰색으로 바뀝니다.

따라서 쉐이더에서 쉐이더로 데이터를 보내려면 송신 쉐이더에서 출력을 선언하고 수신 쉐이더에서 같은 유형의 입력을 선언해야됩니다. 유형과 이름이 동일하면 OpenGL은 그 변수를 연결해서 쉐이더끼리 통신을 할 수 있습니다.

이제 실습! 저번 코드 남아있죠? 없으면 다시 받아가시고요
쉐이더만 바꿔주세요.

버텍스 쉐이더

```glsl
#version 330 core
layout (location = 0) in vec3 aPos; // the position variable has attribute position 0
  
out vec4 vertexColor; // specify a color output to the fragment shader

void main()
{
    gl_Position = vec4(aPos, 1.0); // see how we directly give a vec3 to vec4's constructor
    vertexColor = vec4(0.5, 0.0, 0.0, 1.0); // set the output variable to a dark-red color
}
```

프래그먼트 쉐이더

```glsl
#version 330 core
out vec4 FragColor;
  
in vec4 vertexColor; // the input variable from the vertex shader (same name and same type)  

void main()
{
    FragColor = vertexColor;
}
```

버텍스 쉐이더에서 설정한 vec4 타입 출력으로 vertexColor 변수를 선언하고 프래그먼트에서 같은 vertexColor 입력을 선언한게 보이죠? 둘 다 동일한 유형과 이름을 갖기 때문에 프래그먼트 쉐이더의 vertexColor는 버텍스 쉐이더의 vertexColor랑 연결됩니다. 버텍스 쉐이더에서 진한 빨간색으로 설정했기 때문에 결과도 진한 빨간색일겁니다.

(아래처럼 나와야 정상)

<img src="/assets/opengl/shaders.png" alt="쉐이더출력">

와 드디어 베턱스 쉐이더에서 프래그먼트 쉐이더로 값을 전달하는걸 성공했어요! 이제 **특별하게** 프래그먼트 쉐이더로 색상을 전달해볼까요? ㅎㅎ

### 유니폼

이런 망할 **유니폼**(Uniforms)은 CPU에서 실행되는 프로그램의 데이터를 GPU의 쉐이더로 전달하는 또 다른 방법입니다. 하지만 유니폼은 정점 속성과는 약간 차이가 있어요!

1. 유니폼은 전역 변수로, 프로그램의 어디서든 모든 쉐이더에서 접근할 수 있습니다.
2. 유니폼 값을 어떤 값으로 설정하든, 해당 값은 재설정되거나 업데이트될 때까지 그대로 유지됩니다.

유니폼 변수를 선언하려면 `uniform` 키워드와 타입, 이름을 추가하기만 하면 그만입니다. 이러면 쉐이더에서 유니폼 변수를 사용할 수가 있어요.

이번엔 유니폼 변수로 삼각형의 색상을 설정해봅시다!

```glsl
#version 330 core
out vec4 FragColor;
  
uniform vec4 ourColor; // we set this variable in the OpenGL code.

void main()
{
    FragColor = ourColor;
}
```

프래그먼트 쉐이더에서 `uniform vec4 outColor` 를 선언하고, 프래그먼트의 출력 색상을 이 uniform의 값으로 설정하는 코드입니다. Uniform은 전역 변수라 어떤 쉐이더에서든 정의가 가능하고, 프래그먼트 쉐이더로 뭐를 전달하기 위해 굳이 버텍스 쉐이더를 거칠 필요도 없어졌습니다.
이 uniform을 버텍스 쉐이더에서 쓰지도 않으니까 버텍스 쉐이더에서 따로 정의할 필요도 없고요.

> tip! 전혀 사용되지 않는 유니폼 변수를 선언하면 컴파일러가 컴파일된 버전에서 해당 변수를 조용히 제거하는데, 이로 인해 아주 골치 아픈 오류가 발생합니다.

유니폼이 비어 있으니 데이터를 넣어봅시다.
먼저 쉐이더에서 유니폼 속성의 인덱스와 위치를 찾아야 합니다. 유니폼의 인덱스와 위치를 찾았으면 그제서야 값 업데이트가 가능해집니다. 그냥 하나만 주는게 아니라 시간이 지날때마다 다른 색깔을 주게 해봅시다.

```glsl
float timeValue = glfwGetTime();
float greenValue = (sin(timeValue) / 2.0f) + 0.5f;
int vertexColorLocation = glGetUniformLocation(shaderProgram, "ourColor");
glUseProgram(shaderProgram);
glUniform4f(vertexColorLocation, 0.0f, greenValue, 0.0f, 1.0f);
```

먼저 `glfwGetTime()` 함수로 실행 시간을 초 단위로 가져옵니다. 그 다음 sin 함수로 색깔을 0.0~1.0 사이로 변환하고 결과를 `greenValue`에 저장합니다.

그 다음 `glGetUniformLocation` 함수를 사용해서 ourColor 유니폼의 위치를 가져옵니다. 이 함수엔 인자로 쉐이더 프로그램과 위치를 가져올 유니폼의 이름을 넣으면 됩니다. 만약 -1이 반환됐다면 위치를 못찾았다는 의미입니다.
`glUniform4f`함수로 유니폼 값을 설정할 수 있ㅅㅎ습니다. 유니폼 위치를 찾는건 쉐이더 프로그램을 먼저 쓸 필요가 없었지만, 유니폼 값을 업데이트하려면 먼저 그 프로그램을 써야됩니다. (`glUseProgram`으로요) 이래야 하는 이유는 현재 활성화된 쉐이더 프로그램에 유니폼 값을 설정하기 때문입니다.

OpenGL은 기본적으로 C 라이브러리이기 때문에 함수 오버로딩을 지원하지 않습니다. 그래서 함수를 여러 유형으로 함수를 호출할 주 있는 경우, 필요한 각 유형에 대해 새 함수를 정의해야됩니다. `glUniform4f`가 그 예입니다.

이 함수는 설정하려는 uniform의 타입에 따라 특정 접미사(postfixes)를 요구합니다. 대충 그 예시는 아래와 같습니다.

- f: float 값을 기대
- i: int 값을 기대
- ui: unsigned int 값을 기대
- 3f: 3개의 float 값을 기대
- fv: float 벡터를 기대

(기대한다니 정말 건방지네요)

OpenGL 옵션을 설정할땐 그냥 자신의 타입에 맞는 함수 버전을 고르면 됩니다.
uniform에 4개의 float 값을 전달해야하니 glUniform4f를 쓰면 됩니다. (fv도 가능)

이제 uniform 변수의 값을 설정하는 방법을 알았으니 이제 렌더링해봅시다. 색깔이 점점 변하게 만들고 싶으면, uniform을 매 프레임마다 업데이트 해야됩니다. 한 번만 하면 그냥 한가지 색깔만 쭉 있겠죠? 따라서 매 렌더 루프마다 greenValue를 계산하고 그 값을 uniform에 업데이트 해야됩니다.

```cpp
while(!glfwWindowShouldClose(window))
{
    // input
    processInput(window);

    // render
    // clear the colorbuffer
    glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    // be sure to activate the shader
    glUseProgram(shaderProgram);
  
    // update the uniform color
    float timeValue = glfwGetTime();
    float greenValue = sin(timeValue) / 2.0f + 0.5f;
    int vertexColorLocation = glGetUniformLocation(shaderProgram, "ourColor");
    glUniform4f(vertexColorLocation, 0.0f, greenValue, 0.0f, 1.0f);

    // now render the triangle
    glBindVertexArray(VAO);
    glDrawArrays(GL_TRIANGLES, 0, 3);
  
    // swap buffers and poll IO events
    glfwSwapBuffers(window);
    glfwPollEvents();
}
```

이 코드는 이전 코드에서 비교적 간단하게 수정된 버전입니다.
uniform을 잘 업데이트 했으면 영상처럼 될겁니다.

<video src="/assets/opengl/shaders.mp4" controls width="100%">
  브라우저가 비디오 태그를 지원하지 않습니다.
</video>

(작성중)