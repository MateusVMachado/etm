cls
@echo off >NUL
set frontPath=C:\ETM-Deploy\etm\
set backPath=C:\ETM-Deploy\etm-backend\
set openFacPath=C:\ETM-Deploy\openfac
set openFacCopyPath=C:\ETM-Deploy\etm\node_modules\openfac
::SET mypath=%~dp0

set argType=%1
set mypath=%2
IF /I "%argType%" EQU "front" (
        ECHO Deploying frontend...
        timeout 2 >NUL
        echo.

        echo Starting deploy process...
        timeout 2 >NUL
        echo Please wait, it can take a while...
        timeout 2 >NUL

        cd "%frontPath%"
        echo ETM: git pull...
        timeout 2 >NUL
        echo.
        git pull
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL

        cd "%openFacPath%"
        echo OpenFac: git pull...
        timeout 2 >NUL
        echo.
        git pull
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL

        echo.
        echo Updating openfac in etm node_modules...
        timeout 2 >NUL
        echo.
        xcopy  /s/y "%openFacPath%" "%openFacCopyPath%"
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL
        
        cd "%frontPath%"

        echo Building application in production mode...
        timeout 2 >NUL
        echo.
        ng build --env=prod 
        cd "%frontPath%"
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL
        echo.
        echo Zipping dist folder...
        timeout 2 >NUL
        7z a dist ./dist/*
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL
        start .
        cd "%mypath%"

) ELSE (
    IF /I "%argType%" EQU "back" (
        ECHO Deploying backend...
        timeout 2 >NUL
        echo.

        echo Starting deploy process...
        timeout 2 >NUL
        echo Please wait, it can take a while...
        timeout 2 >NUL

        cd "%backPath%"
        echo ETM: git pull...
        timeout 2 >NUL
        echo.
        git pull
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL
        
        echo.
        echo Compiling backend...
        npm run grunt
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]

        timeout 2 >NUL
        echo Zipping dist folder...
        timeout 2 >NUL
        7z a dist ./dist/*
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL
        start .
        cd "%mypath%"

    )    
) 

IF /I "%argType%" EQU "all" (
        ECHO Deploying frontend...
        timeout 2 >NUL
        echo.

        echo Starting deploy process...
        timeout 2 >NUL
        echo Please wait, it can take a while...
        timeout 2 >NUL

        cd "%frontPath%"
        echo ETM: git pull...
        timeout 2 >NUL
        echo.
        git pull
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL

        cd "%openFacPath%"
        echo OpenFac: git pull...
        timeout 2 >NUL
        echo.
        git pull
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL

        echo.
        echo Updating openfac in etm node_modules...
        timeout 2 >NUL
        echo.
        xcopy  /s/y "%openFacPath%" "%openFacCopyPath%"
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL
        
        cd "%frontPath%"

        echo Building application in production mode...
        timeout 2 >NUL
        echo.
        ng build --env=prod 
        cd "%frontPath%"
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL
        echo.
        echo Zipping dist folder...
        timeout 2 >NUL
        7z a dist ./dist/*
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL
        start .



        :: BACKEND PART


        ECHO Deploying backend...
        timeout 2 >NUL
        echo.

        echo Starting deploy process...
        timeout 2 >NUL
        echo Please wait, it can take a while...
        timeout 2 >NUL

        cd "%backPath%"
        echo ETM: git pull...
        timeout 2 >NUL
        echo.
        git pull
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL
        
        echo.
        echo Compiling backend...
        npm run grunt
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]

        timeout 2 >NUL
        echo Zipping dist folder...
        timeout 2 >NUL
        7z a dist ./dist/*
        @echo on >NUL
        @echo off >NUL
        echo.
        echo [DONE]
        timeout 2 >NUL
        start .
        cd "%mypath%"
    )    

