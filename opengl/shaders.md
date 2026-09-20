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

