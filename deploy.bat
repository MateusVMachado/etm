@echo off
set argType=%1
set mypath=%~dp0
IF /I "%argType%" EQU ""  (
    echo. 
    ECHO Usage: deploy.bat [type]
    echo.
    ECHO where type can be 'front' or 'back'
    echo.
) ELSE (
    
    C:\ETM-Deploy\deploy.script.bat %argType% %mypath%
    
)    