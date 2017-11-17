# DEG Plot

### 설치 및 실행
- git 설치
- nodeJS 설치
- git clone https://github.com/subji/degplot-for-bio.git 
- git 에서 복사한 디렉토리로 이동
- 커맨드 라인에서 npm install 실행
- 커맨드 라인에서 node bin/www or npm install -g nodemon 후 nodemon bin/www 실행
- 실행 후 웹 페이지에서 http://localhost:3000 실행

### 데이터 입력 및 포맷
- public/datas 디렉토리에 'degplot.json' 으로 넣는다.
- data format 은 다음과 같다.
	```
	{
		"data": {
    "pathway_list": [
      {
        "pathway_a": "Cellular Processes",
        "pathway_b": "Cell growth and death",
        "pathway_c": "Apoptosis ",
        "si_down_log_p": 3.4138753844,
        "si_log_p": 5.97747564,
        "si_up_log_p": 2.6033099586
      },
      ....
	}
  ```


