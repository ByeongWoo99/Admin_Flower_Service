## 프로젝트 개요
이 프로젝트는 꽃의 사진, 꽃말, 꽃 이름 등의 다양한 정보를 저장하고 관리할 수 있습니다.

## 주요 기능 (프론트엔드)
- **꽃 목록 조회**: 전체 꽃 데이터를 카드, 리스트 등 다양한 UI 컴포넌트로 표시
- **꽃 상세 정보 확인**: 사진, 꽃말, 이름 등의 세부 정보를 모달 또는 상세 페이지로 제공
- **꽃 정보 생성**: 폼 입력을 통해 새로운 꽃 정보를 입력하고, 서버로 전송하여 저장
- **꽃 정보 수정**: 기존 꽃 정보를 편집 폼에서 수정하고 변경사항을 반영
- **꽃 정보 삭제**: Soft Delete 방식을 적용하여 UI상에서 삭제 처리


## 프로젝트 요구 사항

- **Node.js**: v16.0.0 이상 (권장 LTS: v18.x)  
- **npm**: v8.0.0 이상  

## 프로젝트 사용법

```sh
# 프로젝트의 Git URL을 사용하여 레포지토리를 클론
git clone <https://github.com/ByeongWoo99/memorial-flower-garden.git>

# 프로젝트 디렉토리로 이동
cd <YOUR_PROJECT_NAME>

# 의존성 설치
npm i

# 서버를 시작
npm run dev
```

## API 목록

| 기능         | HTTP Method | Api Path                         |
| ------------ | ----------- | -------------------------------- |
| 꽃 상세 조회 | GET         | `/flowers/${seq}?page=${page}`     |
| 꽃 목록 조회 | GET         | `/flowers`                    |
| 꽃 생성      | POST        | `/flowers/new`                   |
| 꽃 정보 수정 | PATCH       | `/flowers/${flower.seq}/edit?page=${page}&search=${search}`                   |
| 꽃 삭제      | DELETE      | `/admin/flowers/${seq}`        |


## 사용된 기술 스택

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

