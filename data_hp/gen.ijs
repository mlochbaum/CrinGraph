#! /usr/bin/jconsole

db =: 2e4,~(([%~0.5<.@:+*)~ 10^100&>) 19.4806*2^48%~i.479


gen =: 3 : 0"1
  f =. (1.5&%-%&12) 4 o. (-(<.65*5+{:y)&{) (1.7+{.y) %: db%60
  g =. ^ (-3*2+?2$0) * (%~ 0.1 + 1 o. ^&(-:3+|.y)) (1200*1+2**:y) %~/ db
  crinkle =. 20 %~ (1-+:|.y) +/ .* 0>.g-1.2+(0.4*?0)-{:y
  res =. -10^.(1+*:@]-*)`(^~%&db)/((1.5 3*0.2+0.5 4^~(0.05*0.5-~?0)|@:+-.),60*[:*:+/)1|8*y
  (0.2*480?@$0) + 10 * 1 >. 4 + res + crinkle + f
)


TEMPLATE =: 0 : 0

Frequency	dB	UnweightedDATA
overall dB	0.0 dB
decay	Average
averaging	No Smoothing
source	Totally Made Up


saved	--/-/--, --:-- AM
peak	0.0Hz
)
fmtfr =: TEMPLATE rplc 'DATA';LF,@:,.db ([,TAB,])&":"0 ]
writefr =: ((1+i.5)(],' R',":@[,'.txt'"_)&.><@[) (1!:2~ fmtfr)"_1 (0.5<.@:+])&.(10&*)@]


getbrand =: 3 : 0
  randsel =. ('- -',]) {~ (1|.3 3{.~[) + (0?@$~[) I.~ +/\@:(%+/)@:(7%@:+i.@#)@]
  y ;< ,&.>/ (2 0+(2,2+?9)?@$3) randsel&.> ({.@":"0 i.10) ;~ 'HXADT',y
)

scatter =: #@[ (?~@[{{.) ]
MOD =: <;._1'|Reference|Pro|Gamergate|Bass Style|Deluxe'
mod =: [`;@.(*@#@])&.> scatter&MOD
BRANDS =: ((~.@[,.</.) mod)/|:(#~[:~:{:"1);<@(,.>)/"1 getbrand@> ;:'Auditory Groot Himmler Stonks'
SUFFIXES =: <;._1' Technology Sound Designs '
BRANDS =: 0 2 1 {"1 BRANDS ,. SUFFIXES

fmt_brands =: 3 : 0
  surr =. {.@[ , ] , {:@[
  ind =. '  '&,"1
  fmtF =. ('{"name":"',[,' ',],'","file":"',[,'"}'"_)&>/
  y =. (}: , fmtF^:(0<L.)L:_2@{:)"1 y
  fmtList =. ('['(<0 0)}>) @: (}:,,&' ]'&.>@{:) @: (', '&,&.>)
  fmtBP =. ,&': '@>@[ (],"1~#@]{.[) ;@:(,&','&.>@}:,fmtList&.>@{:)@]
  fields =. ;:'name suffix phones'
  b =. fmtBP/@|:&.>  '"'&(surr^:(-.@e.)) L: 0  fields <@(,.#~a:~:])"1 y
  ;<@(LF,~dtb)"1 (,.'[]') surr ind (,.'{}') surr }. ; ('}, {',ind)&.> b
)

'phone_book.json' (1!:2<)~ fmt_brands BRANDS
((0&{::^:L.@>@[writefr])"_1 [: gen 5(#"_1)0?@$~1 2,~#) ;{:"1 BRANDS

exit ''
