# 삼각형 그리기

<span style="color: red;">경고: 뇌에서 쥐가 날 수 있음. 완독 후엔 반드시 병원을 방문할 것</span>

OpenGL에서 모든건 전부 3D 공간 (3차원)에 있습니다. 하지만 화면이랑 창은 2D네요?
그래서 OpenGL의 핵심 중 하나는 **3차원 좌표를 화면에 맞는 2차원 픽셀로 변환**하는 거 입니다.

3차원 좌표를 2차원 픽셀로 변환하는건 OpenGL의 **graphics pipeline**(그래픽스 파이프라인)이 맡게되는데, 그래픽스 파이프라인은 두 개로 나눌 수 있습니다.

1. 3차원 좌표를 화면에 그리기 위한 2차원 좌표로 변환
2. 2차원 좌표를 실제 색상이 있는 픽셀로 변환

이번 글에선 그래픽스 파이프라인을 훑어보고, 멋진 예술 작품(?)을 만들기 위해 어떻게 써야되는지도 알아봅시다.

그래픽스 파이프라인은 3D 좌표 데이터의 집합을 입력으로 받아, 이를 화면에 표시되는 색상이 있는 2D 픽셀로 변환합니다.

그래픽스 파이프라인은 여러 단계로 나뉘며, 각 단계는 이전 단계의 출력을 입력으로 받아 처리합니다. 각각의 단계는 특정 기능만 할 수 있게 설계됐고, 이런 특성 덕분에 여러 데이터를 병렬로 처리할 수 있습니다.

최신 GPU는 병렬 처리에 최적화되어 있기 때문에, 그래픽스 파이프라인의 데이터를 빠르게 처리할 수 있도록 수천 개의 작은 처리 코어를 갖추고 있습니다. GPU는 파이프라인의 각 단계에서 실행할 작은 프로그램을 사용하며, 이러한 프로그램을 **쉐이더**(Shader)라고 합니다.
(셰이더나 쉐이더나 다 같은 말이니 알아두세요)

> tip! 비유를 하자면 CPU는 학자 몇 명, GPU는 초등학생 수천명인겁니다.
> 쉐이더는 GPU 코어가 실행하는 짧은 코드 조각이고, 코드가 정점 하나당 1번, 화면 후보가 되는 픽셀 조각(프래그먼트) 하나당 1번 실행됩니다.

일부 쉐이더는 개발자가 직접 수정할 수 있습니다. 그래서 기존의 기본 쉐이더를 자기만의 쉐이더로 교체할 수 있습니다.
쉐이더를 직접 작성 할 수 있으니 파이프라인의 특정 부분을 훨씬 더 **세밀하게 제어**할 수 있고, GPU에서 실행되니까 CPU 연산도 줄일 수 있습니다. 쉐이더는 OpenGL Shading Language, 즉 **GLSL**로 작성해야하고, 자세한건 다음 글에서 다루겠습니다.

아래는 그래픽스 파이프라인의 모든 단계를 아주 쉽게 나타낸 그림입니다. (잠시 훑어보세요) 파란색으로 표시된 부분은 우리가 직접 쉐이더를 삽입할 수 있는 단계입니다.

<img src="/assets/opengl/pipeline.png" alt="그림자료1">

(지오메트리 쉐이더가 있는데, 이건 현대 그래픽스 파이프라인에서 성능 저하와 구조적 한계 때문에 점차 도태돼서 요즘은 안씁니다)

아무튼 사진을 보면 또 우리의 뇌를 공격하는 정점 데이터를 픽셀로 바꾸기 위해 필요한 수많은 파이프라이닝 단계들이 있습니다.
이 단계들을 간략하게 소개하자면..

그래픽스 파이프라인의 입력으로 삼각형을 이루기 위한 3개의 3D 좌표 리스트를 넘겨줍니다. (이 배열을 여기서는 **정점 데이터, Vertex Data** 라고 부릅니다.) 정점이란 3D 좌표마다 주어지는 데이터 묶음을 말하는데, 정점의 데이터는 **정점 속성**(Vertex Attribute)으로 표현되며 이 속성에는 우리가 원하는 어떤 값이든 넣을 수 있습니다. 하지만 이것저것 추가하다보면 ~~뇌절~~ 힘들어지기 때문에, 그냥 각 정점이 3차원 위치와 색상 값만 가진다고 하겠습니다.

> tip! OpenGL이 우리가 넘겨준 좌표와 색상 값을 어떻게 처리해야 할지 알 수 있도록 하기 위해, 우리는 이 데이터로 어떤 형태의 렌더링을 하고싶은지 힌트를 줘야합니다. 이 데이터를 점들의 집합으로 렌더링할지 아니면 삼각형들의 집합으로 렌더링 할지, 혹은 하나의 긴 선으로 만들지를 알려줍니다. 이런 힌트들을 **프리미티브**(Primitive) 라고 부르고, OpenGL의 그리기(드로우) 명령을 호출할때 전달합니다. 예시론 <span class="glvk-var-tag">GL_POINTS</span>, <span class="glvk-var-tag">GL_TRIANGLES</span> 그리고 <span class="glvk-var-tag">GL_LINE_STRIP</span> 등이 있습니다.

파이프라인의 첫번째는 단일 정점을 받는 <span class="glvk-def-tag">정점 쉐이더(Vertex Shader)</span>입니다. 정점 쉐이더의 존재 이유는 3차원 좌표를 다른 3차원 좌표로 변환하는 것이며(뭔 소리냐 싶으시겠지만 자세한건 다음에), 정점 속성에 간단한 처리를 할 수 있게 해줍니다.

정점 쉐이더의 출력은 **선택적으로** 지오메트리 쉐이더로 전달됩니다. 지오메트리 쉐이더는 하나의 프리미티브를 이루는 정점 집합을 입력으로 받고, 새로운 정점을 생성하여 새로운 도형(프리미티브)를 생성할 수 있는 기능을 가지고 있습니다. 이 예시에서는 주어진 도형을 기반으로 두번째 삼각형을 생성합니다.

**프리미티브 조립 단계**(Primitive Assembly stage)는 정점 쉐이더(또는 지오메트리 쉐이더)에서 출력된 하나 이상의 프리미티브를 구성하는 모든 정점(만약 GL_POINTS가 선택되었다면 단일 정점)을 입력으로 받아, 주어진 프리미티브 형태에 맞게 정점들을 조립합니다. 이 경우에는 두 개의 삼각형이 조립됩니다.

프리미티브 조립 단계의 출력은 **레스터라이제이션 단계**(rasterization state)로 넘어가 프리미티브 결과들을 화면에 대응하는 픽셀들로 변환됩니다. 출력 결과는 프래그먼트(fragments)가 되어서 프래그먼트 쉐이더(fragment shader)가 사용할 수 있습니다. 프래그먼트 쉐이더가 돌아가기 전에 클리핑(cliping)이 수행됩니다. 클리핑은 모든 화면 밖에 위치한 모든 프래그먼트를 제거하여 성능을 향상 시키는 기술입니다.

> tip! OpenGL에서 프래그먼트는 OpenGL이 단일 픽셀을 렌더링하는 데 필요한 모든 데이터입니다.

프래그먼트 쉐이더(fragment shader)의 주 목적은 **픽셀의 최종 색상을 계산하는 것**입니다. 이떄 보통 모든 고급 OpenGL 효과가 구현됩니다. 프래그먼트 쉐이더는 3D 장면에 대한 데이터(조명, 그림자, 조명의 색상 등)를 포함하고 있으며, 이를 사용하여 최종 픽셀 색상을 계산합니다.

> tip! 이쯤에서 숨 좀 돌립시다. 근데 딱히 할말이 없네요.
> 아재개그나 하겠습니다. 문제: 3월에 대학생을 절대 못 이기는 이유는? 답: '개강하니까'
> 썰렁했다면 죄송합니다.

모든 픽셀에 대한 색상값이 계산된 후, 또 또 또 또 최종 객체는 **알파 테스트와 블랜딩**(Alpha Test & Blending) 단계라고 불리는 한 단계를 더 거칩니다. 이 단계에서는 **프래그먼트의 깊이**(Depth) 와 **스텐실**(Stencil) 값 (이것도 나중에)을 검사하여, 해당 프래그먼트가 다른 객체들보다 앞에 있는지 뒤에 있는지를 확인하고, 필요하다면 *버려집니다*. 또한 이 단계에서는 **알파 값**(알파 값은 객체의 불투명도를 의미합니다. RGBA에 그 A요)을 확인하고 여러 객체를 이에 따라 섞어 표시합니다. 따라서 프레그먼트 쉐이더에서 픽셀의 출력 색상이 계산되었더라도, 여러 삼각형이 동시에 렌더링 되는 상황에서는 최종적으로 화면에 표시되는 픽셀 색상이 완전히 달라질 수도 있습니다.

보시다시피 그래픽스 파이프라인은 상당히 복잡합니다. 정말 많은것들을 설정해야 합니다. 하지만 대부분은 정점 쉐이더와 프래그먼트 쉐이더만 사용하면 됩니다. 아직까지는 나머진 "이런게 있다" 정도로만 넘어가도 됩니다.
지오메트리 쉐이더는 선택이며 일반적으로 기본 쉐이더를 사용합니다. 또한 여기서는 말하지 않았지만 테셀레이션 단계와 변환 피드백 루프가 있으며, 나중에 자세히 다루겠습니다.

현대 OpenGL에서는 기본 제공되는 정점/프래그먼트 쉐이더가 없기 때문에, 반드시 사용자가 직접 작성한 정점 쉐이더와 프레그먼트 쉐이더르 작성해야 합니다. (그러면 앞서 말한 기본 쉐이더를 교체한다는 표현을 정정해야겠네요) 그래서 현대 OpenGL을 처음 배우기가 어렵습니다. 삼각형 하나를 만들때에도 꽤 많은 지식이 필요하기 때문입니다. 하지만 이번 글의 끝에서 삼각형을 직접 만들어보면, 그래픽스 프로그래밍에 대해 훨씬 더 많은걸 알게 될겁니다.

**정리**하자면,

삼각형을 그리기 위해

1. 정점 데이터인 삼각형의 꼭짓점 3개의 좌표와 색깔을 준비하고, (예, 왼쪽 위 빨강, 오른쪽 위 주황, 아래 노랑 등)
2. 정점 쉐이더로 이 좌표들을 화면 안에서 어디에 그릴지 계산하며, (3차원 데이터를 화면에 보이기 위한 2차원 좌표로 변환)
3. 프리미티브 조립으로 삼각형 모양을 만들고,
4. 삼각형을 픽셀 단위로 쪼개서 색칠될 픽셀 후보(프래그먼트)들을 만들고, (레스터화)
5. 프래그먼트 쉐이더로 각 픽셀 후보마다 무슨 색깔로 구성할지 결정하고,
6. 깊이 테스트와 블렌딩으로 계산된 픽셀이 다른 물체 앞에 있으면 그리고, 뒤에 있으면 그리지 않고 투명한 물체가 있으면 투명도 계산해서 섞어주면..
7. 완성!

## 정점 입력

피카소도 모방이 불가능한 무언가 등을 그리기 시작하려면 먼저 정점 데이터를 입력해야 합니다.
OpenGL은 **3D** 그래픽 라이브러리이므로 OpenGL에서 사용하는 모든 좌표는 3차원 공간(x, y, z 좌표)에 있습니다.
OpenGL은 모든 3차원 좌표를 화면의 2차원 픽셀로 "딸깍"해서 변환하지 않습니다. OpenGL은 3개의 축 모두의 좌표가 -1.0에서 1.0 사이에 있을 때만 처리합니다. 이걸 어렵게 말해서 **정규화된 장치 좌표**(normalized device coordinates) 범위 내에 있는 모든 좌표는 처리하고, 이 범위를 벗어난 좌표는 처리되지 않습니다.

삼각형은 꼭짓점이 3개이므로 정점이 3개만 있으면 됩니다.
이걸 정규화 장치 좌표 범위 안에서 float 배열로 정의하면 이렇게 됩니다.

```cpp
float vertices[] = {
    -0.5f, -0.5f, 0.0f,
     0.5f, -0.5f, 0.0f,
     0.0f,  0.5f, 0.0f
};
```

OpenGL은 3D 공간에서 작동하기 때문에 각 꼭지점의 z 좌표가 0.0 인 2D 삼각형을 렌더링하면 삼각형의 깊이가 동일하게 유지되어 2D처럼 보입니다. (얘도 나름대로는 3D입니다. 단지 2D로 보일뿐이죠)

### 정규화된 장치 좌표(NDC)

버텍스 쉐이더에서 정점 좌표가 처리되면, x, y, z 값이 -1.0에서 1.0 사이의 작은 범위인 정규화된 장치 좌표로 변환됩니다. 이 범위를 벗어나는 좌표는 버려지거나 잘려나가 화면에 표시되지 않습니다. 아래 사진에서 정규화된 장치 좌표(z축 제외)로 표현된 삼각형을 확인할 수 있습니다.

<img src="/assets/opengl/ndc.png" alt="이미지자료2">

일반적인 화면 좌표계와 달리 양의 y축은 위쪽 방향을 가리키고 (0,0) 좌표는 그래프의 왼쪽 상단이 아닌 중앙에 위치합니다. 최종적으로 모든 변환된 좌표가 이 좌표 공간 안에 있어야 렌더링됩니다.

이제 정점 데이터가 준비 됐으니 정점 쉐이더 (번역하다보니 계속 정점 쉐이더라고 하는데 버텍스 쉐이더가 맞습니다)의 입력으로 보내야겠죠? 그래서 GPU에 정점 데이터를 저장할 메모리를 생성하고, OpenGL이 해당 메모리를 해석하는 방식을 구성하며, 데이터를 그래픽 카드로 전송하는 방법을 지정해야됩니다.

그러면 정점 쉐이더는 그 메모리에 저장된 데이터를 사용해서 그만큼의 정점만 처리합니다.

이것들(?)은 vertex buffer objects, **VBO**에 저장할겁니다.
이런 버퍼 객체의 장점은

1. 대량 데이터를 한 번에 GPU로 전송하고, 여유가 있으면 데이터를 추가로 더 저장할 수 있습니다.
2. 덕분에 정점을 하나씩 전송할 필요가 없어지므로 CPU 병목이 적어집니다.
3. 데이터가 그래픽 카드 메모리 (VRAM)에 저장되면 정점 쉐이더가 거의 즉시 정점 값에 접근할 수 있어서 더욱 빨라집니다.

VBO는 우리가 아주 초반에 배웠던 OpenGL 객체의 첫 등장입니다. (이걸 기뻐해야할지, 슬퍼해야할지) OpenGL의 다른 객체들과 마찬가지로 버퍼에도 고유한 ID가 부여됩니다. 버퍼 ID 생성은 <span class="glvk-func-tag">glGenBuffers</span>를 사용해 할 수 있습니다.

예시

```cpp
unsigned int VBO;
glGenBuffers(1, &VBO);
```

OpenGL에는 여러 종류의 버퍼 객체가 있습니다. 그중 정점 버퍼 객체의 버퍼 유형은 ` GL_ARRAY_BUFFER `입니다. 기억해두면 좋겠죠.

그리고 서로 다른 버퍼 유형을 가진 버퍼들이라면 여러 개를 동시에 바인딩할 수 있습니다. <span class="glvk-func-tag">glBindBuffer</span> 함수를 사용하여 새로 생성된 버퍼를 GL_ARRAY_BUFFER 대상에 바인딩할 수 있습니다.

```cpp
glBindBuffer(GL_ARRAY_BUFFER, VBO);  
```

이제부터 GL_ARRAY_BUFFER 타깃에 대해 호출하는 모든 버퍼 관련 함수는 현재 바인딩된 버퍼(VBO)를 설정하게 됩니다.
이제 glBufferData 함수를 호출하여 이전에 정의한 정점 데이터를 버퍼로 복사할 수 있습니다.

```cpp
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
```

glBufferData는 현재 바인딩된 버퍼에 사용자 정의 데이터를 복사하는 데 쓰는 함수입니다.

첫번째 인자는 데이터를 복사할 버퍼의 유형(타겟)이고, 두번째 인자는 버퍼에 전달할 데이터의 크기(바이트 단위)입니다. (데이터 크기라 해봤자 별다른건 없고 그냥 sizeof()를 쓰면 됩니다) 세번째 인자는 보낼 데이터입니다.

네번째 인자는 GPU가 그 데이터를 어떻게 관리해야하는지를 지정하는데요, 3가지가 있습니다.

1. GL_STREAM_DRAW: "데이터는 거의 고정이고 몇번만 쓰게 돼요"
2. GL_STATIC_DRAW: "데이터는 거의 고정이고 겁나 자주 쓰게 돼요"
3. GL_DYNAMIC_DRAW: "데이터가 계속 바뀌고 겁나 자주 쓰게 돼요"

삼각형의 위치 데이터가 변할 일은 거의 없고 자주 사용되며 모든 호출에서 동일하게 유지되니까 GL_STATIC_DRAW가 낫겠네요.

## 정점 쉐이더

네 버텍스(Vertex) 쉐이더입니다. (번역하기 힘드네요)

베턱스 쉐이더는 우리가 작성해야 하는 쉐이더들 중 하나인데요, 최신 OpenGL에서는 렌더링을 하려면 최소한의 버텍스 쉐이더랑 프래그먼트 쉐이더를 반드시 작성해야됩니다.
(정말 귀찮군요)
그래서 삼각형을 그리기 위해 쉐이더를 작성해봅시다.
(자세한건 바로 다음 글에서 설명할테니, 이해가 안되셔도 괜찮아요)

일단 아래 코드를 봅시다.

```glsl
#version 330 core
layout (location = 0) in vec3 aPos;

void main()
{
    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
}
```

뭔가 좀 C랑 닮았죠?

일단 쉐이더의 첫 줄은 무조건 버전 선언입니다.
OpenGL 3.3부터는 GLSL에서 선언한 버전이랑 OpenGL 버전이랑 같습니다. (그러면 예전엔 어땠다는거야 ㄷ)
그리고 core 라는 키워드로 코어 프로파일(프로필이라고도 발음함) 명시도 했고요.

> tip! 왜 버전이 330이냐?
> 3.3으로 해도 되지 않았나 싶지만 상대적으로 불안정한 Float 보단 Int를 사용합니다.
> 330 = 3.3, 420 = 4.2 이런 식입니다.

다음으로 in 키워드를 사용해서 버텍스 쉐이더에서 받는 모든 정점 속성을 선언합니다.
지금은 삼각형 위치를 나타낼 좌표 데이터만 필요하니까 하나의 정점 속성만 있으면 됩니다.

GLSL에는 이름 끝에 붙는 숫자에 따라 크기가 달라지는 벡터 타입이 있습니다. 이 숫자는 해당 벡터가 1개부터 4개까지의 부동소수점 값을 가질 수 있음을 의미합니다. (vec3, vec4 등)
각 정점은 3D 좌표를 가지므로 aPos라는 이름으로 vec3 타입의 입력 변수를 정의하면 됩니다.

그리고 layout (location = 0)을 통해 입력 변수의 **위치**(location)를 ​​설정하는데, 이것도 *나중에*

> tip! 벡터란?
> 컴퓨터 그래픽스에서 벡터는 공간상의 위치와 방향을 간결하게 표현할 수 있고, 활용도 높은 수학적 속성을 지니고 있어 매우 자주 사용됩니다. GLSL에서 벡터는 최대 크기가 vec4이며, 각 성분은 vec.x, vec.y, vec.z, vec.w로 접근합니다. 이때 vec.w는 4차원 공간의 좌표가 아닙니다. 3D 그래픽스에서 위치를 올바르게 표현하기 위해 필요한 원근 분할(perspective division) 용도로 사용되는 성분입니다. 벡터에 대한 더 자세한 내용은 다음 장에서 이어집니다.

정점 쉐이더의 출력을 설정하려면 아까 정의한 gl_Position 변수에 위치 데이터를 집어넣어야 됩니다. 이 변수는 vec4 타입이고, <span class="glvk-func-tag">main</span> 함수 끝에서 gl_Position에 설정한 값이 정점 쉐이더의 출력으로 사용됩니다.
입력값이 vec3 크기의 벡터(하필이면)이므로 vec4 크기의 벡터로 **형변환**해야 합니다.
이를 위해 vec3 값을 vec4 생성자에 넣고 w 를 1.0f로 설정합니다(이유는 나중에 설명하겠습니다).

지금 버텍스 쉐이더는 입력 데이터를 아무 처리도 하지 않고 쉐이더의 출력으로 전달하기 때문에 가장 간단한 쉐이더일겁니다. 실무에서는 입력 데이터가 대부분 정규화된 장치 좌표계에 있지 않으므로 먼저 입력 데이터를 OpenGL의 가시 영역 내에 속하는 좌표계로 변환해야 합니다.

## 싱글벙글 쉐이더 컴파일

나중엔 .vert나 .frag 등으로 파일을 나눠서 링킹하고 그래야겠지만,
우린 그거까지 하면 안 그래도 없는 영혼 다 탈탈 털리니 문자열에 우겨넣겠습니다.
(비주얼이 좀 그래도 참아주세요)

```cpp
const char *vertexShaderSource = "#version 330 core\n"
    "layout (location = 0) in vec3 aPos;\n"
    "void main()\n"
    "{\n"
    "   gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);\n"
    "}\0";
```

OpenGL이 쉐이더를 쓰려면 런타임에 동적으로 컴파일 해야되는데요? 일단 ID로 참조할 수 있는 쉐이더 객체부터 만듭시다.
따라서 정점 쉐이더 객체의 아이디 변수는 부호 없는 정수, uint로 선언하고 <span class="glvk-func-tag">glCreateShader</span>로 쉐이더 객체를 생성해야됩니다.

```cpp
unsigned int vertexShader;
vertexShader = glCreateShader(GL_VERTEX_SHADER);
```

`glCreateShader` 함수에 생성할 셰이더 유형을 인자로 전달합니다. 여기서는 정점 셰이더를 생성하므로 `GL_VERTEX_SHADER`를 전달하게 되겠죠?

다음으로 쉐이더 소스를 쉐이더 객체에 연결하고 쉐이더를 컴파일합니다.

```cpp
glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);
glCompileShader(vertexShader);
```

<span class="glvk-func-tag">glShaderSource</span> 함수는 첫 번째 인자로 컴파일된 쉐이더와 연결할 쉐이더 객체를 받습니다. 두 번째 인자는 소스 코드로 전달할 문자열의 개수를 지정하는데, 그냥 1로 두면 됩니다. 세 번째 인자는 실제 버텍스 셰이더의 소스 코드이고, 네 번째 인자는 소스코드의 길이지만 갓픈지엘(GodpenGL?)이 알아서 처리해주므로 NULL로 해도 됩니다.

이제 <span class="glvk-func-tag">glCompileShader</span>를 호출하여 쉐이더를 컴파일합니다.

> tip! glCompileShader를 호출했을때 오류가 나면 예외처리를 하고 싶을때가 있을수도 있죠?
> 그럴땐 이렇게 하면 됩니다
>
> ```cpp
> int  success;
> char infoLog[512];
> glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
> ```
>
> 먼저 컴파일 성공을 나타내는 정수와 오류 메시지(있을 경우)를 저장할 컨테이너를 정의합니다. 그런 다음 `glGetShaderiv` 함수를 사용하여 컴파일이 성공했는지 확인합니다. 컴파일에 실패한 경우 `glGetShaderInfoLog` 함수를 사용하여 오류 메시지를 가져와 출력합니다.
>
> ```cpp
> if(!success)
> {
>     glGetShaderInfoLog(vertexShader, 512, NULL, infoLog);
>     std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
> }

정점 셰이더 컴파일 중에 오류가 발견되지 않으면 컴파일이 완료됩니다.

## 프래그먼트 쉐이더

프래그먼트 쉐이더는 삼각형을 띄우기 위해 작성해야될 두번째이자 마지막 쉐이더입니다.
프래그먼트 쉐이더는 앞에서 말했듯 픽셀의 색상 출력 값을 계산하는 쉐이더입니다. 귀찮은건 싫으니 항상 오렌지색 색상을 출력하도록 하겠습니다.

```glsl
#version 330 core
out vec4 FragColor;

void main()
{
    FragColor = vec4(1.0f, 0.5f, 0.2f, 1.0f);
}
```

> 그래픽스에선 Red, Green, Blue, Alpha로 색깔을 표현합니다. GLSL에선 값들을 0.0~1.0으로 하는데, 이걸 RGBA라고 합니다.

프래그먼트 쉐이더는 단 하나의 출력 변수인 **최종 색상 출력을 정의하는 4 크기의 벡터, vec4**만을 원합니다. 출력값은 out 키워드로 설정할 수 있고 여기서는 FragColor라는 이름으로 지정하겠습니다. 다음으로 vec4값을 색상 출력에 대입했는데, 이는 알파 값이 1.0(완전 불투명)한 주황색 입니다.
프레그먼트 쉐이더를 컴파일하는 건 버텍스 쉐이더랑 비슷하지만, 이땐 쉐이더 타입으로 GL_FRAGMENT_SHADER를 사용합니다.

```cpp
unsigned int fragmentShader;
fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
glShaderSource(fragmentShader, 1, &fragmentShaderSource, NULL);
glCompileShader(fragmentShader);
```

이제 두 쉐이더가 전부 컴파일 됐습니다.
렌더링만 하면 쉐이더는 거의 끝납니다.. 화이팅 (오류가 없길 기도할게요)

### 쉐이더 프로그램

쉐이더 프로그램 객체는 여러 쉐이더들을 *본질적으로 독립된 형태로 존재하던 둘 이상의 격절된 물리적·개념적 개체(Entities)가 공간적 유격, 시간적 지연, 혹은 구조적 비연속성을 극복하고 상호 의존적이며 가역적인 관계망 내로 편입되는 일련의 기하학적·인과적 통합 프로세스*, 한마디로 '연결' 하는겁니다.

방금 고생을 해서 얻은 쉐이더 컴파일 결과물을 쓰려면 그게 쉐이더 프로그램 객체에 링크되고 렌더링때 이 쉐이더 프로그램을 활성화해야하는 매우 지루하고 현학적이며 화나는 일을 해야합니다.
활성화된 쉐이더 프로그램의 쉐이더들이 우리가 렌더 호출을 했을 때 사용됩니다.

쉐이더를 프로그램에 연결할때 각 쉐이더의 출력들은 다음 쉐이더의 입력으로 연결되어야 합니다. 출력이랑 입력이 다르면 그냥 바로 빠꾸(오류) 먹습니다.

프로그램 객체 생성은 매우 EZ합니다.

```cpp
unsigned int shaderProgram;
shaderProgram = glCreateProgram();
```

<span class="glvk-func-tag">glCreateProgram</span> 함수는 프로그램을 생성하고 새로 생성된 프로그램 객체의 ID 주소를 반환합니다. 이제 이전에 컴파일한 쉐이더를 프로그램 객체에 연결하고 <span class="glvk-func-tag">glLinkProgram</span> 함수로 연결해야됩니다.

```cpp
glAttachShader(shaderProgram, vertexShader);
glAttachShader(shaderProgram, fragmentShader);
glLinkProgram(shaderProgram);
```

코드는 생각보다 간단합니다. 셰이더를 프로그램에 연결하고 `glLinkProgram`을 통해 연결하면 됩니다.

> tip! 쉐이더 컴파일때처럼 우리는 쉐이더 프로그램의 링킹의 성공/실패 여부도 확인해야합니다. 그리고 에러를 반환해야 합니다.
> 이번에는 `glGetProgramiv`  와 `glGetProgramInfoLog` 를 사용합니다.
>
> ```cpp
> glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
> if(!success) {
>     glGetProgramInfoLog(shaderProgram, 512, NULL, infoLog);
>     ...
> }
> ```

드디어 프로그램 객체가 생성이 되는데, 이걸 glUseProgram 함수에 전달해야 활성화를 할 수 있습니다.

```cpp
glUseProgram(shaderProgram);
```

이제 모든 쉐이더와 렌더링 콜은 이 프로그램 객체를 사용할 겁니다.

쉐이더 객체를 프로그램에 연결했으니까 이제 삭제해줍시다.

```cpp
glDeleteShader(vertexShader);
glDeleteShader(fragmentShader);
```

(정말 꼴보기 싫군요)

지금까지 데이터를 GPU로 보내고, 버텍스 셰이더와 프래그먼트 셰이더에서 정점 데이터를 어떻게 처리해야 하는지 GPU에 지시하는 어려운 과정을 거쳤지만 아직 구멍이 숭숭 뚫려있습니다. OpenGL은 아직 메모리에 있는 정점 데이터를 어떻게 해석하고 정점 셰이더의 속성에 어떻게 연결해야 하는지 모르기에 우리가 친절하게 그 방법을 알려줘야됩니다.

~~OpenGL이 아기인가요?~~

## 프리티한 버텍스 속성 연결

버텍스 쉐이더를 쓰면 정점 속성 형태로 모든 입력의 모양을 커스텀 할 수 있습니다. 이건 엄청난 유연성을 주지만.. 입력 데이터의 어떤 부분이 버텍스 쉐이더의 어떤 속성에 해당하는지를 수동으로 해야 한다는 심각한 부작용이 있습니다. 즉, 렌더링 전에 OpenGL이 정점 데이터를 어떻게 봐야 할지를 알려줘야됩니다.

정점 데이터는 대충 아래처럼 되어 있습니다.

<img src="/assets/opengl/vertex_attribute_pointer.png" alt="이름뭐로하냐">

- 위치 데이터는 4바이트 float 형태로 저장됩니다.
- 각 위치들은 이런 값 3개로 되어 있습니다.
- 각 3개 값의 집합 사이엔 다른 값이나 빈 값이 없습니다. 다닥다닥 붙어있습니다.
- 데이터의 첫 부분은 버퍼의 맨앞부터 시작입니다.

이런걸 알았으니까 이제 <span class="glvk-func-tag">glVertexAttribPointer</span> 함수를 사용하여.. (이하 생략)은 뻥이고 정점 데이터를 어떻게 해석해야 하는지 알려줄 수 있습니다

```cpp
glVertexAttribPointer(
    0,
    3,
    GL_FLOAT,
    GL_FALSE,
    3 * sizeof(float),
    (void*)0
);
glEnableVertexAttribArray(0);
```

~~전 너무나 착하기 때문에~~ 함수를 풀어서 보여드렸습니다

glVertexAttribPointer 함수는 인자가 너무 많아서 집중 하세요

- 첫 인자는 설정하려는 정점의 속성이 뭔지를 정합니다. 버텍스 쉐이더에서 `layout (location = 0)`으로 position이라는 정점 속성의 location을 0으로 지정했기 때문에 첫 번째 인자로 0을 전달합니다.
- 두번째 인자는 정점 속성의 크기입니다. 위치 속성은 vec3이라 값 3개로 이뤄져 3을 넣습니다.
- 세번째 인자는 데이터 유형을 정하는데 vec3를 사용하므로, GL_FLOAT를 넣습니다. (GLSL에서 모든 벡터는 float 타입)
- 네번째 인자는 정규화 여부입니다. 정수형(int, byte 등) 데이터를 넣고 이 값을 GL_TRUE로 하면, float로 변환될 때 0(부호가 있으면 -1)~1 범위로 정규화됩니다. 지금은 필요 없으니까 GL_FALSE로 합시다
- 다섯번째 인자는 스트라이드라고 하는데, 연속된 정점 속성 값 사이의 간격을 나타냅니다. 다음 위치 데이터까지의 거리가 float 3개(vec3)의 크기이므로 그 값을 넣습니다. 배열이 타이트하게(packed) 붙어 있음을 알고 있다면, 0을 줘서 OpenGL이 자동으로 계산하게 할 수도 있습니다(값들이 촘촘히 붙어 있을 때만).
- 마지막 인자 는 void* 타입의 오프셋(바이트 단위)으로, 버퍼 안에서 해당 속성 데이터가 시작되는 위치입니다. 위치 데이터가 배열의 맨 앞에서 시작하므로 0입니다. 자세한건 나중에

정점 속성 데이터는 VBO가 관리하는 메모리로부터 할당됩니다. 정점 속성과 연결될 VBO는 glVertexAttribPointer 함수가 호출될 때 현재 GL_ARRAY_BUFFER에 바인딩된 객체로 결정됩니다. 따라서 glVertexAttribPointer 호출 전에 특정 VBO가 바인딩되어 있다면, 대상 정점 속성(예: 정점 속성 0)은 해당 VBO의 정점 데이터와 링크됩니다.

이제 OpenGL이 정점 데이터를 해석하는 방식을 지정했으니, `glEnableVertexAttribArray` 함수를 사용하여 정점 속성을 활성화해야 합니다. (정점 속성은 기본적으로 비활성화)

이 모든 과정을 거치면 드디어 모든 설정을 완료한겁니다.

1. 정점 버퍼 객체를 사용하여 버퍼에 정점 데이터를 초기화하고,
2. 정점 셰이더와 프래그먼트 셰이더를 설정했으며,
3. OpenGL에 정점 데이터를 정점 셰이더의 정점 속성에 연결하는 방법을 알려주었습니다.

이제 OpenGL에서 객체를 그리는 코드는 아래처럼 하면 됩니다.

```cpp
// 0. OpenGL에서 사용할 버퍼에 있는 정점 배열을 복사합니다
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 1. 그 다음 정점 속성 포인터를 설정합니다
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);  
// 2. 객체를 렌더링할 때 셰이더 프로그램을 사용합니다
glUseProgram(shaderProgram);
// 3. 이제 그리세요!!
someOpenGLFunctionThatDrawsOurTriangle();
```

근데 이걸 객체를 그릴때마다 반복해야됩니다.
쉽다고요? 근데 객체가 수백개가 넘는다면..
어우 쉽지 않겠죠?

근데, 이런 모든 상태 설정을 하나의 객체에 저장하고, 그 객체를 바인딩해서 상태를 불러올 수 있는 방법이 있다면 어떨까요?

### 정점 배열 객체 VAO

정점 배열 객체(Vertex Array Object, VAO)는 정점 버퍼 객체(VBO)처럼 바인딩할 수 있고, 이후 모든 정점 속성 호출은 VAO 내부에 저장됩니다. 덕분에 정점 속성 포인터를 설정할 때 호출을 한 번만 하면 되고, 객체를 그릴 때마다 VAO를 바인딩하기만 하면 됩니다.

즉 서로 다른 정점 데이터와 속성 구성을 전환하는 일이 단순히 다른 VAO를 바인딩하는 것 만큼 쉬워집니다. 지금까지 설정 했던 모든 상태가 VAO에 저장되기 때문입니다.

코어 OpenGL은 VAO를 반드시 써야됩니다. 우리가 정점 입력값으로 어떤 일을 할지 알게하기 위해서입니다.
만약 VAO를 바인딩하는 것에 실패한다면 OpenGL은 그리는걸 거부할 수 있습니다.

(아기 주제에 거부를..)

정점 배열 객체는 아래 같은 함수 호출로 변경된 상태를 저장합니다.

- `glEnableVertexAttribArray` 또는 `glDisableVertexAttribArray` 호출
- `glVertexAttribPointer`를 통한 정점 속성 구성
- `glVertexAttribPointer` 호출에 의해 정점 속성과 연결된 정점 버퍼 객체

<img src="/assets/opengl/vertex_array_objects.png" alt="진짜이름뭐로하지">

VAO를 생성하는건 VBO랑 비슷합니다.

```cpp
unsigned int VAO;
glGenVertexArrays(1, &VAO);
```

VAO를 쓰려면 VAO를 <span class="glvk-func-tag">glBindVertexArray</span> 함수로 바인딩해야합니다. 그 후에는 해당 VBO와 속성 포인터를 바인딩/구성하고, 나중에 다시 사용할 수 있도록 VAO 바인딩을 해제해야하고요.
객체를 그리려고 할 때는 그냥 원하는 설정이 저장된 VBO를 바인딩하고 나서 그리기 호출을 하면 끝입니다. 코드로 표현하면 이렇습니다.

```cpp
// ..:: 초기화 코드 (객체가 자주 변경되지 않는 한 한 번만 실행) :: ..
// 1. 정점 배열 객체 바인딩
glBindVertexArray(VAO);
// 2. OpenGL에서 사용할 수 있도록 정점 배열을 버퍼에 복사합니다.
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 3. 정점 속성 포인터를 설정합니다.
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);  

[...];

// ..:: 그리기 코드 (렌더링 루프 내) :: ..
// 4. 객체를 그려요~
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
someOpenGLFunctionThatDrawsOurTriangle();
```

이게 다입니다. 이제까지의 고통과 역겨움, 짜증과 인내가 다 이걸 위한거였습니다.
정점 속성 구성과 사용할 VBO를 저장하는 VAO를 만드는 거.
보통 여러 객체를 그려야 할땐 먼저 VAO(그리고 필요한 VBO 정점 속성 포인터)를 생성이랑 설정해 두고 저장합니다. 그리고 특정 객체를 그리려는 순간, 해당 VAO를 가져와서 바인딩 하고, 객체를 그린뒤 다시 VAO를 해제 하면 됩니다.

### 모두가 기다리던 삼각형

원하는 객체를 그리기 위해 OpenGL은 <span class="glvk-func-tag">glDrawArrays</span> 함수를 제공합니다. 이 함수는 현재 활성화된 쉐이더, 이전에 설정해 둔 정점 속성 구성, 그리고 VBO의 정점 데이터(VAO를 통해 간접적으로 연결된)를 사용해 프리미티브를 그립니다.

```cpp
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
glDrawArrays(GL_TRIANGLES, 0, 3);
```

glDrawArrays의 인자들

1. OpenGL 프리미티브 타입(primitive type), 삼각형을 그리고 싶으니 GL_TRIANGLES를 전달합시다
2. 그릴 정점 배열의 시작 인덱스를 지정, 0으로 둡시다.
3. 그릴 정점의 개수를 지정, 3개로 합시다.

이제 코드를 컴파일 해보세요! 오류가 나면 처음부터 읽으셔야 합니다 ㅋㅎ

컴파일이 잘 되면 사진처럼 나올겁니다.

<img src="/assets/opengl/hellotriangle.png" alt="드디어">

전체 소스코드는 [깃허브](https://github.com/JoeyDeVries/LearnOpenGL/blob/master/src/1.getting_started/2.1.hello_triangle/hello_triangle.cpp) 나 [여기](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/2.1.hello_triangle/hello_triangle.cpp) 여기서 받으세요.

## EBO

진짜 마지막으로 정점을 렌더링 할때 확인하고 싶은게 있습니다. 바로 element buffer objects (EBO) 입니다. 예시로 설명해보면

예를 들어, 우리가 아주 거만해져서(?) 삼각형 대신 사각형을 그리고 싶다고 해봅시다. OpenGL은 기본적으로 삼각형을 사용하기 때문에 사각형을 그리려면 두개의 삼각형으로 나눠야 합니다. 이렇게 하려면 다음과 같은 정점 집합이 만들어 집니다.

```cpp
float vertices[] = {
    // 삼각형1
     0.5f,  0.5f, 0.0f,  // top right
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f,  0.5f, 0.0f,  // top left 
    // 삼각형2
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f, -0.5f, 0.0f,  // bottom left
    -0.5f,  0.5f, 0.0f   // top left
};
```

보니까 오른쪽 아래와 왼쪽 위를 두 번씩 지정했죠?
같은 사각형을 6개가 아닌 4개의 정점만으로도 표현할 수 있기 때문에 이는 50%의 오버헤드를 발생시킵니다.
지금은 아무것도 아니지만 겹치는게 1000개가 넘으면 말이 달라지겠죠?
가장 이상적인건 고유한 정점만 저장하고, 이 정점들을 어떤 순서로 그릴지 지정하는 거입니다. 이렇게 하면 사각형에 필요한 정점 4개만 저장하고, 그리는 순서만 지정하면 됩니다. OpenGL은 이걸 해줄까요?

**딸깍**.

다행히 EBO가 그런 방식으로 작동합니다.
EBO는 정점 버퍼 객체와 마찬가지로 OpenGL이 어떤 정점을 그릴지 결정하는 데 사용하는 인덱스를 저장하는 버퍼입니다.
이러한 인덱스 기반 그리기(indexed drawing) 방식이 바로 우리가 해결하고자 하는 문제의 답이 될겁니다.
시작하려면 먼저 (고유한) 정점과 해당 정점을 사각형으로 그릴 인덱스를 지정해야 합니다.

```cpp
float vertices[] = {
     0.5f,  0.5f, 0.0f,  // top right
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f, -0.5f, 0.0f,  // bottom left
    -0.5f,  0.5f, 0.0f   // top left 
};
unsigned int indices[] = {  // note that we start from 0!
    0, 1, 3,   // first triangle
    1, 2, 3    // second triangle
};
```

이제 인덱스를 쓸때 정점을 4개만 쓰면 됩니다. 다음으로 EBO를 만듭시다.

```cpp
unsigned int EBO;
glGenBuffers(1, &EBO);
```

VBO처럼 EBO는 인덱스들을 버퍼에 `glBindBuffer` 함수로 복사할 수 있습니다.
바인딩하는 사이에 이 콜을 넣고 언바인딩까지 할수도 있습니다.

근데 <span class="glvk-var-tag">GL_ELEMENT_ARRAY_BUFFER</span>을 써야됩니다.

```cpp
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW); 
```

버퍼 대상으로 GL_ELEMENT_ARRAY_BUFFER 지정했죠?
마지막으로 해야 할 일은 인덱스 버퍼에서 삼각형을 렌더링하도록 `glDrawArrays` 호출을 `glDrawElements`로 바꾸는 거입니다.
`glDrawElements`를 사용해서 현재 바인딩된 요소 버퍼 객체에 제공된 인덱스를 사용하여 그림을 그립니다.

```cpp
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

첫번째 인자는 `glDrawArrays`처럼 그릴 모드를 지정합니다.
두번째 인자는 그릴 요소의 개수고요.
세번째 인자는 인덱스의 데이터 유형으로, `GL_UNSIGNED_INT` 로 하겠습니다. 
마지막 인자는 EBO 내의 오프셋을 지정하거나 인덱스 배열을 전달할 수 있지만, 0으로 둡니다.

`glDrawElements` 함수는 현재 G`L_ELEMENT_ARRAY_BUFFER` 타겟에 바인딩된 EBO에서 인덱스를 가져옵니다. 즉, 인덱스를 사용하여 객체를 렌더링할 때마다 해당 EBO를 바인딩해야 하므로 다소 번거롭습니다. 다행히 VAO는 EBO 바인딩 정보도 관리합니다. VAO가 바인딩된 상태에서 마지막으로 바인딩된 요소 버퍼 객체가 해당 VAO의 요소 버퍼 객체로 저장됩니다. 따라서 VAO에 바인딩하면 해당 EBO도 자동으로 바인딩됩니다.

<img src="/assets/opengl/vertex_array_objects_ebo.png" alt="제발끝나라">

VAO는 타겟이 GL_ELEMENT_ARRAY_BUFFER 일때 glBindBuffer 콜을 저장해둡니다. 이는 VAO를 언바인드 하기 전에 EBO를 먼저 언바인드 하지 않도록 주의해야함을 의미합니다.
그렇지 않으면 VAO는 EBO가 설정되지 않은 상태가 되버립니다.

이제 초기화랑 그리기 코드는

```cpp
// ..:: Initialization code :: ..
// 1. bind Vertex Array Object
glBindVertexArray(VAO);
// 2. copy our vertices array in a vertex buffer for OpenGL to use
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 3. copy our index array in a element buffer for OpenGL to use
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
// 4. then set the vertex attributes pointers
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);  

[...]
  
// ..:: Drawing code (in render loop) :: ..
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
glBindVertexArray(0);
```

가 됩니다.

프로그램을 컴파일하고 실행하면 사진처럼 보일겁니다.
왼쪽 이미지는 익숙한 사각형이고,
오른쪽 이미지는 와이어프레임 모드(wireframe mode)로 그려진 사각형입니다. 와이어프레임 사각형을 보면 사각형이 실제로 두 개의 삼각형으로 구성되어 있음을 알 수 있습니다.

<img src="/assets/opengl/hellotriangle2.png" alt="아니좀끝나라고">

> tip! 와이어 프레임 모드란? 삼각형을 와이어프레임 모드로 그리려면, glPolygonMode을 사용해 OpenGL이 프리미티브를 그리는 방식을 설정할 수 있습니다.
첫 번째 인자는 모든 삼각형의 앞면과 뒷면에 적용하겠다는 의미이고, 두 번째 인자는 삼각형을 선(Line)으로 그리라는 의미입니다.
이후의 모든 드로잉 호출은 삼각형을 와이어프레임 모드로 렌더링하게 되며, 기본 설정으로 되돌리려면 glPolygonMode(GL_FRONT_AND_BACK, GL_FILL)을 호출하면 됩니다.

(작성중)