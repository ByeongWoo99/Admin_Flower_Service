## 프로젝트 개요
이 프로젝트는 꽃의 사진, 꽃말, 꽃 이름 등의 다양한 정보를 저장하고 관리할 수 있습니다.

아래와 같은 기능을 통해 꽃 데이터를 손쉽게 CRUD할 수 있습니다:
- 꽃 목록 조회  
- 꽃 상세 정보 확인 (사진, 꽃말, 이름 등)  
- 새로운 꽃 정보 생성 및 저장  
- 기존 꽃 정보 수정  
- 꽃 정보 삭제(Soft Delete)

## 프로젝트 사용법

```sh
# 프로젝트의 Git URL을 사용하여 레포지토리를 클론합니다.
git clone <https://github.com/ByeongWoo99/memorial-flower-garden.git>

# 프로젝트 디렉토리로 이동합니다.
cd <YOUR_PROJECT_NAME>

# 필요한 종속성을 설치합니다.
npm i

# 서버를 시작합니다.
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

