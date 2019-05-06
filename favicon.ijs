#! /bin/jconsole

require 'graphics/png'
read_dsv =: (1 :'<;._2@,&u;._2')(@:(CR-.~[:1!:1@:<'data/',,&'.txt'))
dat =. ".@> 1{"1]2}._8}. TAB read_dsv 'ZKE0 R'
interval =. 16*60%~20-~_30 (<./,>./)\ dat
img =. |: (|.i.16) (1=I.)~"1]_0.5 0+"1<.0.2 _0.2+"1 interval
'favicon.png' writepng~ 256#.0 10 200,"0 1~255<.256 <.@:* img

exit ''
