# DEG Plot
### installation & run

먼저 git 과 nodejs & npm 이 설치되어 있어야 한다.

- git clone https://github.com/subji/degplot-for-bio.git 
- cd directory
- npm install
- node bin/www or npm install -g nodemon 후 nodemon bin/www 실행
- localhost:3000 <- 3000 은 
	bin 안에 www 에서 8000 을 3000 으로 변경하면 된다.

### data
- cd public/datas
- input data
- 단 현재 파일명은 'degplot.json' 으로 해야 한다.
- data format:
	ex) 
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

