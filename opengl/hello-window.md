# 창 띄우기

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

(작성중..)