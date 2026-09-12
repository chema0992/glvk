# 창 띄우기

<span style="color: red;">주의: 지루할 수 있음. 아이스 아메리카노 준비 권장</span>

오랜만입니다.
이전 글에서는 컴파일까지만 했었죠?
이 글에선 창을 띄우는것까지를 목표로 해보겠습니다!

일단 프로젝트 파일에 아래 코드가 담겨진 main.cpp을 만들어주세요.

```cpp
#include <glad/glad.h>
#include <GLFW/glfw3.h>
```

> tip! 반드시 glad가 먼저 와야합니다. 네, 반드시요.
> GLFW는 GLAD가 제공하는 함수 주소를 찾습니다.
> 근데 GLAD는 아직 없습니다.
> 어?? 컴파일러는 결국 오류는 뿜어냅니다.

이제 <span class="glvk-func-tag">main</span> 함수를 만들어주세요.
이 함수에 GLFW 코드를 넣을겁니다.

```cpp
int main()
{
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    //glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
  
    return 0;
}
```

코드를 한 줄씩 해석해볼까요?

``` int main() { ```

이 코드는 main 함수 선언을 말합니다. 반환 타입은 int고, 인자는 없습니다. (void)
코드에선 main() 하고 다음줄에 '{'가 있는데, main() 옆에 공백을 추가하고 바로 {를 붙여도 상관은 없습니다.

``` glfwInit(); ```

이 코드는 GLFW를 초기화 하는 함수입니다.
반환값을 가지는데, 성공하면 1, 실패하면 0을 반환합니다.
그래서 아래 코드처럼 예외를 넣을 수 있습니다.

```cpp
if (!glfwInit()) {
    // 초기화 실패 처리
    return -1;
}
```

(!를 붙이면 NOT이라는겁니다. 0의 NOT은 1이므로 if 블록 안은 초기화를 실패했을때 로직이겠죠?)

```cpp
glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
```

이 코드는 glfwWindowHint 함수입니다.
set이 아니라 hint인 이유는.. 창 만드는걸 glfw가 하잖아요?
그래서 hint인겁니다. 참고하라고 말하는거에요.

``` glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);``` 이거는 MAJOR 버전을 3으로 설정,

``` glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3); ``` 이건 MINOR 버전을 3으로 설정하라는 힌트입니다.
쉽게 생각하면 그냥 버전을 3.3으로 한다는거에요.
4.3으로 하고 싶으면 MAJOR을 4로 변경하면 됩니다.

``` glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE); ``` 이건 영어를 읽으실줄 안다면 대충 짐작이 되실텐데요?
이건 프로필을 CORE로 설정하겠다는겁니다.

이제 glfwWindowHint();가 뭔 일을 하는지 대충 알아채셨을겁니다.

1. 첫번째 인자는 설정하려는거
2. 두번째 인자는 설정할 값

설정하려는거를 모두 알고 싶으시면 [GLFW 윈도우 힌트 문서](https://www.glfw.org/docs/latest/window.html#window_hints)에 다 나와 있습니다. (근데 귀찮으시면 안 읽어도 돼요)

``` //glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE); ``` 이 주석은 만약 실행하려는 OS가 MacOS일걸 대비해 LearnOpenGL 저자가 써놓은 코드입니다. 윈도우에서는 필요가 없어서 주석인거에요. 만약 자기가 MacOS다? 그러면 // 지우면 바로 됩니다.

만약 방금 코드들을 컴파일하고 실행했을 때 undefined reference errors가 나면..
GLFW 라이브러리가 제대로 링크 되지 않았다는 의미입니다. [이전 문서](opengl/create-window.md)로 돌아가세요! ㅋㅋ

> tip! 자신의 글카 (그래픽 카드)가 OpenGL 3.3을 지원하는지 확인하세요!
> 이 문서를 읽고 있는 정도의 PC라면 대부분 문제 없겠지만,
> 만약 자기 컴퓨터가 막 15년도 넘고 그랬다! 그러면 Linux에서는 glxinfo 명령어를, Windows에서는 OpenGL Extension Viewer를 사용해서 확인해보세요.
> 지원되는 버전이 OpenGL 3.3 보다 낮고 그래픽 드라이버 업데이트 해도 똑같다? 유감이네요. 실습을 진행할 수 없습니다 ㅜㅜ 이왕이면 새로 사실때 RTX 5060 TI를 추천드려요. (만약 2027년에 이걸 읽고 계신다면 더 좋은게 나왔을지도 모르겠네요)

다음으로 윈도우 객체를 생성해야합니다.

```cpp
GLFWwindow* window = glfwCreateWindow(
    800, // 창 가로 크기 (픽셀)
    600, // 창 세로 크기 (픽셀)
    "LearnOpenGL", // 창 이름
    NULL, // 전체 화면 지정 (NULL이면 창 모드)
    NULL // 리소스 공유 옵션 (대부분 NULL)
);
if (window == NULL)
{
    std::cout << "Failed to create GLFW window" << std::endl;
    glfwTerminate();
    return -1;
}
glfwMakeContextCurrent(window);
```

(원본은 glfwCreateWindow();를 한 줄로 표기했지만 저는 풀어서 표기했습니다.)

<span class="glvk-func-tag">glfwCreateWindow</span> 함수는 창 크기와 이름 같은 인자를 받으면 window 객체를 생성합니다.
window는 그 객체의 주소를 갖고 있는 포인터고요.

``` glfwMakeContextCurrent(window); ```는 어떤 창을 메인으로 할지 정하는거라고 생각하시면 됩니다.

```cpp
GLFWwindow* window1 = glfwCreateWindow(800, 600, "Window 1", NULL, NULL);
GLFWwindow* window2 = glfwCreateWindow(800, 600, "Window 2", NULL, NULL);

glfwMakeContextCurrent(window1); // OpenGL 명령이 window1에 적용됨

glfwMakeContextCurrent(window2); // 이제 OpenGL 명령은 window2에 적용됨
```

## GLAD

이전 장에서 언급했듯, GLAD가 OpenGL의 함수 포인터를 관리하기 때문에 OpenGL 함수를 호출하기 전에 GLAD를 초기화해야 합니다.

```cpp
if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
{
    std::cout << "Failed to initialize GLAD" << std::endl;
    return -1;
}    
```

한마디로 "GLAD를 불러오는 데 실패했다면..."입니다.
GLFW는 glfwGetProcAddress라는 함수를 제공하고, 이 함수는 컴파일 중인 운영체제에 맞는 적절한 함수를 자동으로 정의해 줍니다

## 뷰포트

드디어 렌더링까지 한걸음 남았습니다.

창을 띄우기 전에 OpenGL이 데이터를 어떻게, 창의 어디를 기준으로 렌더링할지 알 수 있도록 렌더링 창의 크기를 OpenGL에 알려줘야 하는데, <span class="glvk-func-tag">glViewport</span> 함수를 통해 설정할 수 있습니다.

```cpp
glViewport(0, 0, 800, 600);
```

첫번째, 두번째 인자는 **창의 왼쪽 아래 모서리 위치를 설정**합니다.
세번째, 네번째 인자는 창의 가로와 세로 넓이입니다.

뷰포트 크기를 반드시 GLFW의 크기만큼 하지 않아도 오류가 안 나는데요,
그럴경우엔 뭘 그렸을때 그 영역에만 표시됩니다.
그러면 남는 공간엔 다른걸 넣을수도 있겠죠?

> tip! 내부적으로 OpenGL은 **glViewport**를 통해 처리된 2D 좌표를 화면 좌표로 변환합니다.
> 예를 들어, 처리된 위치 (-0.5, 0.5)는 최종적으로 화면 좌표 (200, 450)로 매핑됩니다.
> OpenGL에서 처리되는 좌표는 -1에서 1 사이의 값만 있어서 사실상 (-1에서 1) 범위를 (0, 800)과 (0, 600)으로 매핑하는 것입니다.

사용자가 창 크기를 바꾸는 순간 뷰포트도 함께 바뀌어야 합니다.
그래서 창 크기가 조정(바뀔)될 때마다 호출되는 **콜백** 함수를 등록해야 하는데,
이 크기 조정 콜백 함수의 선언(prototype)은 아래 코드와 같습니다.

```cpp
void framebuffer_size_callback(GLFWwindow* window, int width, int height);
```

<span class="glvk-func-tag">framebuffer_size_callback</span> 함수는 첫 번째 인자로 GLFWwindow 객체를 받고, 두 번째 인자로는 새 창 크기를 나타내는 두 개의 int 타입의 값(정수라고 부를게요)을 받습니다. 창 크기가 변경될 때마다 GLFW는 이 함수를 호출하고 사용자가 처리할 수 있도록 적절한 인자를 채워 넣으면 됩니다.

```cpp
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    glViewport(0, 0, width, height);
}  
```

이 함수를 쓰고 싶으면 GLFW한테 알려야 합니다.

```cpp
glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
``` 

창이 처음 표시될 때도 ``` framebuffer_size_callback ``` 함수는 호출되고, 이때 전달되는 인자는 최종적인 창의 너비와 높이입니다. Retina 디스플레이 같은 고해상도 화면에서는 너비와 높이가 원래 값보다 **꽤나 높아질 수도** 있습니다.

OpenGL에서는 다양한 콜백 함수를 설정해서 사용자 정의 함수를 등록할 수 있습니다. 예시로 조이스틱 입력 변경, 오류 메시지 처리 등을 위한 콜백 함수를 만들 수도 있습니다. 이런 콜백 함수들은 **반드시** 창을 생성한 이후, 그리고 렌더링 루프가 시작되기 전에 등록해야 합니다.

## 엔진 준비

웅장합니다. 엔진 준비라니.

기껏 창을 띄워서 그렸는데 바로 종료되면 엄청 화날겁니다. 그래서 프로그램이 종료되라고 명령을 받기 전까지 계속해서 화면을 보여주고 사용자 입력을 받아야 합니다. 그로인해 while loop를 만들어야 하는데, 이걸 render loop(한국어로 할게요)라고 부릅니다.
(python에서 tkinter로 창을 띄울때 ``` window.mainloop() ```를 넣는 이유도 이거 때문입니다.)
아래 코드는 간단한 render loop에 대한 예시입니다.

```cpp
while(!glfwWindowShouldClose(window))
{
    glfwSwapBuffers(window);
    glfwPollEvents();    
}
```

<span class="glvk-func-tag">glfwWindowShouldClose</span> 함수는 렌더 루프의 각 반복이 시작될 때, GLFW가 창을 닫으라는 지시를 받았는지 확인하는 함수입니다. 만약 닫으라는 지시가 있으면 true를 반환하고, 루프는 중지되며 그 후 애플리케이션을 종료할 수 있게 됩니다.

<span class="glvk-func-tag">glfwPollEvents</span> 함수는 키보드 입력이나 마우스 움직임과 같은 이벤트가 발생했는지 확인하고, 윈도우(창) 상태를 업데이트한 후, 우리가 등록한 콜백 함수들을 호출합니다.

> tip! glfwPollEvents();는 'Poll' 방식입니다. 그 말인 즉슨, 루프 한 번 돌때마다 계속 "이벤트 있니? 이벤트 있니? 이벤트 있니?" 하는거란 말입니다. (자세힌 확인하고 다음 코드 실행인데, 어차피 코드엔 창 띄우기만 있으니 같은 말이죠)
> 딱봐도 너무 비효율적이죠? 그래서 ``` glfwWaitEvents(); ``` 라는게 있습니다!
> glfwWaitEvents();는 glfwPollEvents();와는 다르게 그냥 그 스레드가 이벤트를 받을때까지 잠들게 하는겁니다.
> 하지만 용도에 맞게 써야돼요. 실시간성이 필요한 3D 게임 등은 glfwPollEvents();를, 문서 편집기나 디자인 툴처럼 이벤트가 없을땐 멈처도 될땐 glfwWaitEvents();를.

<span class="glvk-func-tag">glfwSwapBuffers</span> 함수는 현재 렌더링 루프 동안 사용된 컬러 버퍼(픽셀마다 색상 정보를 담고 있는 2차원 버퍼)를 화면에 출력용으로 전환합니다. 즉, 백 버퍼와 프론트 버퍼를 교체하여 렌더링 결과를 화면에 표시하게 됩니다.

> tip! 뭔 말인가 싶으실텐데 GPU의 작동 원리를 알면 아실겁니다. 전 엔지니어가 아니므로 간략히 설명하자면, GPU는 모니터 주사율과 맞는다는 보장이 없기에 화면이 깨지는 등 현상이 일어날 수 있는데, 그걸 방지하기 위해 도화지를 2개를 둬서 뒤에서 그리고 화면을 교체하는 방식입니다.

### 이중 버퍼

(아니 이런 방금 tip에 말했는데 번역하다보니 바로 뒤에 나왔네요. 에너지 소모를 줄이기 위해 원본으로 하겠습니다.)
애플리케이션이 단일 버퍼에 이미지를 그릴 때, 결과 이미지에 깜빡임 현상이 발생할 수 있습니다. 이는 최종 출력 이미지가 즉시 그려지는 것이 아니라 픽셀 단위로, 일반적으로 왼쪽에서 오른쪽, 위에서 아래로 순차적으로 그려지기 때문입니다. 렌더링이 진행되는 동안 이미지가 사용자에게 실시간으로 표시되지 않으므로, 결과물에 화면 깜박임 같은 문제(아티팩트)가 발생할 수 있습니다. 이러한 문제를 해결하기 위해 윈도우 기반 애플리케이션은 이중 버퍼 렌더링 방식을 사용합니다. 프런트 버퍼에는 화면에 표시되는 최종 출력 이미지가 저장되고, 모든 렌더링 명령은 백 버퍼에 그려집니다. 모든 렌더링 명령이 완료되면 백 버퍼의 이미지를 프런트 버퍼로 전환하여 이미지가 렌더링되는 동안에도 화면에 표시될 수 있도록 함으로써 앞서 언급한 아티팩트를 제거합니다.

## 마무리할때

렌더 루프가 끝나면, GLFW에서 할당된 모든 리소스를 적절히 정리 및 삭제해 주는 것이 좋겠죠? 그래서 main 함수의 마지막에 ``` glfwTerminate ``` 함수를 호출하여 리소스를 정리할 수 있습니다.

```cpp
glfwTerminate();
return 0;
```

그러면 모든 리소스가 정리되고 프로그램이 정상적으로 종료됩니다. 이제 main.cpp을 컴파일해 보세요.
문제가 없다면 아래 사진처럼 나올겁니다.

![자료1](/assets/opengl/hellowindow.png)

이 단순하고 지루하고 이제까지의 과정이 허탈하게 느껴질 정도로 쓸모없게 생긴 검은 화면이 나왔다면.. **퍼펙트!!** 잘 하신겁니다!
(만약 아주 재미있고, 깜빡이며, 해결해야할 일이 더 생겼다면.. 유감이네요. 더 읽어보세요) 원하는 화면을 얻지 못했거나 모든 요소가 어떻게 연결되는지 이해가 안 된다면 [전체 코드](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/1.2.hello_window_clear/hello_window_clear.cpp)를 확인하세요.

## 입력

GLFW에서 입력 제어 기능도 구현하고 싶다면, GLFW의 여러 입력 함수를 이용하면 됩니다. 창 이름과 키를 인자로 받는 GLFW의 <span class="glvk-func-tag">glfwGetKey</span> 함수를 사용할 겁니다. 이 함수는 현재 그 키가 눌려 있는지 여부를 Return합니다. 모든 입력 관련 코드를 체계적으로 관리하기 위해 processInput 함수를 만들겠습니다.

```cpp
void processInput(GLFWwindow *window)
{
    if(glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);
}
```

(작성중)