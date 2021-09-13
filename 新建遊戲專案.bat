@SET /P name=請輸入新建專案名稱：
call ionic start %name% blank --type=angular
cd %name%
call npm link --save three
call npm link --save @types/three
call npm install cordova
cd..
xcopy "%cd%\_file\." "%cd%\%name%\" /E /Y
call ionic cordova platform add android

PAUSE