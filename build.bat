@echo off
rem -----------------------------------
rem Please copy this file as "build.bat"
rem Edit to put in the correct paths for your system

echo Deleting old user.js files
del /F /Q _normal.user.js _min.user.js 2>nul

echo Joining files into _normal.user.js
type _head.js >_normal.user.js 2>nul
type game-golem\css.js >>_normal.user.js 2>nul
type game-golem\utility.js >>_normal.user.js 2>nul
type game-golem\worker.js >>_normal.user.js 2>nul
type game-golem\worker_*.js >>_normal.user.js 2>nul
type worker__caap.js >>_normal.user.js 2>nul
type object_global.js >>_normal.user.js 2>nul
type object_gm.js >>_normal.user.js 2>nul
type object_html.js >>_normal.user.js 2>nul
type object_caap.js >>_normal.user.js 2>nul
type _main.js >>_normal.user.js 2>nul

echo Cleaning EOL
uddu\dos2unix.exe _normal.user.js

rem ----------------------------------------------------------------------
rem INSTALLED VERSION - Means you only need to hit F5 / refresh in Firefox
rem Just change the path to your firefox installed version, only the '???' should need changing on Windows7

echo Installing new version to Firefox
copy _normal.user.js Castle-Age-Autoplayer.user.js >nul
echo Installing new version to Chrome
copy Castle-Age-Autoplayer.user.js Chrome/Castle-Age-Autoplayer.user.js >nul
copy README Chrome/README >nul
del /F /Q _normal.user.js

rem --------------------------------------------------------------------------------------
rem MINIMISED VERSION - This will fail on errors so use is advised - required for release!
rem Change path to compiler and source - obtain it from here:
rem http://code.google.com/closure/compiler/

echo Creating minimised version (will also show errors)
copy _head.js _min.user.js >nul
"C:\Program Files\Java\jre6\bin\java.exe" -jar compiler.jar --js "Castle-Age-Autoplayer.user.js" >> "_min.user.js"

echo Press any key to quit.
pause>nul