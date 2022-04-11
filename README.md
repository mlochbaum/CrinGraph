# 헤드폰 마이너 갤러리 이어폰 FR 측정치 DB/비교 사이트

측정치 비교 바로가기: https://https://jerrybeomsoo.github.io/CrinGraph/graph.html

IEC 711 (60318-4) 호환 이어 커플러 마이크로 측정한 이어폰/IEM의 주파수 응답 측정치를 열람/비교/공유할 수 있는 사이트입니다.

mlochbaum의 CrinGraph 레포지터리를 포크하여 Alt 레이아웃을 활용하였습니다.

현재는 Github Pages로 운영 중이지만, 추후에는 직접 웹사이트를 호스팅할 예정입니다.


## 현재 업로드된 이어폰/IEM 목록

**AKG** : N5005 (Mid High Filter)

**Etymotic Research** : ER4SR (Grey Tri-flange Eartips)

**JBL** : Club Pro+ (냥냐냥님 측정)

**LG** : USB-C Earphones (LG Wing Bundle)

**Moondrop** : Aria (2021) / Starfield (은구리님 측정) / Nekocake (냥냐냥님 측정)

**Sennheiser** : IE 400 pro

**Sonicast** : Direm KASA

**Sony** : IER-M7

**QCY** : T1 (냥냐냥님 측정)

**QDC** : Dmagic Solo (냥냐냥님 측정)

## 측정치 업로드 방법

Room EQ Wizard로 측정하는 방법은 아래 링크에 있는 글로 대체하겠습니다.

https://gall.dcinside.com/mgallery/board/view/?id=newheadphone&no=71325

측정이 완료되어 L/R 채널 별로 TXT 파일을 얻으셨다면 이 Github 레포지터리에 파일을 올려주셔야 합니다.

Github의 Issues 탭에서 새로운 이슈에 파일을 첨부해서 올려주셔도 괜찮으며, 이 레포지터리를 포크하고 수정해 Pull Request를 넣어주시면 더욱 좋습니다.

### TXT 파일은 가능하면 다음과 같은 형식으로 이름을 정해주시기 바랍니다.
* 이어폰명(제조사 이름 X) 샘플 번호 (by 측정한 사람) 채널.txt  

예시로 ABC가 측정한 IER-Z1R인 경우,
 
* IER-Z1R Sample 1 (by ABC) L.txt
* IER-Z1R Sample 1 (by ABC) L.txt

이런 식으로 파일 명을 바꿔주시길 부탁드립니다. 

샘플 수는 레포지터리 내 data 폴더 내 동일한 이어폰이 없는 경우는 1, 있다면 현재 샘플 수에 +1을 해주시면 됩니다.

이렇게 이름을 수정한 TXT 파일들은 Pull Request를 하실 경우 data 폴더 내에 넣어주시면 되고, Issue에 올리셔도 됩니다.

json 수정하는 법은 쓰다보니 귀찮아져서 Pull Request나 Issue 넣어주시면 TXT 파일은 업로드를 하겠고, json 파일은 제가 알아서 처리해드리도록 하겠습니다.

